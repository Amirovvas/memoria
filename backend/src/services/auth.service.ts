import bcrypt from "bcryptjs";
import { DatabaseError } from "pg";
import { pool } from "../db/pool";
import { apiErrors } from "../utils/apiErrors";
import { issueTokens, revokeAllForUser } from "./token.service";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

const ROUNDS = 12;
// Compared against when the email is unknown, so a miss takes as long as a wrong password.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", ROUNDS);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toUser = (r: UserRow): User => ({
  id: r.id,
  name: r.name,
  email: r.email,
  createdAt: r.created_at.toISOString(),
});

const str = (v: unknown) => (typeof v === "string" ? v : "");

const checkName = (raw: unknown) => {
  const name = str(raw).trim();
  if (!name) throw apiErrors.badRequest("Введите имя");
  if (name.length > 80) throw apiErrors.badRequest("Имя слишком длинное");
  return name;
};

const checkEmail = (raw: unknown) => {
  const email = str(raw).trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) throw apiErrors.badRequest("Некорректный email");
  return email;
};

const checkPassword = (raw: unknown) => {
  const password = str(raw);
  if (password.length < 8) throw apiErrors.badRequest("Пароль должен быть не короче 8 символов");
  // bcrypt only uses the first 72 bytes
  if (Buffer.byteLength(password) > 72) throw apiErrors.badRequest("Пароль слишком длинный");
  return password;
};

const isEmailTaken = (e: unknown) => e instanceof DatabaseError && e.code === "23505";
const EMAIL_TAKEN = () => apiErrors.conflict("Пользователь с таким email уже существует");

export const registerUser = async (body: { name?: unknown; email?: unknown; password?: unknown }) => {
  const name = checkName(body.name);
  const email = checkEmail(body.email);
  const passwordHash = await bcrypt.hash(checkPassword(body.password), ROUNDS);

  try {
    const { rows } = await pool.query<UserRow>(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
      [name, email, passwordHash],
    );
    const user = toUser(rows[0]!);
    return { user, tokens: await issueTokens(user.id) };
  } catch (e) {
    throw isEmailTaken(e) ? EMAIL_TAKEN() : e;
  }
};

export const loginUser = async (body: { email?: unknown; password?: unknown }) => {
  const email = str(body.email).trim().toLowerCase();
  const password = str(body.password);
  if (!email || !password) throw apiErrors.badRequest("Введите email и пароль");

  const { rows } = await pool.query<UserRow>("SELECT * FROM users WHERE lower(email) = $1", [email]);
  const row = rows[0];
  const valid = await bcrypt.compare(password, row?.password_hash ?? DUMMY_HASH);
  if (!row || !valid) throw apiErrors.unauthorized("Неверный email или пароль");

  return { user: toUser(row), tokens: await issueTokens(row.id) };
};

export const getProfile = async (userId: string) => {
  const { rows } = await pool.query<UserRow>("SELECT * FROM users WHERE id = $1", [userId]);
  if (!rows[0]) throw apiErrors.notFound("Пользователь не найден");
  return toUser(rows[0]);
};

/** Changes name and/or email; a new password also needs the current one. */
export const updateProfile = async (
  userId: string,
  body: { name?: unknown; email?: unknown; currentPassword?: unknown; newPassword?: unknown },
) => {
  const { rows } = await pool.query<UserRow>("SELECT * FROM users WHERE id = $1", [userId]);
  const current = rows[0];
  if (!current) throw apiErrors.notFound("Пользователь не найден");

  const name = body.name === undefined ? current.name : checkName(body.name);
  const email = body.email === undefined ? current.email : checkEmail(body.email);
  let passwordHash = current.password_hash;
  if (body.newPassword !== undefined) {
    const ok = await bcrypt.compare(str(body.currentPassword), current.password_hash);
    if (!ok) throw apiErrors.badRequest("Текущий пароль указан неверно");
    passwordHash = await bcrypt.hash(checkPassword(body.newPassword), ROUNDS);
  }

  try {
    const updated = await pool.query<UserRow>(
      `UPDATE users SET name = $2, email = $3, password_hash = $4, updated_at = now()
       WHERE id = $1 RETURNING *`,
      [userId, name, email, passwordHash],
    );
    if (passwordHash !== current.password_hash) await revokeAllForUser(userId);
    return toUser(updated.rows[0]!);
  } catch (e) {
    throw isEmailTaken(e) ? EMAIL_TAKEN() : e;
  }
};
