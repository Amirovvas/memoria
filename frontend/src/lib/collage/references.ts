/**
 * Reference collages (Supabase Storage bucket "assets"). Each lists the photo frames in the order its layout places them,
 * in pixels of the source image, so the layout geometry and the sample crops come from the same numbers.
 */

import { asset } from "../photos"

export type Box = [number, number, number, number]
export type Size = [number, number]

export interface Reference {
  src: string
  size: Size
  slots: Box[]
  /** pieces of the original drawn above the photos: notes, tape, stickers */
  overlays?: Box[]
  /**
   * Where the sample photos are cut from, when it differs from the frame: the window slides past text
   * printed on the original (keeping the frame's proportions), so the caption can be an editable text.
   */
  crops?: Box[]
}

const grid = (cols: [number, number][], rows: [number, number][]): Box[] =>
  rows.flatMap(([y0, y1]) => cols.map(([x0, x1]): Box => [x0, y0, x1, y1]))

export const REF = {
  paperBirthday: {
    src: asset("12.jpg"),
    size: [736, 1308],
    slots: [
      [0, 0, 432, 375],
      [455, 0, 736, 150],
      [452, 272, 734, 572],
      // cut short of the printed "Happy Birthday", which is now an editable caption
      [12, 408, 432, 745],
      [505, 680, 736, 1052],
      [18, 1012, 415, 1308],
      [445, 1055, 736, 1308],
    ],
  },
  roma: {
    src: asset("13.jpg"),
    size: [675, 1200],
    slots: grid(
      [
        [0, 337],
        [338, 675],
      ],
      [
        [0, 598],
        [600, 1200],
      ],
    ),
    crops: [
      [9, 0, 329, 572],
      [346, 0, 666, 572],
      [9, 632, 328, 1200],
      [347, 632, 666, 1200],
    ],
  },
  vietnam: {
    src: asset("14.jpg"),
    size: [675, 1200],
    slots: [
      [0, 0, 240, 390],
      [240, 0, 455, 312],
      [455, 0, 675, 320],
      [213, 312, 455, 570],
      [455, 322, 675, 568],
      [0, 390, 213, 690],
      [428, 570, 675, 945],
      [0, 690, 205, 1020],
      [205, 570, 428, 970],
      [0, 1020, 210, 1200],
      [210, 970, 445, 1200],
      [445, 948, 675, 1200],
    ],
    crops: [
      [0, 0, 240, 390],
      [240, 0, 455, 312],
      [455, 0, 675, 320],
      [213, 312, 455, 570],
      [455, 322, 675, 568],
      [0, 420, 172, 662],
      [470, 642, 670, 945],
      [0, 690, 205, 1020],
      [226, 645, 407, 970],
      [0, 1020, 210, 1200],
      [210, 970, 445, 1200],
      [445, 948, 675, 1200],
    ],
  },
  como: {
    src: asset("15.jpg"),
    size: [736, 1308],
    slots: [
      [0, 0, 736, 435],
      [0, 437, 736, 870],
      [0, 872, 736, 1308],
    ],
    crops: [
      [0, 0, 736, 435],
      [280, 560, 736, 828],
      [0, 872, 736, 1308],
    ],
  },
  home: {
    src: asset("16.jpg"),
    size: [675, 1200],
    slots: [
      [207, 515, 486, 840],
      [5, 462, 197, 612],
      [495, 460, 675, 608],
      [100, 380, 197, 456],
      [40, 405, 92, 456],
      [207, 428, 318, 507],
      [378, 428, 485, 506],
      [495, 383, 588, 454],
      [596, 400, 649, 452],
      [5, 618, 75, 688],
      [82, 618, 197, 733],
      [125, 742, 197, 812],
      [495, 615, 603, 733],
      [612, 615, 675, 688],
      [495, 740, 568, 815],
      [230, 848, 287, 902],
      [295, 848, 397, 928],
      [405, 848, 460, 902],
    ],
  },
  kraft: {
    src: asset("17.jpg"),
    size: [736, 1104],
    slots: [
      [20, 28, 382, 382],
      [430, 140, 736, 458],
      [40, 385, 245, 590],
      [235, 505, 515, 815],
      [28, 652, 212, 822],
      [545, 680, 736, 940],
      [348, 832, 622, 1062],
    ],
    overlays: [
      [388, 8, 567, 200],
      [330, 322, 478, 498],
      [495, 483, 716, 692],
    ],
  },
  memoriesQuote: {
    src: asset("18.jpg"),
    size: [736, 1104],
    slots: [
      [52, 58, 448, 490],
      [405, 150, 700, 535],
      [60, 785, 340, 920],
      [258, 790, 695, 1042],
    ],
  },
  golden: {
    src: asset("19.jpg"),
    size: [736, 1308],
    slots: [
      [0, 0, 736, 422],
      [0, 425, 736, 865],
      [0, 868, 736, 1308],
    ],
    crops: [
      [0, 0, 736, 422],
      [190, 668, 528, 870],
      [0, 868, 736, 1308],
    ],
  },
  moss: {
    src: asset("20.jpg"),
    size: [711, 1200],
    slots: grid(
      [
        [0, 358],
        [360, 711],
      ],
      [
        [0, 578],
        [582, 1200],
      ],
    ),
    crops: [
      [9, 0, 349, 550],
      [369, 0, 702, 550],
      [6, 605, 351, 1200],
      [366, 605, 704, 1200],
    ],
  },
  roadTrip: {
    src: asset("21.jpg"),
    size: [736, 1308],
    slots: [
      [8, 88, 368, 345],
      [375, 0, 736, 320],
      [412, 358, 716, 762],
      [28, 485, 385, 958],
      [428, 770, 716, 985],
      [22, 965, 262, 1298],
      [292, 993, 709, 1268],
    ],
    overlays: [
      [248, 55, 432, 74],
      [388, 333, 476, 380],
      [0, 455, 80, 502],
      [648, 726, 736, 772],
      [316, 925, 460, 990],
    ],
  },
  travelDump: {
    src: asset("22.jpg"),
    size: [736, 1308],
    slots: grid(
      [
        [0, 245],
        [247, 490],
        [492, 736],
      ],
      [
        [0, 435],
        [437, 870],
        [872, 1308],
      ],
    ),
  },
  trail: {
    src: asset("travel.png"),
    size: [553, 955],
    slots: [
      [0, 0, 188, 160],
      [188, 0, 375, 95],
      [375, 0, 553, 160],
      [0, 160, 140, 345],
      [252, 93, 422, 335],
      [422, 160, 553, 430],
      [140, 232, 252, 470],
      [252, 335, 390, 470],
      [0, 470, 350, 690],
      [0, 345, 140, 525],
      [355, 495, 553, 632],
      [0, 690, 200, 955],
      [200, 700, 352, 955],
      [352, 632, 553, 955],
    ],
  },
  gradTorn: {
    src: asset("23.jpg"),
    size: [736, 920],
    slots: [
      [0, 10, 490, 215],
      [490, 0, 736, 215],
      [0, 400, 245, 840],
      [245, 400, 736, 920],
    ],
    // the paper bands of the original cover the edges of its frames; the samples come from what is left in view
    crops: [
      [60, 48, 419, 198],
      [490, 30, 736, 245],
      [0, 395, 245, 835],
      [245, 400, 736, 920],
    ],
  },
  gradFilm: {
    src: asset("24.jpg"),
    size: [736, 1308],
    slots: [
      [94, 107, 349, 546],
      [386, 107, 641, 546],
      [94, 568, 349, 1006],
      [386, 568, 641, 1006],
    ],
  },
  gradBows: {
    src: asset("25.jpg"),
    size: [736, 1308],
    slots: [
      [407, 224, 692, 652],
      [2, 372, 400, 655],
      [8, 669, 305, 964],
      [323, 667, 709, 956],
      [85, 968, 358, 1308],
      [397, 972, 673, 1308],
    ],
  },
} satisfies Record<string, Reference>

/** Note cards of travel.png: covered by editable cards so their text can change per category. */
export const TRAIL_CARDS: Box[] = [
  [98, 133, 222, 230],
  [326, 380, 458, 495],
  [98, 672, 276, 735],
]
