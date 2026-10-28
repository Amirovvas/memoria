/**
 * One-off: copies the template pictures from frontend/public into the public "assets" bucket,
 * so the site keeps working after they are removed from the repo, plus the gift music library
 * from backend/assets/music (stored as "music/<file>"). Safe to run again (upserts).
 *
 *   npm run assets:upload
 *   npm run assets:upload -- perfect.m4a ordinary.mp3   (only these music files, no pictures)
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { storageReady, uploadObject } from "../services/storage.service";

const SOURCE = join(__dirname, "../../../frontend/public");
const MUSIC = join(__dirname, "../../assets/music");
const TYPES: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
const AUDIO: Record<string, string> = { ".mp3": "audio/mpeg", ".m4a": "audio/mp4" };

/** "Moon (1).jpg" -> "moon-1.jpg": the same rule the frontend's asset() uses. */
export const assetName = (file: string) => file.toLowerCase().replace(/ \((\d+)\)/, "-$1").replace(/\s+/g, "-");

const list = (dir: string, keep: (file: string) => boolean) => (existsSync(dir) ? readdirSync(dir).filter(keep) : []);

async function main() {
  if (!storageReady()) throw new Error("Set SUPABASE_URL and SUPABASE_SECRET_KEY in backend/.env first");
  const only = process.argv.slice(2);
  const files = only.length ? [] : list(SOURCE, (f) => !!TYPES[extname(f).toLowerCase()]);
  for (const file of files) {
    const url = await uploadObject("assets", assetName(file), readFileSync(join(SOURCE, file)), TYPES[extname(file).toLowerCase()]!);
    console.log(`${file} -> ${url}`);
  }
  const tracks = list(MUSIC, (f) => !!AUDIO[extname(f).toLowerCase()] && (!only.length || only.includes(f)));
  for (const file of tracks) {
    const type = AUDIO[extname(file).toLowerCase()]!;
    const url = await uploadObject("assets", `music/${assetName(file)}`, readFileSync(join(MUSIC, file)), type);
    console.log(`${file} -> ${url}`);
  }
  console.log(`Uploaded ${files.length} pictures and ${tracks.length} tracks`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
