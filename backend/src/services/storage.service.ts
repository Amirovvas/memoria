import { config } from "../config";
import { apiErrors } from "../utils/apiErrors";

/** Public buckets in Supabase Storage: template pictures, the photos people upload and gift files. */
export type Bucket = "assets" | "photos" | "gifts";

const headers = () => {
  const key = config.supabaseSecretKey;
  // new sb_secret_ keys go only in `apikey`; a legacy service_role JWT also needs `Authorization`
  return key.startsWith("sb_") ? { apikey: key } : { apikey: key, Authorization: `Bearer ${key}` };
};

export const storageReady = () => Boolean(config.supabaseUrl && config.supabaseSecretKey);

const ensureReady = () => {
  if (!storageReady()) throw apiErrors.unavailable("Хранилище фото не настроено на сервере");
};

export const publicUrl = (bucket: Bucket, path: string) =>
  `${config.supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;

// template pictures never change; a deleted user photo should stop being served from the CDN within a day
const CACHE_SECONDS: Record<Bucket, number> = { assets: 31_536_000, photos: 86_400, gifts: 86_400 };

export const uploadObject = async (bucket: Bucket, path: string, body: Buffer, contentType: string) => {
  ensureReady();
  const res = await fetch(`${config.supabaseUrl}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: { ...headers(), "Content-Type": contentType, "Cache-Control": `max-age=${CACHE_SECONDS[bucket]}`, "x-upsert": "true" },
    body: new Uint8Array(body),
  });
  if (!res.ok) throw new Error(`Storage upload failed (${res.status}): ${await res.text()}`);
  return publicUrl(bucket, path);
};

export const removeObjects = async (bucket: Bucket, paths: string[]) => {
  if (!paths.length) return;
  ensureReady();
  const res = await fetch(`${config.supabaseUrl}/storage/v1/object/${bucket}`, {
    method: "DELETE",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify({ prefixes: paths }),
  });
  if (!res.ok) throw new Error(`Storage delete failed (${res.status}): ${await res.text()}`);
};
