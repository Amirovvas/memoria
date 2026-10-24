import { randomUUID } from "node:crypto";
import { pool } from "../db/pool";
import { apiErrors } from "../utils/apiErrors";
import { publicUrl, removeObjects, uploadObject } from "./storage.service";

export interface Photo {
  id: string;
  url: string;
  name: string;
}

interface PhotoRow {
  id: string;
  path: string;
  name: string;
}

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_BYTES = 10 * 1024 * 1024;

const toPhoto = (r: PhotoRow): Photo => ({ id: r.id, url: publicUrl("photos", r.path), name: r.name });

export const listPhotos = async (userId: string) => {
  const { rows } = await pool.query<PhotoRow>(
    "SELECT id, path, name FROM photos WHERE user_id = $1 ORDER BY created_at DESC",
    [userId],
  );
  return rows.map(toPhoto);
};

/**
 * Stores one image in the "photos" bucket under the user's folder. The random file name is
 * what keeps a photo private: the bucket is public, but nobody can guess its URL.
 */
export const savePhoto = async (userId: string, body: unknown, contentType: string | undefined, rawName: unknown) => {
  const ext = contentType ? TYPES[contentType.split(";")[0]!.trim()] : undefined;
  if (!ext) throw apiErrors.badRequest("Поддерживаются JPG, PNG и WEBP");
  if (!Buffer.isBuffer(body) || !body.length) throw apiErrors.badRequest("Пустой файл");
  if (body.length > MAX_BYTES) throw apiErrors.badRequest("Фото больше 10 МБ");

  const name = (typeof rawName === "string" ? rawName : "").trim().slice(0, 120) || `photo.${ext}`;
  const path = `${userId}/${randomUUID()}.${ext}`;
  await uploadObject("photos", path, body, `image/${ext === "jpg" ? "jpeg" : ext}`);
  const { rows } = await pool.query<PhotoRow>(
    "INSERT INTO photos (user_id, path, name) VALUES ($1, $2, $3) RETURNING id, path, name",
    [userId, path, name],
  );
  return toPhoto(rows[0]!);
};

/**
 * Removes a photo from the library. The file stays in Storage while any of the user's collages
 * still shows it, so deleting from the library never leaves an empty frame behind.
 */
export const deletePhoto = async (userId: string, id: string) => {
  if (!/^[0-9a-f-]{36}$/.test(id)) throw apiErrors.badRequest("Некорректный id фото");
  const { rows } = await pool.query<{ path: string; in_use: boolean }>(
    `DELETE FROM photos WHERE id = $1 AND user_id = $2
     RETURNING path, EXISTS (
       SELECT 1 FROM projects WHERE user_id = $2 AND position(photos.path IN doc::text) > 0
     ) AS in_use`,
    [id, userId],
  );
  const row = rows[0];
  if (!row) throw apiErrors.notFound("Фото не найдено");
  if (!row.in_use) await removeObjects("photos", [row.path]);
};
