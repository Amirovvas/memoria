/** Surprise pages a friend opens from a QR code: occasions, ready-made wishes, openings and music. */

import { Cake, CircleSlash, Coins, Flower2, Gem, Gift, Grid3x3, Heart, HeartHandshake, Mail, Puzzle, Sparkles, type LucideIcon } from "lucide-react"
import { asset } from "./photos"

export type Occasion = "birthday" | "anniversary" | "wedding" | "love" | "thanks" | "other"
export type Opening = "envelope" | "box" | "cake"
export type Game = "none" | "scratch" | "puzzle" | "tictactoe"

export interface GiftCollage {
  url: string
  w: number
  h: number
}

export interface GiftMusic {
  url: string
  title: string
}

/** What the surprise page receives from GET /api/public/gifts/:id. */
export interface PublicGift {
  id: string
  recipient: string
  occasion: Occasion
  message: string
  signature: string
  finale: string
  animation: Opening
  /** a mini game played before the surprise opens */
  game: Game
  music: GiftMusic | null
  collages: GiftCollage[]
  createdAt: number
}

export interface Gift extends PublicGift {
  cover: string | null
}

/** The surprise page draws its own heart under the closing line, so the lines carry no emoji. */
export const OCCASIONS: { id: Occasion; label: string; icon: LucideIcon; finale: string }[] = [
  { id: "birthday", label: "День рождения", icon: Cake, finale: "С днём рождения!" },
  { id: "anniversary", label: "Годовщина", icon: HeartHandshake, finale: "С нашей годовщиной!" },
  { id: "wedding", label: "Свадьба", icon: Gem, finale: "Совет да любовь!" },
  { id: "love", label: "Любовь", icon: Heart, finale: "Я тебя люблю" },
  { id: "thanks", label: "Спасибо", icon: Flower2, finale: "Спасибо, что ты есть" },
  { id: "other", label: "Просто так", icon: Sparkles, finale: "Улыбнись!" },
]

export const OCCASION_BY_ID = Object.fromEntries(OCCASIONS.map((o) => [o.id, o])) as Record<Occasion, (typeof OCCASIONS)[number]>

/** `{name}` becomes the recipient's name. Short and warm: they are read on a phone, letter by letter. */
const WISHES: Record<Occasion, string[]> = {
  birthday: [
    "{name}, с днём рождения! Пусть этот год будет щедрым на поводы улыбаться, на людей рядом и на тихие счастливые вечера.",
    "{name}, сегодня твой день! Желаю, чтобы мечты сбывались чуть быстрее, чем ты успеваешь их загадывать.",
    "С днём рождения, {name}! Спасибо за каждый смех, каждую историю и каждое «а помнишь?». Пусть впереди их будет ещё больше.",
    "{name}, пусть в новом году жизни будет много света, вкусного кофе, дальних дорог и людей, которые тебя берегут.",
    "{name}, ты делаешь этот мир теплее. Пусть он отвечает тебе тем же — сегодня и всегда. С днём рождения!",
    "{name}, с праздником! Здоровья, смелости и того самого чувства, когда всё складывается как надо.",
  ],
  anniversary: [
    "{name}, ещё один год вместе — и я снова и снова выбираю тебя. Спасибо за каждый наш день.",
    "{name}, с годовщиной! Наши фото — это только малая часть того, как мне с тобой хорошо.",
    "Сколько бы ни прошло времени, рядом с тобой — мой дом. С нашей годовщиной, {name}!",
    "{name}, спасибо за смех, за поддержку и за все наши «мы». Пусть впереди будет ещё больше общих историй.",
  ],
  wedding: [
    "{name}, поздравляю с самым красивым днём! Пусть ваш дом будет полон света, смеха и нежности.",
    "{name}, пусть любовь, которая сегодня в каждом взгляде, остаётся с вами на долгие-долгие годы.",
    "С днём свадьбы, {name}! Берегите друг друга и не забывайте удивлять — так, как сегодня.",
    "{name}, желаю вам семейного тепла, общих мечт и уютных вечеров только вдвоём.",
  ],
  love: [
    "{name}, просто хочу напомнить: ты — лучшее, что со мной случалось.",
    "{name}, в каждом из этих кадров есть кусочек счастья. И почти в каждом — ты.",
    "{name}, спасибо, что ты рядом. С тобой даже обычный день становится особенным.",
    "{name}, люблю тебя за то, какой ты есть, и за то, какой становлюсь я рядом с тобой.",
  ],
  thanks: [
    "{name}, спасибо тебе за поддержку, тепло и за то, что ты всегда рядом, когда нужно.",
    "{name}, ты сделал(а) для меня больше, чем думаешь. Это маленькое спасибо — от всего сердца.",
    "{name}, спасибо за все наши моменты. Пусть эти фото напоминают, как много ты для меня значишь.",
    "{name}, мир стал добрее, потому что в нём есть ты. Спасибо!",
  ],
  other: [
    "{name}, просто так — чтобы ты улыбнулся(ась). Посмотри, сколько у нас хороших воспоминаний!",
    "{name}, собрал(а) для тебя немного тёплых моментов. Пусть они поднимут настроение.",
    "{name}, без повода, но от всего сердца. Ты замечательный человек!",
    "{name}, пусть сегодняшний день будет чуточку лучше вчерашнего. Это тебе.",
  ],
}

/** Three different wishes for the occasion; `seed` rotates through the list on «Ещё варианты». */
export function suggestWishes(occasion: Occasion, name: string, seed = 0) {
  const pool = WISHES[occasion]
  const who = name.trim() || "Дорогой человек"
  return Array.from({ length: Math.min(3, pool.length) }, (_, i) => pool[(seed * 3 + i) % pool.length].replaceAll("{name}", who))
}

export const GAMES: { id: Game; label: string; text: string; icon: LucideIcon }[] = [
  { id: "none", label: "Без игры", text: "Сюрприз откроется сразу", icon: CircleSlash },
  { id: "scratch", label: "Скретч-карта", text: "Стереть золотой слой и увидеть коллаж", icon: Coins },
  { id: "puzzle", label: "Пазл", text: "Собрать коллаж из перепутанных кусочков", icon: Puzzle },
  { id: "tictactoe", label: "Крестики-нолики", text: "Обыграть сюрприз — и он откроется", icon: Grid3x3 },
]

export const OPENINGS: { id: Opening; label: string; text: string; icon: LucideIcon }[] = [
  { id: "envelope", label: "Конверт", text: "Раскрывается, из него выезжает открытка", icon: Mail },
  { id: "box", label: "Подарочная коробка", text: "Крышка слетает, вылетает конфетти", icon: Gift },
  { id: "cake", label: "Торт со свечами", text: "Свечи гаснут, если провести по ним пальцем", icon: Cake },
]

export interface Track {
  id: string
  title: string
  artist: string
  /** genre and length, shown under the title */
  hint: string
  url: string
}

const track = (id: string, title: string, artist: string, hint: string, ext = "mp3"): Track => ({
  id,
  title,
  artist,
  hint,
  url: asset(`music/${id}.${ext}`),
})

/**
 * Tracks in the "assets" bucket (see backend/src/scripts/upload-assets.ts), one list in the order shown.
 * The songs on top were added by the site owner; the rest are Pixabay and Mixkit tracks, free for
 * commercial use without attribution. The ids must match LIBRARY in backend/src/services/gifts.service.ts.
 */
export const TRACKS: Track[] = [
  track("nechaev-18", "18", "Nechaev", "Поп · 2:02"),
  track("ordinary", "Ordinary", "Alex Warren", "Поп-баллада · 3:11"),
  track("perfect", "Perfect", "Ed Sheeran", "Баллада · 4:23", "m4a"),
  track("see-you-again", "See You Again", "Wiz Khalifa", "Хип-хоп · 3:49"),
  track("forever-young", "Forever Young", "Alphaville", "Синти-поп · 3:48"),
  track("a-thousand-years", "A Thousand Years", "Christina Perri", "Баллада · 4:48"),
  track("those-eyes", "Those Eyes", "New West", "Инди-поп · 3:40"),
  track("romantic", "Romantic", "Francisco Alvear", "Фортепиано и струнные · 2:39"),
  track("true-love", "True Love", "Ahjay Stelino", "Соул · 1:55"),
  track("wedding-harp", "Wedding Harp", "Francisco Alvear", "Арфа и струнные · 2:21"),
  track("loving-you-is-easy", "Loving You Is Easy", "Michael Ramir C.", "Дрим-поп · 1:56"),
  track("possible-dreams", "Possible Dreams", "Eugenio Mininni", "Фортепиано · 2:39"),
  track("lounging-by-moonlight", "Lounging By Moonlight", "Ahjay Stelino", "Джаз · 1:34"),
  track("old-letter", "Old Letter", "Michael Ramir C.", "Гитара · 2:45"),
  track("forever-in-my-heart", "Forever in My Heart", "Michael Ramir C.", "Фолк · 2:29"),
  track("fifth-of-february", "Fifth of February", "Michael Ramir C.", "Кантри-баллада · 3:08"),
  track("warm-happy", "Warm Happy", "The_Mountain", "Тёплая акустика · 1:28"),
  track("just-keep-walking", "Just Keep Walking", "Michael Ramir C.", "Инди-поп · 2:05"),
  track("tears-of-joy", "Tears of Joy", "Michael Ramir C.", "Фолк-поп · 2:20"),
  track("a-special-feeling", "A Special Feeling", "Michael Ramir C.", "Поп · 1:40"),
  track("traveling-along", "Traveling Along", "Ahjay Stelino", "Поп · 1:40"),
  track("wind-leaves", "Wind Leaves", "Eugenio Mininni", "Гитара · 3:25"),
  track("spanish-heart", "Spanish Heart", "Michael Ramir C.", "Испанская гитара · 1:47"),
  track("party-like-its-your-birthday", "Party Like It's Your Birthday", "Michael Ramir C.", "Инди-поп · 1:43"),
  track("feel-alive", "Feel Alive", "Michael Ramir C.", "Соул · 1:46"),
  track("house-one", "House One", "Francisco Alvear", "Хаус · 1:56"),
  track("midnight-funk", "Midnight Funk", "Michael Ramir C.", "Фанк · 1:47"),
  track("life-is-a-dream", "Life is a Dream", "Michael Ramir C.", "Диско · 1:39"),
  track("oh-lord", "Oh Lord", "Arulo", "Дэнс-поп · 2:23"),
  track("summer-pop", "Pop", "Andrew Ev", "Летний хаус · 4:25"),
  track("lo-fi-01", "Lo-Fi 01", "Lily J", "Лоу-фай · 1:42"),
  track("sweet-september", "Sweet September", "Arulo", "Лоу-фай хип-хоп · 1:39"),
  track("day-dreamin", "Day Dreamin' with U", "Michael Ramir C.", "Чилаут · 1:58"),
  track("dreamy-jazz", "Dreamy Jazz", "Francisco Alvear", "Лаунж · 2:16"),
  track("lo-fi-02", "Lo-Fi 02", "Lily J", "Лоу-фай · 1:38"),
  track("serene-view", "Serene View", "Arulo", "Чилаут · 1:54"),
  track("valley-sunset", "Valley Sunset", "Alejandro Magaña", "Эмбиент · 2:14"),
  track("drawing-the-sky", "Drawing the Sky", "Eugenio Mininni", "Оркестр · 3:27"),
  track("skyline", "Skyline", "Eugenio Mininni", "Фортепиано и струнные · 3:26"),
  track("discover", "Discover", "Eugenio Mininni", "Оркестровый поп · 2:24"),
]

export const TRACK_BY_ID = Object.fromEntries(TRACKS.map((t) => [t.id, t])) as Record<string, Track>

/** The track picked for an occasion until the person chooses one themselves. */
export const OCCASION_TRACK: Record<Occasion, string> = {
  birthday: "party-like-its-your-birthday",
  anniversary: "true-love",
  wedding: "wedding-harp",
  love: "loving-you-is-easy",
  thanks: "warm-happy",
  other: "lo-fi-01",
}

export const giftUrl = (id: string) => `${typeof window === "undefined" ? "" : window.location.origin}/g/${id}`
