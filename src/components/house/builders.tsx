"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { boxUV, type Mats } from "./materials";

type V3 = [number, number, number];

/** Box in metres with world-scale UVs. `r` rounds the edges (upholstery). */
export function B({
  size,
  pos,
  mat,
  r = 0,
  rot,
  cast = true,
}: {
  size: V3;
  pos: V3;
  mat: THREE.Material | THREE.Material[];
  r?: number;
  rot?: V3;
  cast?: boolean;
}) {
  const geo = useMemo(() => {
    const g = r > 0 ? new RoundedBoxGeometry(size[0], size[1], size[2], 3, r) : new THREE.BoxGeometry(...size);
    return boxUV(g, pos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size[0], size[1], size[2], r, pos[0], pos[1], pos[2]]);
  return <mesh geometry={geo} position={pos} rotation={rot} material={mat} castShadow={cast} receiveShadow />;
}

/** Cylinder helper (legs, stools, lamps). */
function Cyl({ r, h, pos, mat, seg = 16 }: { r: number; h: number; pos: V3; mat: THREE.Material; seg?: number }) {
  return (
    <mesh position={pos} material={mat} castShadow receiveShadow>
      <cylinderGeometry args={[r, r, h, seg]} />
    </mesh>
  );
}

/* ------------------------------------------------------------------
   Procedural furniture. Each returns a group in world coordinates.
------------------------------------------------------------------ */
export const builders: Record<string, (m: Mats) => React.ReactNode> = {
  kitchenRun: (m) => (
    <group>
      <B size={[6.2, 0.86, 0.62]} pos={[-6.5, 0.43, -6.02]} mat={m.walnut} />
      <B size={[6.3, 0.04, 0.66]} pos={[-6.45, 0.88, -6.0]} mat={m.counter} />
      <B size={[1.2, 2.45, 0.64]} pos={[-9.2, 1.225, -6.02]} mat={m.walnut} />
      <B size={[6.2, 0.55, 0.02]} pos={[-6.5, 1.18, -6.34]} mat={m.counter} cast={false} />
      <B size={[0.8, 0.02, 0.5]} pos={[-5.2, 0.905, -6.0]} mat={m.black} cast={false} />
    </group>
  ),
  island: (m) => (
    <group>
      <B size={[3.5, 0.88, 0.9]} pos={[-6.1, 0.44, -3.1]} mat={m.oak} />
      <B size={[3.8, 0.05, 1.3]} pos={[-6.1, 0.905, -3.1]} mat={m.counter} r={0.02} />
    </group>
  ),
  stools: (m) => (
    <group>
      {[-7.2, -6.1, -5.0].map((x) => (
        <group key={x} position={[x, 0, -2.15]}>
          <B size={[0.42, 0.06, 0.42]} pos={[0, 0.66, 0]} mat={m.leatherTaupe} r={0.025} />
          <Cyl r={0.02} h={0.64} pos={[0.15, 0.32, 0.15]} mat={m.black} seg={6} />
          <Cyl r={0.02} h={0.64} pos={[-0.15, 0.32, 0.15]} mat={m.black} seg={6} />
          <Cyl r={0.02} h={0.64} pos={[0.15, 0.32, -0.15]} mat={m.black} seg={6} />
          <Cyl r={0.02} h={0.64} pos={[-0.15, 0.32, -0.15]} mat={m.black} seg={6} />
        </group>
      ))}
    </group>
  ),
  diningTable: (m) => (
    <group>
      <B size={[1.1, 0.05, 2.5]} pos={[-2, 0.745, -3.3]} mat={m.walnut} r={0.015} />
      <B size={[0.9, 0.72, 0.08]} pos={[-2, 0.36, -4.25]} mat={m.walnut} />
      <B size={[0.9, 0.72, 0.08]} pos={[-2, 0.36, -2.35]} mat={m.walnut} />
    </group>
  ),
  majlisSeating: (m) => {
    // Low seating on three walls, cream linen with green bolsters: a modern majlis.
    const runs: { seat: V3; pos: V3; back: V3; backPos: V3 }[] = [
      { seat: [9.1, 0.4, 0.86], pos: [5.05, 0.2, -5.87], back: [9.1, 0.42, 0.22], backPos: [5.05, 0.61, -6.22] },
      { seat: [0.86, 0.4, 4.2], pos: [9.42, 0.2, -3.25], back: [0.22, 0.42, 4.2], backPos: [9.77, 0.61, -3.25] },
      { seat: [0.86, 0.4, 3.6], pos: [0.53, 0.2, -3.55], back: [0.22, 0.42, 3.6], backPos: [0.19, 0.61, -3.55] },
    ];
    return (
      <group>
        {runs.map((r, i) => (
          <group key={i}>
            <B size={r.seat} pos={r.pos} mat={m.linen} r={0.06} />
            <B size={r.back} pos={r.backPos} mat={m.linen} r={0.06} />
          </group>
        ))}
        {[2, 4, 6, 8].map((x) => (
          <B key={x} size={[0.5, 0.36, 0.14]} pos={[x, 0.58, -6.02]} mat={m.leatherGreen} r={0.06} />
        ))}
        {[-4.8, -3.2, -1.7].map((z) => (
          <B key={z} size={[0.14, 0.36, 0.5]} pos={[9.54, 0.58, z]} mat={m.leatherGreen} r={0.06} />
        ))}
      </group>
    );
  },
  majlisRug: (m) => <B size={[5.4, 0.012, 3.4]} pos={[5.1, 0.012, -3.2]} mat={m.jacquard} cast={false} />,
  livingSofa: (m) => (
    <group>
      <B size={[0.95, 0.4, 3.7]} pos={[5.72, 0.2, 2.95]} mat={m.woolLight} r={0.07} />
      <B size={[0.24, 0.42, 3.7]} pos={[5.3, 0.61, 2.95]} mat={m.woolLight} r={0.07} />
      <B size={[1.8, 0.4, 0.95]} pos={[6.55, 0.2, 0.62]} mat={m.woolLight} r={0.07} />
      <B size={[2.3, 0.42, 0.24]} pos={[6.3, 0.61, 0.2]} mat={m.woolLight} r={0.07} />
      <B size={[0.2, 0.2, 0.55]} pos={[5.95, 0.52, 4.5]} mat={m.linenOchre} r={0.06} />
      <B size={[0.2, 0.2, 0.55]} pos={[5.95, 0.52, 1.6]} mat={m.leatherGreen} r={0.06} />
    </group>
  ),
  livingRug: (m) => <B size={[4.2, 0.012, 4]} pos={[7.1, 0.012, 3.1]} mat={m.woolDark} cast={false} />,
  tv: (m) => <B size={[0.05, 1.05, 1.85]} pos={[9.82, 1.45, 3.1]} mat={m.screen} />,
  hallBench: (m) => (
    <group>
      <B size={[0.4, 0.06, 2]} pos={[-1.55, 0.44, 3]} mat={m.walnut} r={0.01} />
      <B size={[0.36, 0.42, 0.06]} pos={[-1.55, 0.21, 2.15]} mat={m.walnut} />
      <B size={[0.36, 0.42, 0.06]} pos={[-1.55, 0.21, 3.85]} mat={m.walnut} />
    </group>
  ),
  bed: (m) => (
    <group>
      <B size={[4.6, 1.25, 0.12]} pos={[-6, 0.625, 0.16]} mat={m.leatherTaupe} r={0.04} />
      <B size={[2.2, 0.3, 2.25]} pos={[-6, 0.15, 1.35]} mat={m.walnut} r={0.02} />
      <B size={[2.05, 0.24, 2.1]} pos={[-6, 0.42, 1.38]} mat={m.linenWhite} r={0.06} />
      <B size={[2.12, 0.08, 1.45]} pos={[-6, 0.56, 1.72]} mat={m.linen} r={0.04} />
      <B size={[2.16, 0.05, 0.42]} pos={[-6, 0.62, 2.18]} mat={m.linenOchre} r={0.02} />
      <B size={[0.8, 0.18, 0.4]} pos={[-6.5, 0.62, 0.5]} mat={m.linenWhite} r={0.08} />
      <B size={[0.8, 0.18, 0.4]} pos={[-5.5, 0.62, 0.5]} mat={m.linenWhite} r={0.08} />
      <B size={[0.55, 0.5, 0.45]} pos={[-7.55, 0.25, 0.45]} mat={m.walnut} r={0.01} />
      <B size={[0.55, 0.5, 0.45]} pos={[-4.45, 0.25, 0.45]} mat={m.walnut} r={0.01} />
      <B size={[1.6, 0.42, 0.42]} pos={[-6, 0.21, 2.85]} mat={m.leatherTaupe} r={0.05} />
    </group>
  ),
  wardrobe: (m) => (
    <group>
      <B size={[0.6, 2.45, 3.3]} pos={[-2.4, 1.225, 4.45]} mat={m.oak} />
      {[3.35, 4.45, 5.55].map((z) => (
        <B key={z} size={[0.02, 0.5, 0.03]} pos={[-2.71, 1.2, z]} mat={m.brass} cast={false} />
      ))}
    </group>
  ),
  bedRug: (m) => <B size={[3.6, 0.012, 2.6]} pos={[-6, 0.012, 2.3]} mat={m.woolRug} cast={false} />,
  loungers: (m) => (
    <group>
      {[-8.4, -7.1].map((x) => (
        <group key={x} position={[x, -0.15, 9.8]}>
          <B size={[0.7, 0.12, 1.9]} pos={[0, 0.3, 0]} mat={m.lacquer} r={0.03} />
          <B size={[0.64, 0.1, 1.3]} pos={[0, 0.41, 0.25]} mat={m.linenWhite} r={0.04} />
          <B size={[0.64, 0.1, 0.62]} pos={[0, 0.58, -0.62]} rot={[-0.55, 0, 0]} mat={m.linenWhite} r={0.04} />
          <B size={[0.62, 0.24, 0.08]} pos={[0, 0.12, 0.8]} mat={m.lacquer} />
          <B size={[0.62, 0.24, 0.08]} pos={[0, 0.12, -0.8]} mat={m.lacquer} />
        </group>
      ))}
      <Cyl r={0.26} h={0.42} pos={[-7.75, 0.06, 8.6]} mat={m.brass} />
    </group>
  ),
  palms: (m) => (
    <group>
      <Palm m={m} pos={[-9.4, -0.15, 12]} height={6.2} lean={0.12} />
      <Palm m={m} pos={[9.2, -0.15, 12.1]} height={7} lean={-0.1} />
      <Palm m={m} pos={[11.4, -0.15, -7.2]} height={7.8} lean={-0.08} />
    </group>
  ),
};

/* ------------------------------------------------------------------
   Date palm: a banded trunk and arching fronds with painted leaflets.
------------------------------------------------------------------ */
let frondTexture: THREE.CanvasTexture | null = null;
function getFrondTexture() {
  if (frondTexture) return frondTexture;
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 512;
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, 64, 512);
  g.strokeStyle = "#ffffff";
  g.lineCap = "round";
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(32, 512);
  g.lineTo(32, 0);
  g.stroke();
  for (let y = 500; y > 10; y -= 6) {
    const t = 1 - y / 512;
    const len = 29 * Math.sin(Math.PI * Math.min(1, t * 1.1)) + 5;
    g.lineWidth = 4.5;
    g.beginPath();
    g.moveTo(32, y);
    g.lineTo(32 - len, y - 16);
    g.moveTo(32, y);
    g.lineTo(32 + len, y - 16);
    g.stroke();
  }
  frondTexture = new THREE.CanvasTexture(c);
  frondTexture.colorSpace = THREE.SRGBColorSpace;
  return frondTexture;
}

function frondGeometry() {
  const g = new THREE.PlaneGeometry(1.25, 3.4, 1, 10);
  const p = g.getAttribute("position");
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) + 1.7; // 0..3.4 along the frond
    const t = y / 3.4;
    p.setY(i, y * 0.92);
    p.setZ(i, -Math.pow(t, 2) * 1.6);
  }
  g.computeVertexNormals();
  return g;
}

function Palm({ m, pos, height, lean }: { m: Mats; pos: V3; height: number; lean: number }) {
  const frondGeo = useMemo(frondGeometry, []);
  const frondMat = useMemo(() => {
    const mat = m.frond.clone();
    mat.alphaMap = getFrondTexture();
    mat.alphaTest = 0.4;
    mat.transparent = false;
    return mat;
  }, [m.frond]);
  const trunkGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.17, 0.26, height, 10, 14);
    const p = g.getAttribute("position");
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      const band = 1 + 0.06 * Math.abs(Math.sin((y + height / 2) * 7));
      p.setX(i, p.getX(i) * band);
      p.setZ(i, p.getZ(i) * band);
    }
    g.computeVertexNormals();
    return g;
  }, [height]);
  const fronds = useMemo(
    () => Array.from({ length: 18 }, (_, i) => ({ yaw: (i / 18) * Math.PI * 2 + (i % 2) * 0.18, tilt: 0.25 + (i % 3) * 0.3 })),
    [],
  );
  return (
    <group position={pos} rotation={[0, 0, lean]}>
      <mesh geometry={trunkGeo} material={m.trunk} position={[0, height / 2, 0]} castShadow />
      <group position={[0, height, 0]}>
        {fronds.map((f, i) => (
          <group key={i} rotation={[0, f.yaw, 0]}>
            <mesh geometry={frondGeo} material={frondMat} rotation={[-Math.PI / 2 + f.tilt, 0, 0]} castShadow />
          </group>
        ))}
      </group>
    </group>
  );
}
