"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, Lightformer, PerformanceMonitor, useGLTF, useTexture } from "@react-three/drei";
import { EffectComposer, N8AO, SMAA } from "@react-three/postprocessing";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { house, phase, easeOut, easeOutBack } from "./state";
import { buildMaterials, patchSweep, sweep, textureUrls, type Mats } from "./materials";
import { B, builders } from "./builders";
import {
  areaOf,
  gardenWalls,
  gridX,
  gridZ,
  lamps,
  pieces,
  rooms,
  terrace,
  wallPieces,
  walls,
  type Piece,
  type Wall,
} from "./plan";
import type { Locale } from "@/lib/i18n";
import { digits } from "@/lib/i18n";

const MODELS = Array.from(new Set(pieces.filter((p) => p.kind === "glb").map((p) => (p as { model: string }).model)));
const modelUrl = (id: string) => `/house/models/${id}.glb`;
MODELS.forEach((m) => useGLTF.preload(modelUrl(m), false, true));

// Presented like a physical model on a black table: charcoal by day, black after dark.
const DAY_BG = new THREE.Color("#161616");
const NIGHT_BG = new THREE.Color("#050505");
const INK = new THREE.Color("#1d201e");
const IVORY = new THREE.Color("#f2eee7");
const SUN_DAY = new THREE.Color("#fff4e2");
const SUN_NIGHT = new THREE.Color("#9fb6ff");
const WORLD_UP = new THREE.Vector3(0, 1, 0);

/* ------------------------------------------------------------------
   Walls: generated from the plan, with openings, sills, lintels, glass.
------------------------------------------------------------------ */
function WallMesh({ w, index, mats, finish }: { w: Wall; index: number; mats: Mats; finish: THREE.Material }) {
  const group = useRef<THREE.Group>(null);
  const parts = useMemo(() => wallPieces(w), [w]);
  // Face order: +x, -x, +y, -y, +z, -z (local; local x runs along the wall)
  const faces = useMemo(() => {
    const arr: THREE.Material[] = [finish, finish, mats.cap, finish, finish, finish];
    if (w.outside) {
      const localOut =
        w.axis === "x" ? (w.outside === "pz" ? 4 : 5) : w.outside === "px" ? 5 : 4;
      arr[localOut] = mats.sandstone;
    }
    return arr;
  }, [w, mats, finish]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const p = house.p;
    const drawn = phase(p, 0.14 + index * 0.009, 0.2 + index * 0.009, easeOut);
    const rise = phase(p, 0.31 + index * 0.012, 0.42 + index * 0.012, easeOut);
    g.visible = drawn > 0.001;
    g.scale.set(Math.max(0.001, drawn), Math.max(0.012, rise), 1);
  });

  return (
    <group
      ref={group}
      position={w.axis === "x" ? [w.from, 0, w.c] : [w.c, 0, w.from]}
      rotation={[0, w.axis === "x" ? 0 : -Math.PI / 2, 0]}
      visible={false}
    >
      {parts.map((pt, i) => {
        const len = pt.x1 - pt.x0;
        const h = pt.y1 - pt.y0;
        const pos: [number, number, number] = [pt.x0 - w.from + len / 2, pt.y0 + h / 2, 0];
        return pt.glass ? (
          <mesh key={i} position={pos} material={mats.glass} renderOrder={2}>
            <boxGeometry args={[len, h, 0.03]} />
          </mesh>
        ) : (
          <B key={i} size={[len, h, w.t]} pos={pos} mat={faces} />
        );
      })}
    </group>
  );
}

function Structure({ mats }: { mats: Mats }) {
  const floorMat = { marble: mats.marble, parquet: mats.parquet, patio: mats.patio };
  const [px0, pz0, px1, pz1] = terrace.pool;
  const [tx0, tz0, tx1, tz1] = terrace.rect;
  const water = useRef<THREE.Group>(null);
  useFrame(() => {
    const k = phase(house.p, 0.84, 0.93);
    if (water.current) {
      water.current.visible = k > 0.001;
      water.current.scale.y = Math.max(0.001, k);
    }
  });
  return (
    <group>
      {/* plinth + floors */}
      <B size={[20.6, 0.45, 13.3]} pos={[0, -0.225, 0]} mat={mats.plinth} />
      {rooms.map((r) => {
        const [x0, z0, x1, z1] = r.rect;
        return (
          <B
            key={r.id}
            size={[x1 - x0, 0.02, z1 - z0]}
            pos={[(x0 + x1) / 2, 0.01, (z0 + z1) / 2]}
            mat={floorMat[r.floor]}
            cast={false}
          />
        );
      })}
      {/* terrace around the pool */}
      <group position={[0, -0.15, 0]}>
        <B size={[tx1 - tx0, 0.3, pz0 - tz0]} pos={[(tx0 + tx1) / 2, -0.15, (tz0 + pz0) / 2]} mat={mats.patio} cast={false} />
        <B size={[tx1 - tx0, 0.3, tz1 - pz1]} pos={[(tx0 + tx1) / 2, -0.15, (pz1 + tz1) / 2]} mat={mats.patio} cast={false} />
        <B size={[px0 - tx0, 0.3, pz1 - pz0]} pos={[(tx0 + px0) / 2, -0.15, (pz0 + pz1) / 2]} mat={mats.patio} cast={false} />
        <B size={[tx1 - px1, 0.3, pz1 - pz0]} pos={[(px1 + tx1) / 2, -0.15, (pz0 + pz1) / 2]} mat={mats.patio} cast={false} />
        {/* pool shell */}
        <B size={[px1 - px0, 0.02, pz1 - pz0]} pos={[(px0 + px1) / 2, -0.29, (pz0 + pz1) / 2]} mat={mats.sandstone} cast={false} />
        <group ref={water} position={[(px0 + px1) / 2, -0.28, (pz0 + pz1) / 2]} visible={false}>
          <mesh position={[0, 0.125, 0]} material={mats.water}>
            <boxGeometry args={[px1 - px0 - 0.02, 0.25, pz1 - pz0 - 0.02]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function GardenWalls({ mats }: { mats: Mats }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const k = phase(house.p, 0.33, 0.44, easeOut);
    if (ref.current) {
      ref.current.visible = k > 0.001;
      ref.current.scale.y = Math.max(0.001, k);
    }
  });
  return (
    <group ref={ref} visible={false}>
      {gardenWalls.map((w) => {
        const len = w.to - w.from;
        const mid = (w.from + w.to) / 2;
        return (
          <B
            key={w.id}
            size={w.axis === "x" ? [len, w.h, w.t] : [w.t, w.h, len]}
            pos={w.axis === "x" ? [mid, w.h / 2 - 0.46, w.c] : [w.c, w.h / 2 - 0.46, mid]}
            mat={mats.coral}
          />
        );
      })}
    </group>
  );
}

/* ------------------------------------------------------------------
   Furniture: clay pieces drop into place, then styling arrives.
------------------------------------------------------------------ */
function Model({ id }: { id: string }) {
  const { scene } = useGLTF(modelUrl(id), false, true);
  const clone = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((mt) => patchSweep(mt));
    });
    return c;
  }, [scene]);
  return <primitive object={clone} />;
}

function Arrive({ piece, order, count, mats }: { piece: Piece; order: number; count: number; mats: Mats }) {
  const ref = useRef<THREE.Group>(null);
  const [a, b] = piece.stage === "execute" ? [0.47, 0.6] : [0.81, 0.93];
  const start = a + ((b - a) * order) / Math.max(1, count);
  const baseY = piece.kind === "glb" ? piece.pos[1] : 0;
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const k = phase(house.p, start, start + 0.045, (t) => t);
    g.visible = k > 0.001;
    const s = Math.max(0.001, easeOutBack(k));
    g.scale.setScalar(piece.kind === "glb" ? s * (piece.scale ?? 1) : s);
    g.position.y = baseY + (1 - easeOut(k)) * 1.6;
  });
  if (piece.kind === "glb") {
    return (
      <group ref={ref} position={piece.pos} rotation={[0, piece.rot ?? 0, 0]} visible={false}>
        <Model id={piece.model} />
      </group>
    );
  }
  return (
    <group ref={ref} visible={false}>
      {builders[piece.build]?.(mats)}
    </group>
  );
}

function Furniture({ mats }: { mats: Mats }) {
  const exec = pieces.filter((p) => p.stage === "execute");
  const deliver = pieces.filter((p) => p.stage === "deliver");
  return (
    <group>
      {exec.map((p, i) => (
        <Arrive key={p.id} piece={p} order={i} count={exec.length} mats={mats} />
      ))}
      {deliver.map((p, i) => (
        <Arrive key={p.id} piece={p} order={i} count={deliver.length} mats={mats} />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------
   The drawing: grid, bubbles, dimensions, outlines, labels.
------------------------------------------------------------------ */
type Seg = [number, number, number, number];
const rectSegs = ([x0, z0, x1, z1]: [number, number, number, number]): Seg[] => [
  [x0, z0, x1, z0],
  [x1, z0, x1, z1],
  [x1, z1, x0, z1],
  [x0, z1, x0, z0],
];
const circleSegs = (cx: number, cz: number, r: number, n = 28): Seg[] =>
  Array.from({ length: n }, (_, i) => {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    return [cx + Math.cos(a0) * r, cz + Math.sin(a0) * r, cx + Math.cos(a1) * r, cz + Math.sin(a1) * r];
  });

const DIM_Z = -9.6;
const DIM_X = -12.2;
const BUBBLE_Z = -11.1;
const BUBBLE_X = -13.7;

function gridSegments(): Seg[] {
  const s: Seg[] = [];
  for (const x of gridX) {
    s.push([x, BUBBLE_Z + 0.6, x, 13]);
    s.push(...circleSegs(x, BUBBLE_Z, 0.6));
  }
  for (const z of gridZ) {
    s.push([BUBBLE_X + 0.6, z, 12.8, z]);
    s.push(...circleSegs(BUBBLE_X, z, 0.6));
  }
  // dimension chains
  s.push([gridX[0], DIM_Z, gridX[gridX.length - 1], DIM_Z]);
  for (const x of gridX) s.push([x - 0.22, DIM_Z + 0.22, x + 0.22, DIM_Z - 0.22]);
  s.push([DIM_X, gridZ[0], DIM_X, gridZ[gridZ.length - 1]]);
  for (const z of gridZ) s.push([DIM_X - 0.22, z + 0.22, DIM_X + 0.22, z - 0.22]);
  return s;
}

function detailSegments(): Seg[] {
  const s: Seg[] = [];
  for (const p of pieces) {
    if (!p.plan) continue;
    if (p.plan.kind === "rect") s.push(...rectSegs(p.plan.rect));
    else s.push(...circleSegs(p.plan.c[0], p.plan.c[1], p.plan.r, 24));
  }
  s.push(...rectSegs(terrace.pool));
  s.push(...rectSegs([terrace.pool[0] + 0.3, terrace.pool[1] + 0.3, terrace.pool[2] - 0.3, terrace.pool[3] - 0.3]));
  // door swings on the spine
  const swing = (hx: number, hz: number, r: number, a0: number, a1: number): Seg[] => {
    const out: Seg[] = [];
    for (let i = 0; i < 10; i++) {
      const t0 = a0 + ((a1 - a0) * i) / 10;
      const t1 = a0 + ((a1 - a0) * (i + 1)) / 10;
      out.push([hx + Math.cos(t0) * r, hz + Math.sin(t0) * r, hx + Math.cos(t1) * r, hz + Math.sin(t1) * r]);
    }
    out.push([hx, hz, hx + Math.cos(a1) * r, hz + Math.sin(a1) * r]);
    return out;
  };
  s.push(...swing(-1.6, 0.08, 1.3, 0, Math.PI / 2));
  s.push(...swing(0.6, 0.08, 1.1, 0, Math.PI / 2));
  s.push(...swing(-2.08, 0.6, 1, Math.PI / 2, Math.PI));
  // north point
  s.push(...circleSegs(13.2, -9.6, 0.9, 24), [13.2, -8.4, 13.2, -10.8], [13.2, -10.8, 12.8, -10.1], [13.2, -10.8, 13.6, -10.1]);
  return s;
}

function makeLines(segs: Seg[], width: number) {
  const geo = new LineSegmentsGeometry();
  const arr = new Float32Array(segs.length * 6);
  segs.forEach(([x0, z0, x1, z1], i) => arr.set([x0, 0, z0, x1, 0, z1], i * 6));
  geo.setPositions(arr);
  const mat = new LineMaterial({ color: 0x1d201e, linewidth: width, transparent: true, opacity: 0, depthWrite: false });
  const line = new LineSegments2(geo, mat);
  line.renderOrder = 5;
  return { line, geo, mat, count: segs.length };
}

function Drawing({ lang, night }: { lang: Locale; night: React.RefObject<HTMLDivElement | null> }) {
  const size = useThree((s) => s.size);
  const grid = useMemo(() => makeLines(gridSegments(), 1), []);
  const detail = useMemo(() => makeLines(detailSegments(), 1.3), []);
  const labels = useRef<(HTMLDivElement | null)[]>([]);
  const dims = useRef<(HTMLDivElement | null)[]>([]);
  const lineColor = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    grid.mat.resolution.set(size.width, size.height);
    detail.mat.resolution.set(size.width, size.height);
  }, [size, grid, detail]);

  useFrame(() => {
    const p = house.p;
    const out = 1 - phase(p, 0.3, 0.37);
    const gridDraw = phase(p, 0.01, 0.12, (t) => t);
    const detailDraw = phase(p, 0.19, 0.28, (t) => t);
    grid.geo.instanceCount = Math.floor(grid.count * gridDraw);
    detail.geo.instanceCount = Math.floor(detail.count * detailDraw);
    // Grid, bubbles and dimensions sit on the dark table: always light.
    // Furniture outlines sit on the pale model floor: ink by day, light after dark.
    lineColor.copy(INK).lerp(IVORY, house.night);
    grid.mat.color.copy(IVORY);
    detail.mat.color.copy(lineColor);
    grid.mat.opacity = 0.5 * out;
    detail.mat.opacity = 0.85 * out;
    grid.line.visible = detail.line.visible = out > 0.01;
    const labelIn = phase(p, 0.05, 0.12) * out;
    labels.current.forEach((el) => el && (el.style.opacity = String(labelIn)));
    const dimIn = phase(p, 0.2, 0.27) * out;
    dims.current.forEach((el) => el && (el.style.opacity = String(dimIn)));
    if (night.current) night.current.dataset.planVisible = String(out > 0.01);
  });

  const n = (v: string | number) => digits(v, lang);
  const areaUnit = lang === "ar" ? "م²" : "m²";
  // Room names sit on the model floor; axis letters and dimensions sit on the table.
  const labelCls =
    "pointer-events-none select-none whitespace-nowrap text-center transition-colors duration-700 text-[#1d201e] [[data-night=true]_&]:text-gypsum";
  const outerCls = "pointer-events-none select-none whitespace-nowrap text-center text-gypsum/80";

  const spans: { at: [number, number]; text: string }[] = [];
  for (let i = 0; i < gridX.length - 1; i++)
    spans.push({ at: [(gridX[i] + gridX[i + 1]) / 2, DIM_Z - 0.55], text: n(((gridX[i + 1] - gridX[i]) * 1000).toLocaleString("en").replace(",", " ")) });
  for (let i = 0; i < gridZ.length - 1; i++)
    spans.push({ at: [DIM_X - 0.7, (gridZ[i] + gridZ[i + 1]) / 2], text: n(((gridZ[i + 1] - gridZ[i]) * 1000).toLocaleString("en").replace(",", " ")) });

  let li = 0;
  let di = 0;
  return (
    <group position={[0, 0.03, 0]}>
      <primitive object={grid.line} />
      <primitive object={detail.line} />
      {rooms.map((r) => {
        const idx = li++;
        return (
          <Html key={r.id} position={[r.label[0], 0, r.label[1]]} center zIndexRange={[20, 0]}>
            <div ref={(el) => void (labels.current[idx] = el)} className={labelCls} style={{ opacity: 0 }}>
              <div className="label !text-[0.62rem]">{lang === "ar" ? r.name.ar : r.name.en}</div>
              <div className="font-mono text-[0.6rem] opacity-60">
                {n(areaOf(r.rect).toFixed(1))} {areaUnit}
              </div>
            </div>
          </Html>
        );
      })}
      <Html position={[terrace.label[0], 0, terrace.label[1]]} center zIndexRange={[20, 0]}>
        <div ref={(el) => void (labels.current[li] = el)} className={labelCls} style={{ opacity: 0 }}>
          <div className="label !text-[0.62rem]">{lang === "ar" ? terrace.name.ar : terrace.name.en}</div>
        </div>
      </Html>
      {gridX.map((x, i) => (
        <Html key={`bx${x}`} position={[x, 0, BUBBLE_Z]} center zIndexRange={[20, 0]}>
          <div ref={(el) => void (labels.current[rooms.length + 1 + i] = el)} className={`${outerCls} font-mono text-[0.62rem]`} style={{ opacity: 0 }}>
            {"ABCDE"[i]}
          </div>
        </Html>
      ))}
      {gridZ.map((z, i) => (
        <Html key={`bz${z}`} position={[BUBBLE_X, 0, z]} center zIndexRange={[20, 0]}>
          <div ref={(el) => void (labels.current[rooms.length + 1 + gridX.length + i] = el)} className={`${outerCls} font-mono text-[0.62rem]`} style={{ opacity: 0 }}>
            {n(i + 1)}
          </div>
        </Html>
      ))}
      {spans.map((s) => {
        const idx = di++;
        return (
          <Html key={`d${s.at.join()}`} position={[s.at[0], 0, s.at[1]]} center zIndexRange={[20, 0]}>
            <div ref={(el) => void (dims.current[idx] = el)} className={`${outerCls} font-mono text-[0.6rem]`} style={{ opacity: 0 }}>
              {s.text}
            </div>
          </Html>
        );
      })}
    </group>
  );
}

/* ------------------------------------------------------------------
   Ground: drafting grid that dissolves into the background.
------------------------------------------------------------------ */
function Ground() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uBg: { value: DAY_BG.clone() },
          uLine: { value: INK.clone() },
          uGrid: { value: 1 },
        },
        vertexShader: `varying vec3 vPos; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vPos = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
        fragmentShader: `
          uniform vec3 uBg; uniform vec3 uLine; uniform float uGrid; varying vec3 vPos;
          float gl(float v, float w){ float d = abs(fract(v - 0.5) - 0.5) / fwidth(v); return 1.0 - min(d / w, 1.0); }
          void main(){
            float g1 = max(gl(vPos.x, 1.0), gl(vPos.z, 1.0));
            float g5 = max(gl(vPos.x / 5.0, 1.0), gl(vPos.z / 5.0, 1.0));
            float fade = 1.0 - smoothstep(15.0, 34.0, length(vPos.xz));
            vec3 c = mix(uBg, uLine, (g1 * 0.07 + g5 * 0.14) * uGrid * fade);
            gl_FragColor = vec4(c, 1.0);
            #include <colorspace_fragment>
          }`,
        toneMapped: false,
      }),
    [],
  );
  const shadowMat = useMemo(() => new THREE.ShadowMaterial({ opacity: 0.16 }), []);
  useFrame(() => {
    mat.uniforms.uBg.value.copy(DAY_BG).lerp(NIGHT_BG, house.night);
    mat.uniforms.uLine.value.copy(IVORY);
    mat.uniforms.uGrid.value = (1 - phase(house.p, 0.32, 0.46) * 0.85) * (1 - 0.65 * house.night);
    shadowMat.opacity = 0.16 * (1 - house.night * 0.6);
  });
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.46, 0]} material={mat}>
        <planeGeometry args={[240, 240]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.455, 0]} material={shadowMat} receiveShadow>
        <planeGeometry args={[120, 120]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------
   Camera, lighting blend and the demand-mode render loop.
------------------------------------------------------------------ */
function Rig({
  mats,
  sun,
  hemi,
  lampRefs,
  poolLight,
}: {
  mats: Mats;
  sun: React.RefObject<THREE.DirectionalLight | null>;
  hemi: React.RefObject<THREE.HemisphereLight | null>;
  lampRefs: React.RefObject<(THREE.PointLight | null)[]>;
  poolLight: React.RefObject<THREE.PointLight | null>;
}) {
  const { camera, scene, size, invalidate } = useThree();
  const tmp = useMemo(
    () => ({ target: new THREE.Vector3(), pos: new THREE.Vector3(), up: new THREE.Vector3(), right: new THREE.Vector3(), bg: new THREE.Color() }),
    [],
  );

  useEffect(() => {
    house.invalidate = invalidate;
    if (process.env.NODE_ENV !== "production") Object.assign(window, { __house: { scene, house } });
    invalidate();
    return () => {
      house.invalidate = () => {};
    };
  }, [invalidate, scene]);

  // Runs before every other frame callback (a negative priority keeps automatic rendering).
  useFrame((_, rawDt) => {
    const s = house;
    // After idling, the first delta can be seconds long; clamp it so changes always animate.
    const dt = Math.min(rawDt, 1 / 30);
    const k = 1 - Math.exp(-dt * 5);
    s.p += (s.target - s.p) * k;
    s.night += (s.nightTarget - s.night) * (1 - Math.exp(-dt * 3));
    const moving = Math.abs(s.target - s.p) > 0.0003 || Math.abs(s.nightTarget - s.night) > 0.002;
    if (!moving) {
      s.p = s.target;
      s.night = s.nightTarget;
    }
    const p = s.p;
    const n = s.night;

    // camera: plan view → isometric → a slow settle
    const toIso = phase(p, 0.3, 0.46);
    const settle = phase(p, 0.8, 1);
    const elev = THREE.MathUtils.degToRad(90 - 48 * toIso - 5 * settle);
    const azim = THREE.MathUtils.degToRad(-45 * toIso + 9 * settle + s.pointer.x * 2.5 * toIso);
    tmp.target.set(0.4 - 0.4 * toIso, 0, 1.8 - 1.3 * toIso);
    const R = 90;
    tmp.pos.set(
      tmp.target.x + R * Math.cos(elev) * Math.sin(azim),
      tmp.target.y + R * Math.sin(elev),
      tmp.target.z + R * Math.cos(elev) * Math.cos(azim),
    );
    tmp.up.set(0, 0, -1).lerp(WORLD_UP, toIso).normalize();
    camera.up.copy(tmp.up);
    camera.position.copy(tmp.pos);
    camera.lookAt(tmp.target);

    const wide = size.width >= 1024;
    const span = wide ? 42 : size.width < 700 ? 38 : 32;
    const base = Math.min(size.width / span, size.height / (span * 0.62));
    const ortho = camera as THREE.OrthographicCamera;
    ortho.zoom = base * (1 + 0.08 * toIso + (wide ? 0.08 : 0.04) * settle);
    if (wide) {
      // keep the model clear of the copy column on the left
      tmp.right.set(1, 0, 0).applyQuaternion(camera.quaternion);
      camera.position.addScaledVector(tmp.right, -(size.width * 0.16) / ortho.zoom);
    } else {
      // on narrow screens the copy sits on top, so lower the model
      tmp.right.set(0, 1, 0).applyQuaternion(camera.quaternion);
      camera.position.addScaledVector(tmp.right, (size.height * 0.1) / ortho.zoom);
    }
    ortho.updateProjectionMatrix();

    // walls cap: ink poché in plan, ivory once standing
    mats.cap.color.copy(INK).lerp(IVORY, phase(p, 0.3, 0.42));

    // material sweep
    const sw = phase(p, 0.63, 0.79, (t) => t);
    sweep.uSweep.value = -18 + 36 * sw;
    sweep.uEdgeAmt.value = sw > 0 && sw < 1 ? 1.4 : 0;

    // lighting blend
    tmp.bg.copy(DAY_BG).lerp(NIGHT_BG, n);
    scene.background = tmp.bg;
    scene.environmentIntensity = THREE.MathUtils.lerp(0.85, 0.08, n);
    if (hemi.current) hemi.current.intensity = THREE.MathUtils.lerp(0.55, 0.06, n);
    if (sun.current) {
      sun.current.intensity = THREE.MathUtils.lerp(2.4, 0.18, n);
      sun.current.color.copy(SUN_DAY).lerp(SUN_NIGHT, n);
    }
    const lit = phase(p, 0.44, 0.54) * n;
    lampRefs.current?.forEach((l, i) => l && (l.intensity = lamps[i].intensity * 5 * lit));
    if (poolLight.current) poolLight.current.intensity = 60 * n * phase(p, 0.86, 0.94);
    mats.glass.emissiveIntensity = n * phase(p, 0.66, 0.8) * 0.9;
    mats.glass.opacity = 0.25 * phase(p, 0.66, 0.78);
    mats.water.emissiveIntensity = n * 0.85;

    if (moving) invalidate();
  }, -1);
  return null;
}

function Lights({ mats, shadows }: { mats: Mats; shadows: boolean }) {
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const lampRefs = useRef<(THREE.PointLight | null)[]>([]);
  const poolLight = useRef<THREE.PointLight>(null);
  return (
    <>
      <hemisphereLight ref={hemi} args={["#fffaf1", "#b9ae9c", 0.55]} />
      <directionalLight
        ref={sun}
        position={[-16, 24, -9]}
        intensity={2.4}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />
      {lamps.map((l, i) => (
        <pointLight
          key={i}
          ref={(el) => void (lampRefs.current[i] = el)}
          position={l.pos}
          color="#ffb86e"
          intensity={0}
          distance={l.distance}
          decay={2}
        />
      ))}
      <pointLight ref={poolLight} position={[1.9, -0.6, 9.7]} color="#35d3e6" intensity={0} distance={9} decay={2} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 12, 0]} rotation-x={Math.PI / 2} scale={[24, 24, 1]} />
        <Lightformer form="rect" intensity={1.1} position={[-18, 6, 10]} scale={[14, 6, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.6} position={[18, 5, -10]} scale={[14, 6, 1]} target={[0, 0, 0]} color="#ffe2b8" />
      </Environment>
      <Rig mats={mats} sun={sun} hemi={hemi} lampRefs={lampRefs} poolLight={poolLight} />
    </>
  );
}

function World({ lang, shadows, overlay }: { lang: Locale; shadows: boolean; overlay: React.RefObject<HTMLDivElement | null> }) {
  const gl = useThree((s) => s.gl);
  const tex = useTexture(textureUrls());
  const mats = useMemo(
    () => buildMaterials(tex as unknown as Record<string, THREE.Texture>, Math.min(8, gl.capabilities.getMaxAnisotropy())),
    [tex, gl],
  );
  return (
    <>
      <Ground />
      <Structure mats={mats} />
      {walls.map((w, i) => (
        <WallMesh key={w.id} w={w} index={i} mats={mats} finish={mats.plaster} />
      ))}
      <GardenWalls mats={mats} />
      <Furniture mats={mats} />
      <Drawing lang={lang} night={overlay} />
      <Lights mats={mats} shadows={shadows} />
    </>
  );
}

export default function HouseScene({
  lang,
  overlay,
  onReady,
}: {
  lang: Locale;
  overlay: React.RefObject<HTMLDivElement | null>;
  onReady?: () => void;
}) {
  const [quality, setQuality] = useState<"high" | "low">("high");
  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) setQuality("low");
    const fine = window.matchMedia("(pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      house.pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      house.pointer.y = (e.clientY / window.innerHeight - 0.5) * -2;
      house.invalidate();
    };
    if (fine) window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const high = quality === "high";
  return (
    <Canvas
      orthographic
      frameloop="demand"
      dpr={high ? [1, 1.75] : [1, 1.25]}
      shadows={high ? "soft" : false}
      camera={{ position: [0, 90, 0.01], zoom: 20, near: 1, far: 400 }}
      gl={{ antialias: !high, powerPreference: "high-performance", alpha: false, stencil: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      aria-hidden="true"
    >
      <PerformanceMonitor onDecline={() => setQuality("low")} />
      <Suspense fallback={null}>
        <World lang={lang} shadows={high} overlay={overlay} />
        <Ready onReady={onReady} />
        {high && (
          <EffectComposer multisampling={0} enableNormalPass={false}>
            <N8AO halfRes aoRadius={1.2} intensity={2.2} distanceFalloff={0.8} quality="performance" color="black" />
            <SMAA />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  );
}

function Ready({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    onReady?.();
    house.invalidate();
  }, [onReady]);
  return null;
}
