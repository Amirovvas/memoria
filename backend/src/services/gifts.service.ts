import { randomBytes, randomUUID } from "node:crypto";
import { pool } from "../db/pool";
import { apiErrors } from "../utils/apiErrors";
import { publicUrl, removeObjects, uploadObject } from "./storage.service";

/**
 * The music library; the files are in the "assets" bucket as music/<id>.<ext>, mp3 unless given
 * (see scripts/upload-assets.ts). Keep in step with TRACKS in frontend/src/lib/gifts.ts.
 */
const LIBRARY: [id: string, title: string, artist: string, ext?: string][] = [
  ["nechaev-18", "18", "Nechaev"],
  ["ordinary", "Ordinary", "Alex Warren"],
  ["perfect", "Perfect", "Ed Sheeran", "m4a"],
  ["see-you-again", "See You Again", "Wiz Khalifa"],
  ["forever-young", "Forever Young", "Alphaville"],
  ["a-thousand-years", "A Thousand Years", "Christina Perri"],
  ["those-eyes", "Those Eyes", "New West"],
  ["romantic", "Romantic", "Francisco Alvear"],
  ["true-love", "True Love", "Ahjay Stelino"],
  ["wedding-harp", "Wedding Harp", "Francisco Alvear"],
  ["loving-you-is-easy", "Loving You Is Easy", "Michael Ramir C."],
  ["possible-dreams", "Possible Dreams", "Eugenio Mininni"],
  ["lounging-by-moonlight", "Lounging By Moonlight", "Ahjay Stelino"],
  ["old-letter", "Old Letter", "Michael Ramir C."],
  ["forever-in-my-heart", "Forever in My Heart", "Michael Ramir C."],
  ["fifth-of-february", "Fifth of February", "Michael Ramir C."],
  ["warm-happy", "Warm Happy", "The_Mountain"],
  ["just-keep-walking", "Just Keep Walking", "Michael Ramir C."],
  ["tears-of-joy", "Tears of Joy", "Michael Ramir C."],
  ["a-special-feeling", "A Special Feeling", "Michael Ramir C."],
  ["traveling-along", "Traveling Along", "Ahjay Stelino"],
  ["wind-leaves", "Wind Leaves", "Eugenio Mininni"],
  ["spanish-heart", "Spanish Heart", "Michael Ramir C."],
  ["party-like-its-your-birthday", "Party Like It's Your Birthday", "Michael Ramir C."],
  ["feel-alive", "Feel Alive", "Michael Ramir C."],
  ["house-one", "House One", "Francisco Alvear"],
  ["midnight-funk", "Midnight Funk", "Michael Ramir C."],
  ["life-is-a-dream", "Life is a Dream", "Michael Ramir C."],
  ["oh-lord", "Oh Lord", "Arulo"],
  ["summer-pop", "Pop", "Andrew Ev"],
  ["lo-fi-01", "Lo-Fi 01", "Lily J"],
  ["sweet-september", "Sweet September", "Arulo"],
  ["day-dreamin", "Day Dreamin' with U", "Michael Ramir C."],
  ["dreamy-jazz", "Dreamy Jazz", "Francisco Alvear"],
  ["lo-fi-02", "Lo-Fi 02", "Lily J"],
  ["serene-view", "Serene View", "Arulo"],
  ["valley-sunset", "Valley Sunset", "Alejandro Magaña"],
  ["drawing-the-sky", "Drawing the Sky", "Eugenio Mininni"],
  ["skyline", "Skyline", "Eugenio Mininni"],
  ["discover", "Discover", "Eugenio Mininni"],
];

const TRACKS: Record<string, { title: string; path: string }> = Object.fromEntries(
  LIBRARY.map(([id, title, artist, ext = "mp3"]) => [id, { title: `${title} — ${artist}`, path: `music/${id}.${ext}` }]),
);

const OCCASIONS = ["birthday", "anniversary", "wedding", "love", "thanks", "other"];
const ANIMATIONS = ["envelope", "box", "cake"];
const GAMES = ["none", "scratch", "puzzle", "tictactoe"];

/** What a friend's phone receives: no owner, only what the page shows. */
export interface PublicGift {
  id: string;
  recipient: string;
  occasion: string;
  message: string;
  signature: string;
  finale: string;
  animation: string;
  game: string;
  music: { url: string; title: string } | null;
  collages: { url: string; w: number; h: number }[];
  createdAt: number;
}

export interface Gift extends PublicGift {
  /** the first collage, shown in the list of the user's gifts */
  cover: string | null;
}

type StoredMusic = { track: string } | { path: string; title: string };

interface GiftRow {
  id: string;
  recipient: string;
  occasion: string;
  message: string;
  signature: string;
  finale: string;
  animation: string;
  game: string;
  music: StoredMusic | null;
  collages: { path: string; w: number; h: number }[];
  created_at: Date;
}

const COLUMNS = "id, recipient, occasion, message, signature, finale, animation, game, music, collages, created_at";

const musicOf = (m: StoredMusic | null) => {
  if (!m) return null;
  if ("track" in m) {
    const t = TRACKS[m.track];
    return t ? { url: publicUrl("assets", t.path), title: t.title } : null;
  }
  return { url: publicUrl("gifts", m.path), title: m.title };
};

const toGift = (r: GiftRow): Gift => {
  const collages = r.collages.map((c) => ({ url: publicUrl("gifts", c.path), w: c.w, h: c.h }));
  return {
    id: r.id,
    recipient: r.recipient,
    occasion: r.occasion,
    message: r.message,
    signature: r.signature,
    finale: r.finale,
    animation: r.animation,
    game: r.game,
    music: musicOf(r.music),
    collages,
    cover: collages[0]?.url ?? null,
    createdAt: r.created_at.getTime(),
  };
};

/** Every file a gift owns in the "gifts" bucket; removed together with the gift. */
const filesOf = (r: Pick<GiftRow, "music" | "collages">) => [
  ...r.collages.map((c) => c.path),
  ...(r.music && "path" in r.music ? [r.music.path] : []),
];

/* ---------- files ---------- */

const FILE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/webm": "webm",
};
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

/** Stores a collage snapshot or the user's own song under their folder of the "gifts" bucket. */
export const saveGiftFile = async (userId: string, body: unknown, contentType: string | undefined) => {
  const type = contentType?.split(";")[0]!.trim() ?? "";
  const ext = FILE_TYPES[type];
  if (!ext) throw apiErrors.badRequest("Поддерживаются коллажи JPG и музыка MP3, M4A, AAC, OGG, WAV");
  if (!Buffer.isBuffer(body) || !body.length) throw apiErrors.badRequest("Пустой файл");
  const image = ext === "jpg";
  if (body.length > (image ? MAX_IMAGE_BYTES : MAX_AUDIO_BYTES)) {
    throw apiErrors.badRequest(image ? "Коллаж больше 5 МБ" : "Аудиофайл больше 15 МБ");
  }
  const path = `${userId}/${randomUUID()}.${ext}`;
  // the bucket only accepts the canonical audio types
  const stored = type === "audio/x-m4a" ? "audio/mp4" : type === "audio/x-wav" ? "audio/wav" : type;
  const url = await uploadObject("gifts", path, body, stored);
  return { path, url };
};

/* ---------- gifts ---------- */

const text = (raw: unknown, max: number, field: string, required = true) => {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (required && !value) throw apiErrors.badRequest(`Заполните поле «${field}»`);
  if (value.length > max) throw apiErrors.badRequest(`Поле «${field}» длиннее ${max} символов`);
  return value;
};

const ownPath = (userId: string, raw: unknown, ext: RegExp) => {
  const path = typeof raw === "string" ? raw : "";
  const [folder, file] = path.split("/");
  if (folder !== userId || !file || !/^[0-9a-f-]{36}\.\w+$/.test(file) || !ext.test(file)) {
    throw apiErrors.badRequest("Файл подарка не найден");
  }
  return path;
};

const checkCollages = (userId: string, raw: unknown) => {
  if (!Array.isArray(raw) || !raw.length) throw apiErrors.badRequest("Выберите хотя бы один коллаж");
  if (raw.length > 20) throw apiErrors.badRequest("В подарке может быть до 20 коллажей");
  return raw.map((c) => {
    const w = Number(c?.w);
    const h = Number(c?.h);
    if (!(w > 0 && h > 0 && w <= 4000 && h <= 4000)) throw apiErrors.badRequest("Некорректный размер коллажа");
    return { path: ownPath(userId, c?.path, /\.jpg$/), w: Math.round(w), h: Math.round(h) };
  });
};

const checkMusic = (userId: string, raw: unknown): StoredMusic | null => {
  if (raw == null) return null;
  const m = raw as { track?: unknown; path?: unknown; title?: unknown };
  if (typeof m.track === "string") {
    if (!TRACKS[m.track]) throw apiErrors.badRequest("Такого трека нет в библиотеке");
    return { track: m.track };
  }
  return { path: ownPath(userId, m.path, /\.(mp3|m4a|aac|ogg|wav|webm)$/), title: text(m.title, 120, "Название трека") };
};

/** 10 letters and digits: about 59 bits, so a link cannot be guessed. */
const newId = () => {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  return Array.from(randomBytes(10), (b) => abc[b % abc.length]).join("");
};

export const createGift = async (userId: string, body: Record<string, unknown>) => {
  const occasion = String(body.occasion ?? "");
  const animation = String(body.animation ?? "");
  const game = String(body.game ?? "none");
  if (!OCCASIONS.includes(occasion)) throw apiErrors.badRequest("Выберите повод");
  if (!ANIMATIONS.includes(animation)) throw apiErrors.badRequest("Выберите анимацию");
  if (!GAMES.includes(game)) throw apiErrors.badRequest("Такой игры нет");
  const values = [
    newId(),
    userId,
    text(body.recipient, 60, "Имя получателя"),
    occasion,
    text(body.message, 2000, "Поздравление"),
    text(body.signature, 60, "Подпись", false),
    text(body.finale, 80, "Финальная надпись"),
    animation,
    JSON.stringify(checkMusic(userId, body.music)),
    JSON.stringify(checkCollages(userId, body.collages)),
    game,
  ];
  const { rows } = await pool.query<GiftRow>(
    `INSERT INTO gifts (id, user_id, recipient, occasion, message, signature, finale, animation, music, collages, game)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING ${COLUMNS}`,
    values,
  );
  return toGift(rows[0]!);
};

export const listGifts = async (userId: string) => {
  const { rows } = await pool.query<GiftRow>(
    `SELECT ${COLUMNS} FROM gifts WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId],
  );
  return rows.map(toGift);
};

/** Anyone with the link may open a gift; that is the point of the QR code. */
export const getPublicGift = async (id: string): Promise<PublicGift> => {
  if (!/^[A-Za-z0-9]{10}$/.test(id)) throw apiErrors.notFound("Подарок не найден");
  const { rows } = await pool.query<GiftRow>(`SELECT ${COLUMNS} FROM gifts WHERE id = $1`, [id]);
  if (!rows[0]) throw apiErrors.notFound("Подарок не найден");
  const { cover: _cover, ...gift } = toGift(rows[0]);
  return gift;
};

export const deleteGift = async (userId: string, id: string) => {
  const { rows } = await pool.query<Pick<GiftRow, "music" | "collages">>(
    "DELETE FROM gifts WHERE id = $1 AND user_id = $2 RETURNING music, collages",
    [id, userId],
  );
  if (!rows[0]) throw apiErrors.notFound("Подарок не найден");
  // the gift is gone once its row is; the files are swept up afterwards, so nobody waits on Storage
  const files = filesOf(rows[0]);
  void removeObjects("gifts", files).catch((err) => console.error(`Gift ${id}: files left in Storage`, files, err));
};
