import { pool } from "../db/pool";
import { apiErrors } from "../utils/apiErrors";

/** Same shape the frontend keeps in memory; times are epoch milliseconds. */
export interface Project {
  id: string;
  name: string;
  category: string;
  templateId?: string;
  doc: unknown;
  createdAt: number;
  updatedAt: number;
  openedAt?: number;
  deletedAt?: number;
}

interface ProjectRow {
  id: string;
  name: string;
  category: string;
  template_id: string | null;
  doc: unknown;
  created_at: Date;
  updated_at: Date;
  opened_at: Date | null;
  deleted_at: Date | null;
}

const ID_RE = /^p-[A-Za-z0-9_-]{1,40}$/;
const MAX_DOC_BYTES = 512 * 1024;

const toProject = (r: ProjectRow): Project => ({
  id: r.id,
  name: r.name,
  category: r.category,
  ...(r.template_id ? { templateId: r.template_id } : {}),
  doc: r.doc,
  createdAt: r.created_at.getTime(),
  updatedAt: r.updated_at.getTime(),
  ...(r.opened_at ? { openedAt: r.opened_at.getTime() } : {}),
  ...(r.deleted_at ? { deletedAt: r.deleted_at.getTime() } : {}),
});

const checkId = (id: string) => {
  if (!ID_RE.test(id)) throw apiErrors.badRequest("Некорректный id проекта");
  return id;
};

const checkName = (raw: unknown) => {
  const name = typeof raw === "string" ? raw.trim() : "";
  if (!name) throw apiErrors.badRequest("Введите название");
  return name.slice(0, 120);
};

const checkDoc = (doc: unknown) => {
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) throw apiErrors.badRequest("Некорректный коллаж");
  // photos are URLs into Storage, never inline data, so a collage stays a few kilobytes
  const json = JSON.stringify(doc);
  if (json.includes('"data:image/')) throw apiErrors.badRequest("Фото должны быть загружены в хранилище");
  if (Buffer.byteLength(json) > MAX_DOC_BYTES) throw apiErrors.badRequest("Коллаж слишком большой");
  return json;
};

/** Epoch ms or null from the client; anything else is a bad request. */
const checkTime = (raw: unknown) => {
  if (raw === null) return null;
  if (typeof raw !== "number" || !Number.isFinite(raw)) throw apiErrors.badRequest("Некорректная дата");
  return new Date(raw);
};

export const listProjects = async (userId: string) => {
  const { rows } = await pool.query<ProjectRow>(
    "SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC",
    [userId],
  );
  return rows.map(toProject);
};

export const createProject = async (
  userId: string,
  id: string,
  body: { name?: unknown; category?: unknown; templateId?: unknown; doc?: unknown },
) => {
  const category = typeof body.category === "string" && body.category ? body.category.slice(0, 40) : "";
  if (!category) throw apiErrors.badRequest("Не указана категория");
  const templateId = typeof body.templateId === "string" ? body.templateId.slice(0, 64) : null;
  const { rows } = await pool.query<ProjectRow>(
    `INSERT INTO projects (id, user_id, name, category, template_id, doc, opened_at)
     VALUES ($1, $2, $3, $4, $5, $6, now())
     ON CONFLICT (id) DO NOTHING
     RETURNING *`,
    [checkId(id), userId, checkName(body.name), category, templateId, checkDoc(body.doc)],
  );
  if (!rows[0]) throw apiErrors.conflict("Проект с таким id уже существует");
  return toProject(rows[0]);
};

/** Changes any of name, doc, openedAt, deletedAt (null restores from the trash). */
export const updateProject = async (
  userId: string,
  id: string,
  body: { name?: unknown; doc?: unknown; openedAt?: unknown; deletedAt?: unknown },
) => {
  const sets: string[] = [];
  const values: unknown[] = [checkId(id), userId];
  const set = (column: string, value: unknown) => {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  };
  if (body.name !== undefined) set("name", checkName(body.name));
  if (body.doc !== undefined) set("doc", checkDoc(body.doc));
  if (body.openedAt !== undefined) set("opened_at", checkTime(body.openedAt));
  if (body.deletedAt !== undefined) set("deleted_at", checkTime(body.deletedAt));
  if (!sets.length) throw apiErrors.badRequest("Нечего сохранять");
  // opening a project is not an edit, so it does not move it up in "recently changed"
  if (body.name !== undefined || body.doc !== undefined) sets.push("updated_at = now()");

  const { rows } = await pool.query<ProjectRow>(
    `UPDATE projects SET ${sets.join(", ")} WHERE id = $1 AND user_id = $2 RETURNING *`,
    values,
  );
  if (!rows[0]) throw apiErrors.notFound("Проект не найден");
  return toProject(rows[0]);
};

export const deleteProject = async (userId: string, id: string) => {
  const { rowCount } = await pool.query("DELETE FROM projects WHERE id = $1 AND user_id = $2", [checkId(id), userId]);
  if (!rowCount) throw apiErrors.notFound("Проект не найден");
};

export const emptyTrash = async (userId: string) => {
  await pool.query("DELETE FROM projects WHERE user_id = $1 AND deleted_at IS NOT NULL", [userId]);
};
