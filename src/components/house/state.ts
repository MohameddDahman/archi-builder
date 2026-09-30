/**
 * Mutable state shared between the scroll-driven DOM and the WebGL scene.
 * Lives outside React so scrolling never re-renders the canvas tree.
 */
export const house = {
  /** Raw scroll progress through the sequence, 0..1 */
  target: 0,
  /** Smoothed progress the scene renders */
  p: 0,
  /** 0 = daylight, 1 = evening */
  nightTarget: 0,
  night: 0,
  pointer: { x: 0, y: 0 },
  invalidate: () => {},
};

/** Stage boundaries, one per step of the studio's process. */
export const STAGES = [0, 0.14, 0.3, 0.46, 0.62, 0.8, 1] as const;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeOutBack = (t: number) => {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/** Eased local progress of p between a and b. */
export const phase = (p: number, a: number, b: number, ease: (t: number) => number = easeInOut) =>
  ease(clamp01((p - a) / (b - a)));

export const stageOf = (p: number) => {
  for (let i = STAGES.length - 2; i >= 0; i--) if (p >= STAGES[i]) return i;
  return 0;
};
