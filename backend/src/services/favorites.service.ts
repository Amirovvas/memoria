import { pool } from "../db/pool";
import { apiErrors } from "../utils/apiErrors";

const ID_RE = /^[a-z0-9-]{1,64}$/;

const checkId = (id: string) => {
  if (!ID_RE.test(id)) throw apiErrors.badRequest("Некорректный id шаблона");
  return id;
};

/** Template ids, newest first. */
export const listFavorites = async (userId: string) => {
  const { rows } = await pool.query<{ template_id: string }>(
    "SELECT template_id FROM favorites WHERE user_id = $1 ORDER BY created_at DESC",
    [userId],
  );
  return rows.map((r) => r.template_id);
};

export const addFavorite = async (userId: string, templateId: string) => {
  await pool.query("INSERT INTO favorites (user_id, template_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [
    userId,
    checkId(templateId),
  ]);
};

export const removeFavorite = async (userId: string, templateId: string) => {
  await pool.query("DELETE FROM favorites WHERE user_id = $1 AND template_id = $2", [userId, checkId(templateId)]);
};
