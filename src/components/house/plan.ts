import type { L } from "@/lib/i18n";

/**
 * Ground floor of the demonstration villa, in metres.
 * x runs left → right, z runs back → front (towards the terrace).
 * The same data drives the 2D drawing and the 3D model, so they always agree.
 */

export const WALL_H = 3.0;
export const PART_H = 2.7;
/** Walls facing the camera are cut low, like a sectional model. */
export const NEAR_H = 1.05;

export type Opening = { at: number; width: number; sill?: number; head?: number; glass?: boolean };

export type Wall = {
  id: string;
  axis: "x" | "z";
  /** fixed coordinate (z for axis "x", x for axis "z") */
  c: number;
  from: number;
  to: number;
  t: number;
  h: number;
  /** which face points outside (gets exterior cladding) */
  outside?: "px" | "nx" | "pz" | "nz";
  openings?: Opening[];
};

export const walls: Wall[] = [
  {
    id: "back",
    axis: "x",
    c: -6.5,
    from: -10.15,
    to: 10.15,
    t: 0.3,
    h: WALL_H,
    outside: "nz",
    openings: [
      { at: -6.4, width: 3, sill: 1.1, head: 2.3, glass: true },
      { at: 3.6, width: 1.8, sill: 0.95, head: 2.55, glass: true },
      { at: 7, width: 1.8, sill: 0.95, head: 2.55, glass: true },
    ],
  },
  {
    id: "right",
    axis: "z",
    c: 10,
    from: -6.35,
    to: 6.35,
    t: 0.3,
    h: WALL_H,
    outside: "px",
    openings: [
      { at: -3.3, width: 2.2, sill: 0.95, head: 2.45, glass: true },
      { at: 5.3, width: 1.6, sill: 0.1, head: 2.6, glass: true },
    ],
  },
  {
    id: "front",
    axis: "x",
    c: 6.5,
    from: -10.15,
    to: 10.15,
    t: 0.3,
    h: NEAR_H,
    outside: "pz",
    openings: [
      { at: 0, width: 1.6 },
      { at: 6.2, width: 3.6 },
      { at: -6, width: 2.6, sill: 0.55, glass: true },
    ],
  },
  {
    id: "left",
    axis: "z",
    c: -10,
    from: -6.35,
    to: 6.35,
    t: 0.3,
    h: NEAR_H,
    outside: "nx",
    openings: [
      { at: -3.2, width: 2, sill: 0.9, glass: true },
      { at: 3.4, width: 2, sill: 0.55, glass: true },
    ],
  },
  {
    id: "spine",
    axis: "x",
    c: 0,
    from: -9.85,
    to: 9.85,
    t: 0.16,
    h: PART_H,
    openings: [
      { at: -0.95, width: 1.3, head: 2.3 },
      { at: 1.15, width: 1.1, head: 2.3 },
      { at: 8.9, width: 1.1, head: 2.3 },
    ],
  },
  { id: "kitchen-majlis", axis: "z", c: 0, from: -6.35, to: -0.08, t: 0.16, h: PART_H },
  {
    id: "bed-hall",
    axis: "z",
    c: -2,
    from: 0.08,
    to: 6.35,
    t: 0.16,
    h: PART_H,
    openings: [{ at: 1.1, width: 1, head: 2.3 }],
  },
  {
    id: "hall-living",
    axis: "z",
    c: 2,
    from: 0.08,
    to: 6.35,
    t: 0.16,
    h: PART_H,
    openings: [{ at: 4.6, width: 2.4, head: 2.4 }],
  },
];

/** Splits a wall into solid runs, sills, lintels and glass panes (distances along the wall). */
export function wallPieces(w: Wall) {
  const out: { x0: number; x1: number; y0: number; y1: number; glass?: boolean }[] = [];
  const ops = [...(w.openings ?? [])].sort((a, b) => a.at - b.at);
  let cursor = w.from;
  for (const o of ops) {
    const a = o.at - o.width / 2;
    const b = o.at + o.width / 2;
    if (a > cursor) out.push({ x0: cursor, x1: a, y0: 0, y1: w.h });
    if (o.sill) out.push({ x0: a, x1: b, y0: 0, y1: Math.min(o.sill, w.h) });
    if (o.head && o.head < w.h) out.push({ x0: a, x1: b, y0: o.head, y1: w.h });
    if (o.glass) out.push({ x0: a, x1: b, y0: o.sill ?? 0, y1: Math.min(o.head ?? w.h, w.h), glass: true });
    cursor = b;
  }
  if (cursor < w.to) out.push({ x0: cursor, x1: w.to, y0: 0, y1: w.h });
  return out;
}

/** Garden wall in Jeddah coral stone, behind and beside the villa. */
export const gardenWalls: Wall[] = [
  { id: "g-back", axis: "x", c: -8.4, from: -12.4, to: 12.4, t: 0.35, h: 2.2 },
  { id: "g-right", axis: "z", c: 12.2, from: -8.4, to: 12.8, t: 0.35, h: 2.2 },
];

export type Room = {
  id: string;
  name: L;
  rect: [number, number, number, number];
  floor: "marble" | "parquet" | "patio";
  label: [number, number];
};

export const rooms: Room[] = [
  { id: "kitchen", name: { en: "Kitchen & dining", ar: "المطبخ والطعام" }, rect: [-10, -6.5, 0, 0], floor: "marble", label: [-5.4, -1.1] },
  { id: "majlis", name: { en: "Majlis", ar: "المجلس" }, rect: [0, -6.5, 10, 0], floor: "marble", label: [5, -1.1] },
  { id: "bedroom", name: { en: "Master bedroom", ar: "غرفة النوم الرئيسية" }, rect: [-10, 0, -2, 6.5], floor: "parquet", label: [-6, 4.9] },
  { id: "hall", name: { en: "Entrance hall", ar: "المدخل" }, rect: [-2, 0, 2, 6.5], floor: "marble", label: [0, 3] },
  { id: "living", name: { en: "Living", ar: "المعيشة" }, rect: [2, 0, 10, 6.5], floor: "marble", label: [4.4, 1.2] },
];

export const terrace = {
  name: { en: "Terrace & pool", ar: "التراس والمسبح" } as L,
  rect: [-10.3, 6.65, 10.3, 12.6] as [number, number, number, number],
  pool: [-3.2, 8.1, 7, 11.3] as [number, number, number, number],
  label: [-5.6, 11.8] as [number, number],
};

/** Net floor area, allowing for half of each bounding wall. */
export const areaOf = (r: [number, number, number, number]) => {
  const w = Math.abs(r[2] - r[0]) - 0.23;
  const d = Math.abs(r[3] - r[1]) - 0.23;
  return Math.round(w * d * 10) / 10;
};

/* ------------------------------------------------------------------
   Furniture. `stage` decides when a piece arrives: the build (execute)
   or the styling pass (deliver). `plan` is its drawn outline.
------------------------------------------------------------------ */
export type PlanShape = { kind: "rect"; rect: [number, number, number, number] } | { kind: "circle"; c: [number, number]; r: number };

export type Piece =
  | { id: string; kind: "glb"; model: string; pos: [number, number, number]; rot?: number; scale?: number; stage: "execute" | "deliver"; plan?: PlanShape }
  | { id: string; kind: "proc"; build: string; stage: "execute" | "deliver"; plan?: PlanShape };

const glb = (
  id: string,
  model: string,
  pos: [number, number, number],
  rot = 0,
  stage: "execute" | "deliver" = "execute",
  plan?: PlanShape,
  scale = 1,
): Piece => ({ id, kind: "glb", model, pos, rot, stage, plan, scale });

const deg = (d: number) => (d * Math.PI) / 180;

export const pieces: Piece[] = [
  // Kitchen & dining
  { id: "kitchen-run", kind: "proc", build: "kitchenRun", stage: "execute", plan: { kind: "rect", rect: [-9.8, -6.35, -3.2, -5.7] } },
  { id: "island", kind: "proc", build: "island", stage: "execute", plan: { kind: "rect", rect: [-8, -3.75, -4.2, -2.45] } },
  { id: "stools", kind: "proc", build: "stools", stage: "execute" },
  { id: "dining-table", kind: "proc", build: "diningTable", stage: "execute", plan: { kind: "rect", rect: [-2.55, -4.55, -1.45, -2.05] } },
  glb("chair-1", "dining_chair_02", [-3.05, 0, -4.0], deg(90)),
  glb("chair-2", "dining_chair_02", [-3.05, 0, -3.3], deg(90)),
  glb("chair-3", "dining_chair_02", [-3.05, 0, -2.6], deg(90)),
  glb("chair-4", "dining_chair_02", [-0.95, 0, -4.0], deg(-90)),
  glb("chair-5", "dining_chair_02", [-0.95, 0, -3.3], deg(-90)),
  glb("chair-6", "dining_chair_02", [-0.95, 0, -2.6], deg(-90)),
  glb("pendant-1", "modern_ceiling_lamp_01", [-7.1, 1.83, -3.1], 0, "deliver"),
  glb("pendant-2", "modern_ceiling_lamp_01", [-6.1, 1.83, -3.1], 0, "deliver"),
  glb("pendant-3", "modern_ceiling_lamp_01", [-5.1, 1.83, -3.1], 0, "deliver"),
  glb("pendant-4", "modern_ceiling_lamp_01", [-2, 1.75, -3.3], 0, "deliver"),

  // Majlis
  { id: "majlis-seating", kind: "proc", build: "majlisSeating", stage: "execute", plan: { kind: "rect", rect: [0.3, -6.3, 9.7, -5.45] } },
  { id: "majlis-rug", kind: "proc", build: "majlisRug", stage: "execute", plan: { kind: "rect", rect: [2.4, -4.9, 7.8, -1.5] } },
  glb("majlis-table", "coffee_table_round_01", [5.1, 0, -3.2], 0, "execute", { kind: "circle", c: [5.1, -3.2], r: 0.55 }),
  glb("ottoman-1", "Ottoman_01", [3.3, 0, -2.2], deg(10)),
  glb("ottoman-2", "Ottoman_01", [6.9, 0, -2.2], deg(-10)),
  glb("majlis-vase", "brass_vase_01", [5.1, 0.49, -3.2], 0, "deliver"),
  glb("majlis-plant", "potted_plant_02", [9.3, 0, -0.7], 0, "deliver"),

  // Living
  { id: "living-sofa", kind: "proc", build: "livingSofa", stage: "execute", plan: { kind: "rect", rect: [5.2, 0.9, 6.2, 4.9] } },
  { id: "living-rug", kind: "proc", build: "livingRug", stage: "execute", plan: { kind: "rect", rect: [5, 1.2, 9.2, 5.2] } },
  { id: "tv", kind: "proc", build: "tv", stage: "execute" },
  glb("console", "modern_wooden_cabinet", [9.62, 0, 3.1], deg(-90), "execute", { kind: "rect", rect: [9.2, 2.1, 9.85, 4.1] }),
  glb("living-table", "modern_coffee_table_01", [7.3, 0, 3], 0, "execute", { kind: "rect", rect: [7, 2.4, 7.6, 3.6] }),
  glb("lounge", "mid_century_lounge_chair", [8.5, 0, 5.4], deg(-153), "execute", { kind: "circle", c: [8.5, 5.4], r: 0.5 }),
  glb("armchair", "modern_arm_chair_01", [8.4, 0, 1], deg(-28), "execute", { kind: "rect", rect: [8, 0.6, 8.8, 1.4] }),
  glb("living-plant", "potted_plant_02", [9.4, 0, 0.6], 0, "deliver"),
  glb("console-vase", "ceramic_vase_01", [9.6, 0.68, 2.4], 0, "deliver"),
  glb("console-plant", "potted_plant_04", [9.6, 0.68, 3.9], 0, "deliver", undefined, 1.4),

  // Hall
  glb("hall-plant", "potted_plant_02", [-1.35, 0, 5.75], 0.6, "deliver", undefined, 1.1),
  glb("hall-plant-2", "potted_plant_02", [1.35, 0, 5.75], -0.4, "deliver", undefined, 1.1),
  { id: "hall-bench", kind: "proc", build: "hallBench", stage: "execute", plan: { kind: "rect", rect: [-1.75, 2, -1.35, 4] } },

  // Bedroom
  { id: "bed", kind: "proc", build: "bed", stage: "execute", plan: { kind: "rect", rect: [-7.1, 0.2, -4.9, 2.45] } },
  { id: "wardrobe", kind: "proc", build: "wardrobe", stage: "execute", plan: { kind: "rect", rect: [-2.72, 2.8, -2.08, 6.1] } },
  { id: "bed-rug", kind: "proc", build: "bedRug", stage: "execute" },
  glb("bed-vase", "ceramic_vase_01", [-7.5, 0.5, 0.45], 0, "deliver"),

  // Terrace
  { id: "loungers", kind: "proc", build: "loungers", stage: "execute" },
  { id: "palms", kind: "proc", build: "palms", stage: "deliver" },
  glb("terrace-plant-1", "potted_plant_02", [-9.6, -0.15, 7.3], 1.2, "deliver", undefined, 1.3),
  glb("island-plant", "potted_plant_04", [-4.7, 0.97, -3.1], 0, "deliver", undefined, 1.2),
  glb("dining-plant", "potted_plant_04", [-2, 0.79, -3.3], 0, "deliver", undefined, 1.1),
  glb("terrace-plant-2", "potted_plant_02", [9.6, -0.15, 7.3], 0, "deliver", undefined, 1.2),
];

/** Structural grid for the drawing: bubbles A–E across, 1–3 down. */
export const gridX = [-10, -2, 0, 2, 10];
export const gridZ = [-6.5, 0, 6.5];

/** Interior lights (evening), warm and at pendant height. */
export const lamps: { pos: [number, number, number]; intensity: number; distance: number }[] = [
  { pos: [-6.1, 2.1, -3.1], intensity: 9, distance: 7 },
  { pos: [-2, 2.1, -3.3], intensity: 6, distance: 5 },
  { pos: [5.1, 2.4, -3.3], intensity: 10, distance: 8 },
  { pos: [7.2, 2.4, 3], intensity: 9, distance: 7 },
  { pos: [-6, 2.2, 1.8], intensity: 7, distance: 6 },
  { pos: [0, 2.3, 3.4], intensity: 5, distance: 5 },
];
