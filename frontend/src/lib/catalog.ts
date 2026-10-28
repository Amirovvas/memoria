import { buildDoc } from "./collage/build"
import { LAYOUTS } from "./collage/layouts"
import { FORMATS, type Orientation } from "./collage/styles"
import type { CollageDoc, FormatKey, LayoutKey, LookKey, PaletteKey, StyleKey, TemplateTexts } from "./collage/types"
import { REF, type Reference } from "./collage/references"
import { asset, couplePhotos, cropSrc, photo, wedding, type PhotoKey } from "./photos"

export type CategoryIcon =
  | "plane"
  | "heart"
  | "cake"
  | "users"
  | "camera"
  | "home"
  | "graduation"
  | "gem"
  | "grid"
  | "flower"
  | "scissors"
  | "phone"
  | "star"
  | "plus"

export interface Category {
  slug: string
  name: string
  short: string
  description: string
  icon: CategoryIcon
  cover: PhotoKey
  pool: PhotoKey[]
  texts: TemplateTexts
}

export const CATEGORIES: Category[] = [
  {
    slug: "travel",
    name: "Путешествия",
    short: "Путешествия",
    description: "Билеты, карты, закаты и дорожные заметки — соберите поездку в одну красивую историю.",
    icon: "plane",
    cover: "amalfiCoast",
    pool: [
      "amalfiBeach",
      "positano",
      "cinqueTerre",
      "vernazza",
      "manarola",
      "amalfiCoast",
      "pebbleBeach",
      "sunrise",
      "colorfulHouses",
      "venice",
      "lakeBoat",
      "balloons",
      "turquoiseLake",
      "oldStreet",
      "desertRoad",
      "valley",
    ],
    texts: {
      title: "Лето в Амальфи",
      subtitle: "Две недели солнца, моря и лимонов",
      date: "Июль 2025",
      note: "самое красивое место на свете",
      place: "Амальфи · Италия",
      label: "ROMA → NAPOLI",
    },
  },
  {
    slug: "love",
    name: "Любовь и отношения",
    short: "Любовь",
    description: "Нежные композиции для годовщин, валентинок и историй о двоих.",
    icon: "heart",
    cover: "heartHands",
    pool: ["heartHands", "coupleRings", "silhouette", "heartsBokeh", "weddingHands", "sunrise", "poppies", "venice", "bouquet"],
    texts: {
      title: "Ты и я",
      subtitle: "Наша история в кадрах",
      date: "14 февраля 2025",
      note: "с тобой — как дома",
      place: "Париж",
      label: "LOVE · ADMIT TWO",
    },
  },
  {
    slug: "birthday",
    name: "День рождения",
    short: "День рождения",
    description: "Конфетти, шары и самые счастливые лица — праздник, который хочется пересматривать.",
    icon: "cake",
    cover: "partyBalloons",
    pool: ["birthdayKid", "cake", "partyBalloons", "confetti", "birthdayFamily", "chalkBirthday", "party"],
    texts: {
      title: "С днём рождения",
      subtitle: "Тебе 25 — и это только начало",
      date: "12 марта",
      note: "загадывай желание!",
      place: "Москва",
      label: "PARTY · 21:00",
    },
  },
  {
    slug: "friends",
    name: "Лучшие друзья",
    short: "Друзья",
    description: "Для тех, с кем смеёшься до слёз и путешествуешь без плана.",
    icon: "users",
    cover: "friendsSunset",
    pool: ["friendsSunset", "friendsSitting", "cafeFriends", "groupSunset", "friendsLaptop", "party", "smileRed", "denimGirl"],
    texts: {
      title: "Лучшие друзья",
      subtitle: "Те, с кем всё по-настоящему",
      date: "Лето 2025",
      note: "навсегда вместе",
      place: "Крым",
      label: "SQUAD · 4 PAX",
    },
  },
  {
    slug: "memories",
    name: "Воспоминания",
    short: "Воспоминания",
    description: "Тихие моменты, тёплый свет и детали, которые хочется помнить.",
    icon: "camera",
    cover: "greenHills",
    pool: ["valley", "greenHills", "oldTree", "sunrise", "friendsSunset", "familyBeach", "silhouette", "poppies"],
    texts: {
      title: "Помнить всё",
      subtitle: "Моменты, которые хочется сохранить",
      date: "2019 — 2025",
      note: "однажды это станет любимым",
      place: "Дом",
      label: "MEMORIES · 2025",
    },
  },
  {
    slug: "family",
    name: "Семья",
    short: "Семья",
    description: "Выходные, праздники и обычные дни, из которых складывается жизнь.",
    icon: "home",
    cover: "familyBeach",
    pool: ["familyBeach", "dadKids", "birthdayFamily", "birthdayKid", "greenHills", "oldTree", "sunrise"],
    texts: {
      title: "Наша семья",
      subtitle: "Самые тёплые выходные",
      date: "Август 2025",
      note: "дом там, где вы",
      place: "Дача",
      label: "FAMILY · 5 PAX",
    },
  },
  {
    slug: "graduation",
    name: "Выпускной",
    short: "Выпускной",
    description: "Последний звонок, мантии и первая страница новой главы.",
    icon: "graduation",
    cover: "gradCap",
    pool: ["gradCap", "groupSunset", "friendsSunset", "friendsSitting", "cafeFriends", "friendsLaptop"],
    texts: {
      title: "Выпуск 2025",
      subtitle: "Мы сделали это!",
      date: "Июнь 2025",
      note: "новая глава начинается",
      place: "Школа №57",
      label: "CLASS OF 2025",
    },
  },
  {
    slug: "wedding",
    name: "Свадьба",
    short: "Свадьба",
    description: "Элегантные раскладки для свадебного дня, приглашений и годовщин.",
    icon: "gem",
    cover: "weddingCouple",
    pool: ["weddingCouple", "bouquet", "weddingHands", "rings", "coupleRings", "weddingChairs", "heartHands"],
    texts: {
      title: "Анна & Максим",
      subtitle: "Свадьба · 21 сентября",
      date: "21.09.2025",
      note: "и жили они долго и счастливо",
      place: "Тоскана",
      label: "WEDDING · RSVP",
    },
  },
  {
    slug: "aesthetic",
    name: "Эстетика",
    short: "Эстетика",
    description: "Мягкий свет, плёночные тона и красота простых вещей.",
    icon: "flower",
    cover: "poppies",
    pool: ["poppies", "heartsBokeh", "sunrise", "oldTree", "journalDesk", "galleryWall", "vernazza", "turquoiseLake"],
    texts: {
      title: "Мягкий свет",
      subtitle: "Эстетика простых вещей",
      date: "Vol. 03",
      note: "замечай красивое",
      place: "Утро",
      label: "SLOW · LIFE",
    },
  },
  {
    slug: "scrapbook",
    name: "Скрапбукинг",
    short: "Скрапбукинг",
    description: "Скотч, вырезки, марки и записки — как в настоящем альбоме.",
    icon: "scissors",
    cover: "colorfulHouses",
    pool: ["amalfiBeach", "cinqueTerre", "balloons", "colorfulHouses", "vernazza", "lakeBoat", "pebbleBeach", "positano"],
    texts: {
      title: "Мой дневник",
      subtitle: "Страницы одного лета",
      date: "2025",
      note: "вклеить на память",
      place: "Альбом",
      label: "TICKET · No 0427",
    },
  },
  {
    slug: "wishes",
    name: "Доска желаний",
    short: "Желания",
    description: "Визуализируйте цели, мечты и места, где хочется побывать.",
    icon: "star",
    cover: "lakeBoat",
    pool: ["journalDesk", "galleryWall", "lakeBoat", "balloons", "greenHills", "poppies", "heartHands", "valley"],
    texts: {
      title: "Доска желаний",
      subtitle: "Мечтай смело",
      date: "2026",
      note: "всё получится",
      place: "Цели",
      label: "DREAM · 2026",
    },
  },
]

export const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c])) as Record<string, Category>

export interface Template {
  id: string
  title: string
  category: string
  layout: LayoutKey
  style: StyleKey
  palette: PaletteKey
  format: FormatKey
  orientation: Orientation
  slots: number
  photos: (string | null)[]
  texts: TemplateTexts
  look?: LookKey
  saves: number
  uses: number
  order: number
  editorsPick?: boolean
  isNew?: boolean
  premium?: boolean
}

interface EntryExtras {
  /** sample photos instead of the category stock pool */
  photos?: string[]
  texts?: Partial<TemplateTexts>
  /** colour grading of the reference, so the user's photos match its mood */
  look?: LookKey
  /** borrow the stock photos of another category */
  poolFrom?: string
  /** recreated from a reference collage: shown first and marked as an editor's pick */
  featured?: boolean
}

type Entry = [name: string, layout: LayoutKey, style: StyleKey, palette: PaletteKey, canvasTitle?: string, extras?: EntryExtras]

type Box = [number, number, number, number]
const PIN: [number, number] = [736, 1104]
const STORY: [number, number] = [736, 1308]
const frames = (src: string, size: [number, number], boxes: Box[]) => boxes.map((b) => cropSrc(src, size, b))

// 11.jpg is a 3 × 7 grid; its middle row carries the printed "Happy Birthday".
const GRID_COLS: [number, number][] = [
  [0, 237],
  [241, 478],
  [482, 720],
]
const GRID_CELLS: Box[] = Array.from({ length: 21 }, (_, i) => {
  const [x0, x1] = GRID_COLS[i % 3]
  const r = Math.floor(i / 3)
  return [x0, Math.round(r * 182.86 + 2), x1, Math.round((r + 1) * 182.86 - 2)]
})

// Frames of the reference collages in Storage, in the order the layouts place their photos.
const REFERENCE = {
  sunset: frames(asset("1.jpg"), PIN, [
    [420, 0, 736, 290],
    [90, 52, 406, 463],
    [309, 355, 640, 708],
    [90, 531, 379, 878],
    [379, 727, 644, 1056],
  ]),
  bloom: frames(asset("2.jpg"), PIN, [
    [42, 127, 369, 597],
    [380, 33, 707, 378],
    [380, 389, 707, 884],
    [42, 611, 369, 1062],
  ]),
  triptych: frames(asset("3.jpg"), STORY, [
    [0, 0, 736, 434],
    [0, 437, 736, 871],
    [0, 874, 736, 1308],
  ]),
  night: frames(asset("4.jpg"), STORY, [
    [22, 8, 355, 292],
    [20, 355, 355, 610],
    [12, 668, 352, 945],
    [32, 992, 378, 1272],
    [378, 15, 722, 410],
    [378, 455, 722, 848],
    [378, 890, 722, 1285],
  ]),
  wedding: frames(asset("7.jpg"), [736, 1132], [
    [0, 0, 736, 475],
    [0, 785, 736, 1132],
    [336, 115, 684, 785],
    [22, 622, 330, 1012],
    [98, 477, 404, 678],
    [281, 843, 656, 1104],
  ]),
  kodak: frames(asset("9.jpg"), STORY, [
    [0, 0, 368, 437],
    [0, 437, 368, 871],
    [0, 871, 368, 1308],
    [388, 25, 720, 347],
    [388, 397, 720, 717],
    [388, 768, 720, 1085],
    [388, 1135, 720, 1308],
  ]),
  kodakBig: frames(asset("10.jpg"), STORY, [
    [0, 0, 228, 296],
    [251, 0, 490, 298],
    [514, 0, 736, 298],
    [0, 360, 736, 950],
    [0, 1000, 226, 1308],
    [252, 1000, 490, 1308],
    [514, 1000, 736, 1308],
  ]),
  grid: frames(asset("11.jpg"), [720, 1280], GRID_CELLS),
  sea: frames(asset("5.jpg"), STORY, [
    [0, 0, 330, 587],
    [460, 0, 736, 232],
    [233, 232, 470, 780],
    [470, 232, 736, 507],
    [470, 507, 736, 780],
    [233, 780, 470, 1050],
    [470, 780, 736, 1308],
    [215, 1050, 470, 1308],
  ]),
}

/** The grid with its captioned middle row swapped for clean frames, so a new caption can go on top. */
const CLEAN_GRID = REFERENCE.grid.map((src, i) => (i === 9 ? REFERENCE.grid[18] : i === 10 ? REFERENCE.grid[4] : i === 11 ? REFERENCE.grid[2] : src))

const NO_TEXT: Partial<TemplateTexts> = { title: "", subtitle: "", note: "", date: "" }

/** Sample photos of a reference collage — its own frames. */
const own = (r: Reference) => frames(r.src, r.size, r.crops ?? r.slots)

/** Swaps the frames listed by index, e.g. the ones fully covered by a printed caption. */
const swap = (photos: string[], by: Record<number, string>) => photos.map((p, i) => by[i] ?? p)

/** Stock photos by key, in the order the layout places them. */
const shots = (...keys: PhotoKey[]) => keys.map((k) => photo(k))

const HIKE_STORY =
  "Подальше от городского шума — на тропы, которых нет на картах: кедровые леса, каменистые подъёмы и перевалы, откуда облака видно сверху. Пять дней пешком туда, куда ведёт природа."
const RIDE_STORY =
  "Мимо туристических троп и подальше от толпы — туда, где кончается асфальт. Лесные грунтовки, крутые подъёмы и виды, ради которых стоит крутить педали ещё десять километров."

const ENTRIES: Record<string, Entry[]> = {
  travel: [
    ["Лето в Италии", "overlap", "collage", "white"],
    ["Мозаика побережья", "mosaic", "minimal", "white"],
    ["Открытка с моря", "backdrop", "polaroid", "ocean", "Dolce vita"],
    ["Плёнка из Позитано", "film-strip", "film", "noir", "Positano 25"],
    ["Стена воспоминаний", "wall", "collage", "butter"],
    ["Морской горизонт", "hero-row", "collage", "sky", "Средиземноморье"],
    ["Фотобудка отпуска", "photobooth", "minimal", "black"],
    ["Россыпь снимков", "polaroid-scatter", "polaroid", "sage", "Каникулы"],
    ["Мудборд поездки", "moodboard", "pinterest", "lilac", "Dolce vita"],
    ["Ночная мозаика", "mosaic", "minimal", "black"],
    ["Средиземноморье", "arches", "minimal", "ocean"],
    ["Чинкве-Терре", "overlap", "collage", "terracotta"],
    ["Рим на четырёх кадрах", "grid4", "night", "black", undefined, { photos: own(REF.roma), texts: { title: "ROMA", date: "" }, featured: true }],
    ["Вьетнам", "travel-mosaic", "dreamy", "black", undefined, { photos: own(REF.vietnam), texts: { title: "Vietnam" }, featured: true }],
    ["Озеро Комо", "stack-caption", "night", "black", undefined, { photos: own(REF.como), texts: { subtitle: "Lake como" }, featured: true }],
    ["Travel dump", "grid9-dump", "dump", "neon", undefined, { photos: swap(own(REF.travelDump), { 3: photo("oldStreet"), 4: photo("venice"), 5: photo("balloons") }), texts: { title: "Travel", note: "Dump" }, featured: true }],
    ["Заметки в пути", "trail-notes", "notes", "white", undefined, { photos: own(REF.trail), texts: { title: "away from real life", subtitle: "Escaping the ordinary, embracing the extraordinary.", note: "Traveling because adulting is hard." }, featured: true }],
    ["Дорога домой", "quote-bw", "collage", "mist", undefined, { look: "noir", texts: { title: "collect moments, not things." } }],
    ["Новые дороги", "grid4", "quiet", "black", undefined, { look: "moss", texts: { title: "", date: "\"EVERY ROAD LEADS SOMEWHERE NEW.\"" } }],
    ["Ретро-трип", "dark-scrapbook", "minimal", "black", undefined, { look: "kodak" }],
    ["Рваные края", "torn-stack", "dreamy", "white", undefined, { photos: shots("hikerLake", "alpineMeadow", "hikersRidge", "tentView"), texts: { note: "в горах дышится иначе" }, featured: true }],
    ["Тропы Алтая", "hike-journal", "notes", "mist", undefined, { photos: shots("hikerBack", "mountainValley", "forestBridge"), texts: { title: "Тропы\nАлтая", subtitle: HIKE_STORY, place: "ПОХОДНЫЙ ДНЕВНИК · 2025" }, featured: true }],
    ["Без асфальта", "ride-journal", "notes", "mist", undefined, { photos: shots("coastRide", "greenRidge", "bikePov", "mtbSplash"), texts: { title: "Без асфальта", subtitle: RIDE_STORY, place: "ВЕЛОДНЕВНИК · ИЮНЬ 2025" }, featured: true }],
  ],
  love: [
    ["Наша история", "backdrop", "polaroid", "blush", "Ты и я"],
    ["Любовь в кадрах", "overlap", "collage", "cherry"],
    ["Мозаика нежности", "mosaic", "minimal", "blush"],
    ["Фотобудка для двоих", "photobooth", "minimal", "cherry"],
    ["Нежные арки", "arches", "minimal", "blush"],
    ["Стена любви", "wall", "collage", "lilac"],
    ["Море и мы", "sea-grid", "minimal", "white", undefined, { photos: REFERENCE.sea, look: "sea", featured: true }],
    ["Только мы", "bw-wedding", "kodak", "black", undefined, { photos: REFERENCE.wedding, look: "noir", texts: { title: "us." } }],
    // the reference collages of these two show friends; a love template gets couples instead
    ["Forever", "bw-grid", "night", "black", undefined, { photos: couplePhotos(21), look: "noir", texts: { title: "Forever", note: "you & me" } }],
    ["Love", "heart", "minimal", "white", undefined, { photos: couplePhotos(18, 18), look: "kodak", texts: { title: "love", date: "[lʌv] noun", subtitle: "the feeling of being home in someone else's arms." } }],
    ["Медовый месяц", "stack-caption", "night", "black", undefined, { texts: { subtitle: "honeymoon ♡" } }],
    ["Судьба", "stack-quote", "quiet", "black", undefined, { look: "golden", texts: { subtitle: "you were meant to be mine." } }],
    ["Любовь в деталях", "quote-bw", "collage", "mist", undefined, { look: "noir", texts: { title: "you are my favorite memory." } }],
    ["Paris", "grid4", "night", "black", undefined, { texts: { title: "PARIS", date: "" } }],
  ],
  birthday: [
    ["Праздник в конфетти", "celebration", "polaroid", "butter"],
    ["Тебе 25!", "overlap", "collage", "butter"],
    ["Вечеринка", "mosaic", "minimal", "black"],
    ["Праздничная фотобудка", "photobooth", "minimal", "cherry"],
    ["Лучший год", "backdrop", "polaroid", "lilac", "Лучший год"],
    ["Сладкий день", "hero-row", "collage", "blush", "Happy B-day"],
    ["Kodak-праздник", "kodak-strip", "kodak", "black", undefined, { photos: swap(REFERENCE.kodak, { 1: photo("cake") }), look: "kodak", texts: { title: "Happy Birthday", note: "" }, featured: true }],
    ["Happy Birthday на плёнке", "kodak-big", "kodak", "black", undefined, { photos: swap(REFERENCE.kodakBig, { 3: photo("party") }), look: "kodak", texts: { title: "Happy Birthday", subtitle: "May all your dreams come true! Enjoy your day. Love You ♡" }, featured: true }],
    ["Чёрно-белый день рождения", "bw-grid", "night", "black", undefined, { photos: CLEAN_GRID, look: "noir", texts: { title: "Birthday", note: "Happy" }, featured: true }],
    ["Белые рамки", "paper-birthday", "collage", "mist", undefined, { photos: own(REF.paperBirthday), look: "kodak", texts: { title: "Happy Birthday" }, featured: true }],
    ["Birthday dump", "grid9-dump", "dump", "neon", undefined, { texts: { title: "Birthday", note: "Dump" } }],
  ],
  friends: [
    ["Лучшие друзья", "overlap", "collage", "sky"],
    ["Наше лето", "mosaic", "minimal", "white"],
    ["Фотобудка друзей", "photobooth", "minimal", "black"],
    ["Девичник", "wall", "collage", "blush"],
    ["Weekend squad", "backdrop", "polaroid", "olive", "Weekend"],
    ["Плёнка дружбы", "film-strip", "film", "noir", "Наше лето"],
    ["Ночь с друзьями", "night-out", "polaroid", "black", undefined, { photos: REFERENCE.night, look: "flash", texts: { label: "CAPCUT   FF1 202XTX   ▸ 25" }, featured: true }],
    ["Best friends", "bw-grid", "night", "black", undefined, { photos: CLEAN_GRID, look: "noir", texts: { title: "Best friends", note: "my" } }],
    ["Лучшие подруги", "kodak-big", "kodak", "black", undefined, { look: "kodak", texts: { title: "Best Friends", subtitle: "Спасибо, что ты всегда рядом ♡" } }],
    ["Плёнка подруг", "kodak-strip", "kodak", "black", undefined, { look: "kodak", texts: { title: "Best friends", note: "навсегда вместе" } }],
    ["Home", "heart", "minimal", "white", undefined, { photos: own(REF.home), look: "kodak", texts: { title: "home", date: "[hōm] noun", subtitle: "a place where you are always welcome and surrounded by those who love you." }, featured: true }],
    ["Крафт-скрапбук подруг", "kraft-notes", "minimal", "sand", undefined, { photos: own(REF.kraft), look: "kodak", featured: true }],
    ["Лучшая подруга", "paper-birthday", "collage", "mist", undefined, { texts: { title: "Best friend ♡" } }],
    ["Friends dump", "grid9-dump", "dump", "neon", undefined, { texts: { title: "Friends", note: "Dump" } }],
    ["Road trip", "travel-mosaic", "dreamy", "black", undefined, { poolFrom: "travel", texts: { title: "Road trip" } }],
    ["Поход с друзьями", "torn-stack", "dreamy", "white", undefined, { photos: shots("campfire", "vanCamp", "hikersRidge", "alpineMeadow"), texts: { note: "лучшая компания — у костра" } }],
    ["Едем вместе", "ride-journal", "notes", "mist", undefined, {
      photos: shots("cyclistsRace", "hazyPeaks", "coastRide", "mtbSplash"),
      texts: { title: "Едем вместе", subtitle: "Четыре велосипеда, один термос и никакого плана. Грунтовки, поля и остановки там, где красиво, — так выглядят лучшие выходные.", place: "НАША КОМАНДА · 4 ВЕЛОСИПЕДА" },
    }],
    ["Выходные в горах", "trail-notes", "notes", "white", undefined, { photos: own(REF.trail), texts: { title: "weekend escape", subtitle: "Good friends, fresh air and no plans.", note: "Life is better in the mountains." } }],
  ],
  memories: [
    ["Помнить всё", "wall", "collage", "sand"],
    ["Тёплые дни", "backdrop", "polaroid", "sand", "Тёплые дни"],
    ["Мой 2025", "mosaic", "minimal", "olive"],
    ["Старая плёнка", "film-strip", "film", "noir", "Воспоминания"],
    ["Моменты", "hero-row", "collage", "sage", "Моменты"],
    ["Капсула времени", "overlap", "collage", "lilac"],
    ["Тихая весна", "bloom", "soft", "linen", undefined, { photos: REFERENCE.bloom, look: "bloom", texts: { subtitle: "breathe in the quiet of spring", note: "in every bloom, a gentler version of me" }, featured: true }],
    ["Чёрно-белые воспоминания", "bw-wedding", "kodak", "black", undefined, { look: "noir", texts: { title: "memories" } }],
    ["Мой год на плёнке", "kodak-big", "kodak", "black", undefined, { look: "kodak", texts: { title: "Мой 2025", subtitle: "Лучшие моменты года" } }],
    ["Лучшее в воспоминаниях", "quote-bw", "collage", "mist", undefined, { photos: own(REF.memoriesQuote), look: "noir", texts: { title: "the best thing about memories is making them." }, featured: true }],
    ["Make this your year", "dark-scrapbook", "minimal", "black", undefined, { photos: own(REF.roadTrip), look: "kodak", featured: true }],
    ["Тёплое лето", "stack-quote", "quiet", "black", undefined, { look: "golden", texts: { subtitle: "some days stay with you forever." } }],
    ["Наш отпуск", "grid4", "night", "black", undefined, { texts: { title: "SUMMER 25", date: "" } }],
    ["Лето в горах", "torn-stack", "dreamy", "white", undefined, { photos: shots("cloudSea", "dolomites", "hazyPeaks", "starryPeaks"), texts: { note: "то самое лето в горах" } }],
  ],
  family: [
    ["Наша семья", "hero-row", "collage", "butter"],
    ["Семейные выходные", "overlap", "collage", "sage"],
    ["Дом — это вы", "mosaic", "minimal", "white"],
    ["Семейный альбом", "polaroid-scatter", "polaroid", "sand", "Семейный альбом"],
    ["Лето у бабушки", "backdrop", "polaroid", "sage", "Лето"],
    ["Family", "heart", "minimal", "white", undefined, { photos: own(REF.home), look: "kodak", texts: { title: "family", date: "[ˈfam(ə)lē] noun", subtitle: "where life begins and love never ends." } }],
    ["Лето всей семьёй", "stack-caption", "night", "black", undefined, { texts: { subtitle: "summer with family" } }],
    ["Семейная вылазка", "trail-notes", "notes", "white", undefined, { photos: own(REF.trail), texts: { title: "family time", subtitle: "Together is our favorite place to be.", note: "Small trips, big memories." } }],
  ],
  graduation: [
    ["Выпуск 2025", "backdrop", "polaroid", "black"],
    ["Мы сделали это", "overlap", "collage", "sky"],
    ["Класс навсегда", "mosaic", "minimal", "white"],
    ["Фотобудка выпускников", "photobooth", "minimal", "olive"],
    ["Новая глава", "wall", "collage", "butter"],
    ["Выпускной на плёнке", "kodak-big", "kodak", "black", undefined, { look: "kodak", texts: { title: "Class of 2025", subtitle: "Мы сделали это!" } }],
    ["Мой выпускной", "paper-birthday", "collage", "mist", undefined, { texts: { title: "Graduation day" } }],
    ["We Made It!", "grad-torn", "collage", "sage", undefined, {
      photos: own(REF.gradTorn),
      texts: { title: "We Made It!", subtitle: "GRATEFUL FOR THE JOURNEY, EXCITED FOR WHAT'S NEXT" },
      featured: true,
    }],
    ["Плёнка выпускника", "grad-film", "kodak", "black", undefined, { photos: own(REF.gradFilm), look: "kodak", texts: { title: "Happy Graduation", date: "CLASS OF 2025" }, featured: true }],
    ["Чёрно-белый выпускной", "grad-bows", "collage", "white", undefined, { photos: own(REF.gradBows), look: "noir", texts: { title: "Happy\nGraduation" }, featured: true }],
  ],
  wedding: [
    ["Анна & Максим", "arches", "minimal", "cream"],
    ["Наш день", "backdrop", "polaroid", "white", "Наш день"],
    ["Свадебная мозаика", "mosaic", "minimal", "white"],
    ["Нежная свадьба", "hero-row", "collage", "blush", "Навсегда"],
    ["Свадебная плёнка", "film-strip", "film", "noir", "21 · 09"],
    ["Лепестки", "overlap", "collage", "cream"],
    ["Чёрно-белая свадьба", "bw-wedding", "kodak", "black", undefined, { photos: REFERENCE.wedding, look: "noir", texts: NO_TEXT, featured: true }],
    ["Свадебный глянец", "wedding-cover", "dump", "black", undefined, { photos: [wedding("couple", 7)], texts: { note: "и жили они долго и счастливо" }, featured: true }],
    ["Save the date", "save-the-date", "minimal", "cream", undefined, { photos: [wedding("couple", 0), wedding("rings", 0), wedding("bouquet", 2)], featured: true }],
    ["Программа дня", "wedding-program", "minimal", "linen", undefined, { photos: [wedding("couple", 11), wedding("couple", 1), wedding("table", 0), wedding("couple", 8)], featured: true }],
    ["Детали дня", "wedding-details", "pinterest", "white", undefined, { photos: [wedding("rings", 3), wedding("bouquet", 4), wedding("dress", 1), wedding("shoes", 0), wedding("paper", 0), wedding("cake", 0)], featured: true }],
    ["Forever", "wedding-forever", "kodak", "black", undefined, { photos: [wedding("bw", 0), wedding("bw", 6), wedding("bw", 3)], look: "noir", featured: true }],
    ["Снимки на скотче", "wedding-scatter", "collage", "cream", undefined, { photos: [wedding("couple", 6), wedding("bride", 9), wedding("hands", 0), wedding("bouquet", 0), wedding("couple", 2)], texts: { note: "лучший день нашей жизни" }, featured: true }],
    ["Тосканская свадьба", "wedding-mood", "pinterest", "sage", undefined, {
      photos: [wedding("table", 1), wedding("couple", 0), wedding("bouquet", 3), wedding("rings", 1), wedding("bride", 6), wedding("venue", 2), wedding("table", 4)],
      texts: { note: "лён, оливы и тёплый вечерний свет" },
      featured: true,
    }],
    ["Приглашение для гостей", "wedding-letter", "minimal", "white", undefined, { photos: [wedding("couple", 4), wedding("paper", 2)], featured: true }],
    ["Just married", "just-married", "minimal", "white", undefined, { photos: [wedding("couple", 8), wedding("rings", 6), wedding("bride", 4), wedding("couple", 3), wedding("bouquet", 5), wedding("table", 2)], featured: true }],
    ["Чёрно-белый глянец", "wedding-cover", "dump", "black", undefined, { photos: [wedding("bw", 1)], look: "noir", texts: { note: "один день — на всю жизнь" } }],
    ["Мудборд в пудре", "wedding-mood", "pinterest", "blush", undefined, {
      photos: [wedding("bouquet", 5), wedding("bride", 10), wedding("cake", 1), wedding("paper", 4), wedding("couple", 9), wedding("dress", 0), wedding("rings", 7)],
      texts: { note: "нежность в каждой детали" },
    }],
    ["Детали на плёнку", "wedding-details", "pinterest", "linen", undefined, { photos: [wedding("rings", 9), wedding("bouquet", 6), wedding("dress", 5), wedding("shoes", 2), wedding("paper", 6), wedding("cake", 3)], look: "kodak" }],
  ],
  aesthetic: [
    ["Мягкий свет", "backdrop", "polaroid", "blush"],
    ["Медленная жизнь", "mosaic", "minimal", "sand"],
    ["Тихое утро", "wall", "collage", "white"],
    ["Золотой час", "hero-row", "collage", "terracotta", "Золотой час"],
    ["Эстетика деталей", "overlap", "collage", "olive"],
    ["Закатная мечта", "sunset", "dreamy", "noir", undefined, { photos: REFERENCE.sunset, look: "dusk", texts: { note: "the sunset knew how beautiful you are ♡" }, featured: true }],
    ["Если суждено", "stack-quote", "quiet", "black", undefined, { photos: own(REF.golden), look: "golden", texts: { subtitle: "if it's meant to be, it will be." }, featured: true }],
    ["Новые мечты", "grid4", "quiet", "black", undefined, { photos: own(REF.moss), look: "moss", texts: { title: "", date: "\"THERE WILL BE NEW DREAMS THAT WILL TAKE YOU FORWARD, AND YOU NEED TO BELIEVE IN YOURSELF.\"" }, featured: true }],
  ],
  scrapbook: [
    ["Мой дневник", "wall", "scrapbook", "sand"],
    ["Вырезки", "polaroid-scatter", "scrapbook", "terracotta", "Вырезки"],
    ["Страницы лета", "overlap", "scrapbook", "butter"],
    ["Крафт-альбом", "celebration", "scrapbook", "sand", "Мой год"],
    ["Летний скрапбук", "kraft-notes", "minimal", "sand", undefined, { look: "kodak" }],
    ["Ретро-скрапбук", "dark-scrapbook", "minimal", "black", undefined, { look: "kodak" }],
    ["Походный дневник", "hike-journal", "notes", "linen", undefined, {
      photos: shots("hikersRidge", "cloudSea", "campfire"),
      texts: { title: "Неделя\nу костра", subtitle: "Семь дней без связи: утренний туман над озером, чай из котелка и разговоры до звёзд. Записываю, чтобы не забыть ни одного вечера.", place: "СТРАНИЦА 12 · АВГУСТ" },
    }],
  ],
  wishes: [
    ["Доска желаний 2026", "wishboard", "pinterest", "cream", "2026"],
    ["Мечты и цели", "wall", "collage", "lilac"],
    ["Год путешествий", "mosaic", "minimal", "sky"],
    ["Хочу", "overlap", "collage", "butter"],
    ["Новая вершина", "hike-journal", "notes", "mist", undefined, {
      photos: shots("dolomites", "tealPeak", "forestBridge"),
      texts: { title: "Новая\nвершина", subtitle: "Подняться выше облаков, встретить рассвет на перевале и пройти маршрут, о котором давно мечтаю. Этим летом — обязательно.", place: "ДОСКА ЖЕЛАНИЙ · 2026" },
    }],
    ["Куда дальше", "trail-notes", "notes", "white", undefined, { photos: own(REF.trail), texts: { title: "next stop: dreams", subtitle: "Places I want to see this year.", note: "Collect moments, not things." } }],
  ],
}

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return Math.abs(h)
}

const EDITORS_PICKS = new Set(["travel-1", "love-1", "wedding-2", "memories-1", "travel-5", "aesthetic-1"])

let order = 0
export const TEMPLATES: Template[] = CATEGORIES.flatMap((cat) =>
  (ENTRIES[cat.slug] ?? []).map(([name, layout, style, palette, canvasTitle, extras], i) => {
    const id = `${cat.slug}-${i + 1}`
    const def = LAYOUTS[layout]
    const pool = extras?.poolFrom ? CATEGORY_BY_SLUG[extras.poolFrom].pool : cat.pool
    const photos =
      extras?.photos ??
      Array.from({ length: def.slots }, (_, k) => photo(pool[(i * 3 + k) % pool.length], 900))
    const h = hash(id)
    return {
      id,
      title: name,
      category: cat.slug,
      layout,
      style,
      palette,
      format: def.format,
      orientation: FORMATS[def.format].orientation,
      slots: def.slots,
      photos,
      texts: { ...cat.texts, title: canvasTitle ?? cat.texts.title, ...extras?.texts },
      look: extras?.look,
      saves: extras?.featured ? 9400 + (h % 3000) : 180 + (h % 9200),
      uses: extras?.featured ? 30000 + (h % 6000) : 400 + ((h >> 3) % 24000),
      order: order++,
      editorsPick: EDITORS_PICKS.has(id) || !!extras?.featured,
      isNew: !!extras?.featured || h % 5 === 0,
      premium: h % 7 === 0,
    }
  }),
)

export const TEMPLATE_BY_ID = Object.fromEntries(TEMPLATES.map((t) => [t.id, t])) as Record<string, Template>

const docCache = new Map<string, CollageDoc>()
export function templateDoc(t: Template): CollageDoc {
  let doc = docCache.get(t.id)
  if (!doc) {
    doc = buildDoc({ layout: t.layout, style: t.style, palette: t.palette, photos: t.photos, texts: t.texts, idPrefix: t.id, look: t.look })
    docCache.set(t.id, doc)
  }
  return doc
}

export function templatesFor(slug: string) {
  return TEMPLATES.filter((t) => t.category === slug)
}

export const POPULAR_TEMPLATES = [...TEMPLATES]
  .sort((a, b) => b.uses - a.uses)
  .slice(0, 10)

export const EDITORS_TEMPLATES = TEMPLATES.filter((t) => t.editorsPick).sort((a, b) => b.uses - a.uses)

export interface Collection {
  id: string
  title: string
  subtitle: string
  templateIds: string[]
}

export const COLLECTIONS: Collection[] = [
  {
    id: "pinterest",
    title: "Как в Pinterest",
    subtitle: "Закаты, плёнка и мягкий свет",
    templateIds: TEMPLATES.filter((t) => t.editorsPick && t.isNew && t.uses >= 30000).map((t) => t.id),
  },
  {
    id: "summer",
    title: "Летнее настроение",
    subtitle: "Море, солнце и соль на коже",
    templateIds: ["travel-1", "travel-3", "travel-6", "friends-2", "travel-12"],
  },
  {
    id: "film",
    title: "Плёночная ностальгия",
    subtitle: "Зерно, перфорация и тёплые тона",
    templateIds: TEMPLATES.filter((t) => t.style === "film").map((t) => t.id),
  },
  {
    id: "warm",
    title: "Тёплые моменты",
    subtitle: "Семья, любовь и уютные выходные",
    templateIds: ["family-1", "love-1", "family-2", "love-6", "memories-2"],
  },
  {
    id: "minimal",
    title: "Чистый минимализм",
    subtitle: "Много воздуха и тонкая типографика",
    templateIds: TEMPLATES.filter((t) => t.style === "minimal").map((t) => t.id),
  },
]

export const CAPTIONS: Record<string, string[]> = {
  travel: [
    "Лето в Италии",
    "Солнце, море и лимоны",
    "Здесь время течёт медленнее",
    "Потерялись в Позитано",
    "Собираю моменты, а не вещи",
    "Дорога важнее, чем пункт назначения",
  ],
  love: [
    "Ты — мой любимый кадр",
    "С тобой — как дома",
    "Наша маленькая вечность",
    "Любовь в деталях",
    "Ты и я — больше ничего не нужно",
  ],
  birthday: ["Загадывай желание!", "Ещё один год волшебства", "Сегодня твой день", "Торт, шары и лучшие люди", "25 — красивая цифра"],
  memories: [
    "Помнить всё",
    "Моменты, которые остаются",
    "Однажды это станет любимым воспоминанием",
    "Тёплые дни, которые хочется сохранить",
  ],
  friends: ["Друзья — семья, которую мы выбираем", "Навсегда вместе", "Смеёмся до слёз", "Лучшая компания"],
  default: ["Сохранить на память", "Маленькие радости", "Этот момент", "Красота в простом", "Так выглядит счастье"],
}

export function captionsFor(category: string) {
  return CAPTIONS[category] ?? CAPTIONS.default
}
