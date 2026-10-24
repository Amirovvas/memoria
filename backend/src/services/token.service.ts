import { createHash, randomBytes } from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import { config } from "../config";
import { pool } from "../db/pool";
import { apiErrors } from "../utils/apiErrors";

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

export const signAccessToken = (userId: string) =>
  jwt.sign({}, config.jwtSecret, {
    subject: userId,
    expiresIn: config.accessTokenTtl as SignOptions["expiresIn"] & string,
  });

/** Returns the user id, or throws 401 for a missing, forged or expired token. */
export const verifyAccessToken = (token: string) => {
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    if (typeof payload === "string" || !payload.sub) throw new Error("bad payload");
    return payload.sub;
  } catch {
    throw apiErrors.unauthorized("Сессия истекла, войдите снова");
  }
};

export const issueTokens = async (userId: string): Promise<Tokens> => {
  const refreshToken = randomBytes(32).toString("base64url");
  await pool.query(
    `INSERT INTO refresh_tokens (token_hash, user_id, expires_at)
     VALUES ($1, $2, now() + make_interval(days => $3))`,
    [hash(refreshToken), userId, config.refreshTokenDays],
  );
  return { accessToken: signAccessToken(userId), refreshToken };
};

// A browser that reloads mid-refresh never stores the new cookie and comes back with the old one,
// so an exchanged token stays usable this long instead of logging the user out.
const REUSE_GRACE_SECONDS = 30;

/** Exchanges the refresh token for a fresh pair; after the grace period the old one stops working. */
export const rotateTokens = async (refreshToken: string | undefined) => {
  if (!refreshToken) throw apiErrors.unauthorized("Требуется вход");
  const { rows } = await pool.query<{ user_id: string }>(
    `UPDATE refresh_tokens SET replaced_at = coalesce(replaced_at, now())
     WHERE token_hash = $1 AND expires_at > now()
       AND (replaced_at IS NULL OR replaced_at > now() - make_interval(secs => $2))
     RETURNING user_id`,
    [hash(refreshToken), REUSE_GRACE_SECONDS],
  );
  const row = rows[0];
  if (!row) throw apiErrors.unauthorized("Сессия истекла, войдите снова");
  await pool.query(
    "DELETE FROM refresh_tokens WHERE user_id = $1 AND (expires_at <= now() OR replaced_at < now() - make_interval(secs => $2))",
    [row.user_id, REUSE_GRACE_SECONDS],
  );
  return issueTokens(row.user_id);
};

export const revokeRefreshToken = async (refreshToken: string | undefined) => {
  if (!refreshToken) return;
  await pool.query("DELETE FROM refresh_tokens WHERE token_hash = $1", [hash(refreshToken)]);
};

/** Signs the user out everywhere, e.g. after a password change. */
export const revokeAllForUser = async (userId: string) => {
  await pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [userId]);
};
