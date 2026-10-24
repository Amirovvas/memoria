const ids = {
  amalfiBeach: "1534250617995-d16425086b91",
  vernazza: "1534445867742-43195f401b6c",
  oldStreet: "1553577372-547baaf3bac8",
  cinqueTerre: "1587723818999-d532b4dc23d7",
  manarola: "1594881497142-08fdfdfc4074",
  silhouette: "1605692869430-9d869ee29986",
  amalfiCoast: "1662232921040-4c7e8e640867",
  birthdayFamily: "1662496164199-771be53d0a22",
  birthdayKid: "1662496166165-2b18a656ae0b",
  pebbleBeach: "1688105256690-264b4d36d95e",
  positano: "1690531559370-94133f7ff8a9",
  sunrise: "1507525428034-b723cf961d3e",
  valley: "1469474968028-56623f02e42e",
  desertRoad: "1500530855697-b586d89ba3ee",
  lakeBoat: "1476514525535-07fb3b4ae5f1",
  turquoiseLake: "1501785888041-af3ef285b470",
  balloons: "1530789253388-582c481c54b0",
  venice: "1523906834658-6e24ef2386f9",
  colorfulHouses: "1516483638261-f4dbaf036963",
  friendsSitting: "1529156069898-49953e39b3ac",
  friendsSunset: "1511632765486-a01980e01a18",
  friendsLaptop: "1522202176988-66273c2fd55f",
  denimGirl: "1517841905240-472988babdf9",
  smileRed: "1494790108377-be9c29b29330",
  heartsBokeh: "1518199266791-5375a83190b7",
  heartHands: "1516589178581-6cd7833ae3b2",
  coupleRings: "1529634806980-85c3dd6d34ac",
  weddingChairs: "1522673607200-164d1b6ce486",
  confetti: "1513151233558-d860c5398176",
  partyBalloons: "1530103862676-de8c9debad1d",
  cake: "1464349095431-e9a21285b5f3",
  chalkBirthday: "1558636508-e0db3814bd1d",
  weddingCouple: "1511285560929-80b456fea0bc",
  bouquet: "1519741497674-611481863552",
  weddingHands: "1465495976277-4387d4b0b4c6",
  rings: "1606800052052-a08af7148866",
  gradCap: "1627556704302-624286467c65",
  groupSunset: "1511895426328-dc8714191300",
  familyBeach: "1475503572774-15a45e5d60b9",
  dadKids: "1609220136736-443140cffec6",
  poppies: "1490750967868-88aa4486c946",
  galleryWall: "1513519245088-0e12902e5a38",
  oldTree: "1518495973542-4542c06a5843",
  greenHills: "1472214103451-9374bd1c798e",
  journalDesk: "1501504905252-473c47e087f8",
  party: "1517457373958-b7bdd4587205",
  cafeFriends: "1543269865-cbf427effbad",
  // hikes and rides
  hikerLake: "1465311440653-ba9b1d9b0f5b",
  alpineMeadow: "1501554728187-ce583db33af7",
  hikersRidge: "1551632811-561732d1e306",
  hikerBack: "1501555088652-021faa106b9b",
  tentView: "1504280390367-361c6d9f38f4",
  campfire: "1478131143081-80f7f84ca84d",
  vanCamp: "1563299796-17596ed6b017",
  mountainValley: "1464822759023-fed622ff2c3b",
  greenRidge: "1470071459604-3b5ec3a7fe05",
  cloudSea: "1506905925346-21bda4d32df4",
  hazyPeaks: "1500964757637-c85e8a162699",
  dolomites: "1508739773434-c26b3d09e071",
  starryPeaks: "1519681393784-d120267933ba",
  tealPeak: "1483728642387-6c3bdd6c93e5",
  forestBridge: "1447752875215-b2761acb3c5d",
  bikePov: "1475666675596-cca2035b3d79",
  coastRide: "1541625602330-2277a4c46182",
  mtbSplash: "1544191696-102dbdaeeaa0",
  cyclistsRace: "1517649763962-0c623066013b",
} as const

export type PhotoKey = keyof typeof ids

export function photo(key: PhotoKey, w = 900) {
  return `https://images.unsplash.com/photo-${ids[key]}?auto=format&fit=crop&w=${w}&q=80`
}

/**
 * Couples (no kisses) for the love templates whose reference collages show friends instead.
 * Free Unsplash photos; walking, laughing, hugging, sunsets.
 */
const COUPLE_IDS = [
  "1588632258523-26242d0a8c2c", "1586935410406-c00932c3010e", "1735571548003-4f84697e7b61", "1541089404510-5c9a779841fc",
  "1466979939565-131c4b39a51b", "1513744985676-c7e80ee4d05e", "1617376431454-8195cf1fd668", "1726766406089-0308c800b6b2",
  "1555689070-2d15336749b6", "1539464443546-5e3512c46694", "1531747056595-07f6cbbe10ad", "1663579167845-c73285e3805b",
  "1624646803808-9c5a9de7aa3f", "1782786660912-d3cb05d25bd9", "1575388104683-e076ee9ccaa0", "1530227222086-4037fdd5e723",
  "1768898548611-2dd94e452538", "1718122499258-3bd9eba74c0b", "1516349935484-52a0d805fdb1", "1542891433-684dbf58d399",
  "1597249844594-de80eb5cb76c", "1602039855133-b4d18d4c1d45", "1768820416651-92137322999e", "1768777278924-7036de17e714",
  "1769540209381-fe235a5d9355", "1783816297548-372473ee9392", "1501631259223-89d4e246ed23", "1496602910407-bacda74a0fe4",
  "1491582990992-68ec88e070a3", "1776620688995-49164dded1a7", "1640273296013-e4b54eaf52eb", "1426543881949-cbd9a76740a4",
  "1508978053361-f0df91897005", "1513521523607-ba30a1159755", "1605985687770-2e2e82c9b5f1", "1701401942416-bea590efe2ad",
]

/** `n` different couple photos, starting at `from` so two templates do not open with the same picture. */
export function couplePhotos(n: number, from = 0, w = 900) {
  return Array.from(
    { length: n },
    (_, i) => `https://images.unsplash.com/photo-${COUPLE_IDS[(from + i) % COUPLE_IDS.length]}?auto=format&fit=crop&w=${w}&q=80`,
  )
}

/**
 * Free Unsplash photos for the wedding templates, each checked by eye: couples walking and
 * laughing, the bride, hands and details. No kisses, no faces pressed together.
 */
const WEDDING = {
  couple: [
    "1779475501433-69a3a0b310f8", // vineyard walk
    "1775126964334-93899cb3725a", // walking across a lawn
    "1532712938310-34cb3982ef74", // far away in the hills
    "1591604466107-ec97de577aff", // smiling at the camera
    "1769540209843-c1e6a462b9d3", // redwood forest
    "1606216794074-735e91aa2c92", // under palm trees
    "1550784718-990c6de52adf", // castle terrace
    "1607190074257-dd4b7af0309f", // golden field at sunset
    "1595407753234-0882f1e77954", // leaving the ceremony
    "1606217239582-d9f72323bcd7", // walking down the aisle
    "1757647630063-dd5cd82271f3", // arcade
    "1606490208247-b65be3d94cd1", // the vows
  ],
  bride: [
    "1492175742197-ed20dc5a6bed",
    "1722805740076-7c51a8669afc",
    "1658909934911-1161efa3f9fb",
    "1536567307162-551e460b7fc2",
    "1501175635532-bdd01562edb2",
    "1533417020304-c785906cd8f9",
    "1529635322560-e767888a1583",
    "1549866654-c5ba7fdab71e",
    "1615164825769-b9bbba2906e9",
    "1502955422409-06e43fd3eff3",
    "1629326017926-9cad9c909196",
    "1599142296733-1c1f2073e6de",
    "1622277430358-f4d134452e2e",
    "1549416878-b9ca95e26903",
  ],
  dress: [
    "1774009501393-bac5a0a11afc",
    "1770757685010-2d3d30d270d6",
    "1585241920473-b472eb9ffbae",
    "1774660810310-5023390fe028",
    "1761116065261-586acfd09b7f",
    "1562677762-0b5a510d363a",
    "1600287792237-3f66db635a73",
  ],
  bw: [
    "1514451858099-83d802598681",
    "1759054713286-713c4ceeb5ba",
    "1564587081321-62723533e3c0",
    "1595662000432-f8cdba893fa4",
    "1523263653976-003efe7f25cf",
    "1617724975854-70b5d0cedb0a",
    "1617725145063-56958eadf557",
    "1634729108692-744ad15cbcfe",
    "1650900204930-56708f9a83bd",
    "1617872051806-e9e08b70d3af",
    "1605960207437-65854bd6eed4",
    "1521544213200-ee65f73b6238",
    "1524563970700-a302b6888e17",
    "1660325848053-f067c31f22ca",
  ],
  hands: [
    "1520854221256-17451cc331bf",
    "1561287495-a3fe1fd28504",
    "1782787539543-5b15d7533930",
    "1556302482-70b6e670e6b7",
    "1612883833766-7930d960e16f",
    "1481980235850-66e47651e431",
    "1719410628483-8fedce269e08",
    "1684244276932-6ae853774c4d",
  ],
  rings: [
    "1606800052052-a08af7148866",
    "1627293509201-cd0c780043e6",
    "1515934751635-c81c6bc9a2d8",
    "1622398925373-3f91b1e275f5",
    "1553915632-175f60dd8e36",
    "1562249004-1f7289c19c49",
    "1654699643507-3047b3e07045",
    "1768587732215-7630a6d1c057",
    "1784822041116-10ebc52b124d",
    "1783818412147-fc24a0d05830",
    "1637616919953-5943e10bd4bf",
  ],
  bouquet: [
    "1529636798458-92182e662485",
    "1579583764988-3e08c6132d2a",
    "1595467959554-9ffcbf37f10f",
    "1700142611715-8a023c5eb8c5",
    "1525258946800-98cfd641d0de",
    "1731994710373-849feb905390",
    "1786085801598-1e43ba68eb5a",
    "1574871786514-46e1680ea587",
    "1541538670337-c53313ad7c00",
  ],
  shoes: ["1721176411936-a28a77f75896", "1604531826442-c7b02558f6d2", "1705737211476-9eafea14eba6", "1562616441-69265b948285"],
  paper: [
    "1767050362923-79ff3b7971dc",
    "1656104717095-9d062b0d4e8d",
    "1763414902882-4e9d4f8e6275",
    "1633037773384-27d7ac0491e7",
    "1633008460512-624a321c15b6",
    "1632610992723-82d7c212f6d7",
    "1721176487015-5408ae0e9bc2",
    "1553013983-15241ab69e57",
    "1710961716482-2e9bbc146e73",
    "1520245787685-fb1e6732fb76",
  ],
  table: [
    "1519225421980-715cb0215aed",
    "1767050292710-8e5da59ec5d8",
    "1767050302752-e46f3da297ed",
    "1525441273400-056e9c7517b3",
    "1522413452208-996ff3f3e740",
    "1561593367-66c79c2294e6",
    "1525772764200-be829a350797",
    "1772404245181-3701c768fe06",
    "1649615644622-6d83f48e69c5",
    "1758705477576-8783430d55b6",
    "1769812343353-ae6ca1250bc2",
    "1680695779444-24fc71296e66",
    "1767050241759-a35754ea2471",
  ],
  cake: ["1535254973040-607b474cb50d", "1761671613300-438394c79d79", "1503525642560-ecca5e2e49e9", "1565661834013-d196ca46e14e"],
  venue: ["1670529776180-60e4132ab90c", "1505944357431-27579db47558", "1772127822562-a898d9f5733c", "1583939411023-14783179e581"],
}

export type WeddingGroup = keyof typeof WEDDING

/** The i-th wedding photo of a group, e.g. wedding("rings", 2); wraps around. */
export function wedding(group: WeddingGroup, i = 0, w = 900) {
  const list = WEDDING[group]
  return `https://images.unsplash.com/photo-${list[i % list.length]}?auto=format&fit=crop&w=${w}&q=80`
}

/**
 * Template pictures live in the public "assets" bucket of Supabase Storage, not in /public,
 * so the site does not depend on files in the repo. Names are lower-case, e.g. "moon-1.jpg".
 */
const ASSET_BASE = (
  process.env.NEXT_PUBLIC_ASSETS_URL ?? "https://zoyxqyoecsepggtsthxh.supabase.co/storage/v1/object/public/assets"
).replace(/\/$/, "")

export const asset = (name: string) => `${ASSET_BASE}/${name}`

/** Pictures used for the demo upload and as a fallback when stock photos are offline. */
export const LOCAL_PHOTOS = [asset("img1.png"), asset("moon-1.jpg")]

/** Folder of the photos people upload (Supabase Storage bucket "photos"). */
const USER_PHOTOS = "/storage/v1/object/public/photos/"

export const isUserPhoto = (src: string | null) => !!src && (src.startsWith("data:") || src.includes(USER_PHOTOS))

export function fallbackSrc(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return LOCAL_PHOTOS[Math.abs(h) % LOCAL_PHOTOS.length]
}

export interface Crop {
  x: number
  y: number
  w: number
  h: number
}

/**
 * Points a photo at one region of a bigger picture, e.g. a single frame of a finished collage.
 * Coordinates are pixels of the source image; the URL keeps them as fractions after "#c=".
 */
export function cropSrc(src: string, size: [number, number], [x0, y0, x1, y1]: [number, number, number, number]) {
  const [w, h] = size
  const f = (n: number) => +n.toFixed(4)
  return `${src}#c=${f(x0 / w)},${f(y0 / h)},${f((x1 - x0) / w)},${f((y1 - y0) / h)}`
}

export function cropOf(src: string): Crop | null {
  const m = src.match(/#c=([\d.]+),([\d.]+),([\d.]+),([\d.]+)$/)
  return m ? { x: +m[1], y: +m[2], w: +m[3], h: +m[4] } : null
}

/** Template sample photos are anything the user did not upload. */
export function isSamplePhoto(src: string | null) {
  return !!src && !isUserPhoto(src)
}

/** Re-requests a remote stock photo at a size that fits where it is drawn. Local data URLs pass through. */
export function sizedSrc(src: string, w: number) {
  if (!src.startsWith("https://images.unsplash.com/")) return src
  return src.replace(/([?&])w=\d+/, `$1w=${w}`)
}
