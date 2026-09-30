import * as THREE from "three";

/* ------------------------------------------------------------------
   Material resolution sweep.
   Every finished material is patched so that, until a diagonal sweep
   line passes over it, it renders as white clay. The sweep carries a
   thin ochre edge, like a scanner resolving the model into materials.
------------------------------------------------------------------ */
export const sweep = {
  uSweep: { value: -100 },
  uClay: { value: new THREE.Color("#ece9e3") },
  uEdge: { value: new THREE.Color("#e0ab26") },
  uEdgeAmt: { value: 0 },
};

const PATCHED = Symbol("sweep");

export function patchSweep<T extends THREE.Material>(mat: T): T {
  const m = mat as T & { [PATCHED]?: boolean };
  if (m[PATCHED] || !(mat instanceof THREE.MeshStandardMaterial)) return mat;
  m[PATCHED] = true;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, sweep);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vSweepPos;")
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
        vec4 sweepP = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          sweepP = instanceMatrix * sweepP;
        #endif
        vSweepPos = (modelMatrix * sweepP).xyz;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3 vSweepPos;
        uniform float uSweep;
        uniform vec3 uClay;
        uniform vec3 uEdge;
        uniform float uEdgeAmt;`,
      )
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
        float sweepS = (vSweepPos.x + vSweepPos.z) * 0.7071;
        float reveal = 1.0 - smoothstep(uSweep - 0.35, uSweep + 0.35, sweepS);
        diffuseColor.rgb = mix(uClay, diffuseColor.rgb, reveal);`,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
        roughnessFactor = mix(0.9, roughnessFactor, reveal);`,
      )
      .replace(
        "#include <metalnessmap_fragment>",
        `#include <metalnessmap_fragment>
        metalnessFactor = mix(0.0, metalnessFactor, reveal);`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        totalEmissiveRadiance *= reveal;
        float sweepEdge = 1.0 - smoothstep(0.0, 0.22, abs(sweepS - uSweep));
        totalEmissiveRadiance += uEdge * sweepEdge * uEdgeAmt;`,
      );
  };
  mat.customProgramCacheKey = () => "sweep-v1";
  mat.needsUpdate = true;
  return mat;
}

/* ------------------------------------------------------------------
   Box-projected UVs in metres, so textures keep real-world scale on
   any procedural geometry regardless of its size.
------------------------------------------------------------------ */
export function boxUV<T extends THREE.BufferGeometry>(geo: T, offset: [number, number, number] = [0, 0, 0]): T {
  const pos = geo.getAttribute("position");
  const nor = geo.getAttribute("normal");
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + offset[0];
    const y = pos.getY(i) + offset[1];
    const z = pos.getZ(i) + offset[2];
    const nx = Math.abs(nor.getX(i));
    const ny = Math.abs(nor.getY(i));
    const nz = Math.abs(nor.getZ(i));
    if (ny >= nx && ny >= nz) uv.set([x, z], i * 2);
    else if (nx >= nz) uv.set([z, y], i * 2);
    else uv.set([x, y], i * 2);
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geo;
}

/* ------------------------------------------------------------------
   Texture sets (Poly Haven, CC0). `tile` is metres per texture repeat.
------------------------------------------------------------------ */
export const TEXTURES: Record<string, { id: string; tile: number; albedo?: false }> = {
  marble: { id: "marble_01", tile: 2.4 },
  parquet: { id: "herringbone_parquet", tile: 1.8 },
  plaster: { id: "beige_wall_001", tile: 2.5, albedo: false },
  sandstone: { id: "white_sandstone_blocks_02", tile: 2.6, albedo: false },
  coral: { id: "coral_stone_wall", tile: 2.2 },
  walnut: { id: "natural_walnut_veneer", tile: 1.4 },
  oak: { id: "grey_oak_veneer_01", tile: 1.4 },
  wool: { id: "poly_wool_herringbone", tile: 0.7 },
  linen: { id: "rough_linen", tile: 0.8 },
  leather: { id: "leather_white", tile: 0.9 },
  jacquard: { id: "quatrefoil_jacquard_fabric", tile: 1.1 },
  patio: { id: "patio_tiles", tile: 2, albedo: false },
};

export type TexKey = keyof typeof TEXTURES;

/** Every map the scene needs; colour maps are skipped where a flat tint reads better. */
export const textureUrls = () => {
  const urls: Record<string, string> = {};
  for (const [key, { id, albedo }] of Object.entries(TEXTURES)) {
    if (albedo !== false) urls[`${key}_diff`] = `/house/textures/${id}_diff.webp`;
    urls[`${key}_nor`] = `/house/textures/${id}_nor.webp`;
    urls[`${key}_arm`] = `/house/textures/${id}_arm.webp`;
  }
  return urls;
};

type Loaded = Record<string, THREE.Texture>;

/** Builds the material library from loaded textures. */
export function buildMaterials(tex: Loaded, anisotropy: number) {
  const prep = (key: TexKey) => {
    const { tile } = TEXTURES[key];
    const out = {
      map: tex[`${key}_diff`] ?? null,
      normalMap: tex[`${key}_nor`],
      arm: tex[`${key}_arm`],
    };
    for (const t of [out.map, out.normalMap, out.arm]) {
      if (!t) continue;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(1 / tile, 1 / tile);
      t.anisotropy = anisotropy;
    }
    if (out.map) out.map.colorSpace = THREE.SRGBColorSpace;
    return out;
  };

  const pbr = (key: TexKey, opts: THREE.MeshStandardMaterialParameters = {}) => {
    const t = prep(key);
    return patchSweep(
      new THREE.MeshStandardMaterial({
        map: t.map,
        normalMap: t.normalMap,
        roughnessMap: t.arm,
        aoMap: t.arm,
        aoMapIntensity: 0.6,
        normalScale: new THREE.Vector2(0.8, 0.8),
        ...opts,
      }),
    );
  };

  const flat = (color: string, opts: THREE.MeshStandardMaterialParameters = {}) =>
    patchSweep(new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...opts }));

  return {
    marble: pbr("marble", { color: "#fbf6ee" }),
    parquet: pbr("parquet", { color: "#e9dccb" }),
    // Plaster and cladding keep their relief (normal + roughness) but take a clean
    // limestone colour: the source albedos read too brown under warm light.
    plaster: pbr("plaster", { map: null, color: "#ebe6de" }),
    sandstone: pbr("sandstone", { map: null, color: "#e3d9c9" }),
    coral: pbr("coral", { color: "#efe4d2" }),
    walnut: pbr("walnut", { color: "#d8c3ad" }),
    oak: pbr("oak", { color: "#f2ebe2" }),
    woolLight: pbr("wool", { color: "#e2dbd0" }),
    woolDark: pbr("wool", { color: "#7c7368" }),
    woolRug: pbr("wool", { color: "#cfc4b3" }),
    linen: pbr("linen", { color: "#efe6d6" }),
    linenWhite: pbr("linen", { color: "#fbf8f2" }),
    linenOchre: pbr("linen", { color: "#c6963a" }),
    leatherTaupe: pbr("leather", { color: "#a38f76" }),
    leatherGreen: pbr("leather", { color: "#2f5a4c" }),
    jacquard: pbr("jacquard", { color: "#f0d9cf" }),
    patio: pbr("patio", { map: null, color: "#d9cfbf" }),
    counter: flat("#f4f1ec", { roughness: 0.18 }),
    lacquer: flat("#e9e4dc", { roughness: 0.35 }),
    black: flat("#1b1d1c", { roughness: 0.4, metalness: 0.2 }),
    brass: flat("#b8914a", { roughness: 0.3, metalness: 0.9 }),
    screen: flat("#0c0e0e", { roughness: 0.15, metalness: 0.4 }),
    plinth: flat("#ddd6ca", { roughness: 0.9 }),
    frond: flat("#5c7243", { roughness: 0.75, side: THREE.DoubleSide }),
    trunk: flat("#7d6a52", { roughness: 0.95 }),
    /* Unpatched: these read the same in clay and finished states */
    cap: new THREE.MeshStandardMaterial({ color: "#1d201e", roughness: 0.9 }),
    glass: new THREE.MeshStandardMaterial({
      color: "#a7c3c0",
      roughness: 0.05,
      metalness: 0.3,
      transparent: true,
      opacity: 0.25,
      depthWrite: false,
      emissive: new THREE.Color("#ffbf73"),
      emissiveIntensity: 0,
    }),
    water: new THREE.MeshStandardMaterial({
      color: "#58b9c2",
      roughness: 0.05,
      metalness: 0.15,
      transparent: true,
      opacity: 0.88,
      emissive: new THREE.Color("#19c3d6"),
      emissiveIntensity: 0,
    }),
    glow: new THREE.MeshBasicMaterial({ color: "#ffc27a", transparent: true, opacity: 0, toneMapped: false }),
  };
}

export type Mats = ReturnType<typeof buildMaterials>;
