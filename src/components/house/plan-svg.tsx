"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useLocale } from "@/components/providers/locale";
import { areaOf, gridX, gridZ, pieces, rooms, terrace, wallPieces, walls, type Wall } from "./plan";

const BUBBLE_Z = -11.1;
const BUBBLE_X = -13.7;
const DIM_Z = -9.6;
const DIM_X = -12.2;

/** Solid (cut) wall runs as plan rectangles; sills below the cut read as thin window lines. */
function wallRects(w: Wall) {
  return wallPieces(w)
    .filter((p) => !p.glass && p.y0 === 0)
    .map((p) => {
      const solid = p.y1 > 1.2 || p.y1 === w.h;
      const along: [number, number] = [p.x0, p.x1];
      const [a0, a1] = along;
      const rect =
        w.axis === "x"
          ? { x: a0, y: w.c - w.t / 2, width: a1 - a0, height: w.t }
          : { x: w.c - w.t / 2, y: a0, width: w.t, height: a1 - a0 };
      return { ...rect, solid };
    });
}

/**
 * The villa's ground-floor plan, drawn from the same data as the 3D model.
 * Lines draw themselves when the drawing scrolls into view.
 */
export function PlanSvg({ className }: { className?: string }) {
  const { lang, n } = useLocale();
  const ref = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top 80%", once: true } });
      tl.from("[data-draw]", { drawSVG: "0%", duration: 1.4, ease: "power2.inOut", stagger: 0.012 })
        .from("[data-wall]", { opacity: 0, duration: 0.6, stagger: 0.015 }, 0.5)
        .from("[data-text]", { opacity: 0, y: 0.3, duration: 0.6, stagger: 0.03 }, 1.1);
    },
    { scope: ref, dependencies: [lang] },
  );

  const area = lang === "ar" ? "م²" : "m²";
  const mm = (v: number) => n((v * 1000).toLocaleString("en").replace(",", " "));

  return (
    <svg ref={ref} viewBox="-15 -12.3 30 25.9" className={className} role="img" aria-label={lang === "ar" ? "مخطط الدور الأرضي" : "Ground floor plan"}>
      <g fill="none" stroke="currentColor" strokeWidth={0.04} opacity={0.45} strokeDasharray="0.5 0.18">
        {gridX.map((x) => (
          <line key={`gx${x}`} data-draw x1={x} y1={BUBBLE_Z + 0.6} x2={x} y2={13} />
        ))}
        {gridZ.map((z) => (
          <line key={`gz${z}`} data-draw x1={BUBBLE_X + 0.6} y1={z} x2={12.8} y2={z} />
        ))}
      </g>
      <g fill="none" stroke="var(--color-ochre)" strokeWidth={0.06}>
        {gridX.map((x) => (
          <circle key={`bx${x}`} data-draw cx={x} cy={BUBBLE_Z} r={0.6} />
        ))}
        {gridZ.map((z) => (
          <circle key={`bz${z}`} data-draw cx={BUBBLE_X} cy={z} r={0.6} />
        ))}
      </g>
      <g fill="var(--color-ochre)" fontFamily="var(--font-plex-mono), monospace" fontSize={0.62} textAnchor="middle" dominantBaseline="central">
        {gridX.map((x, i) => (
          <text key={`tx${x}`} data-text x={x} y={BUBBLE_Z}>
            {"ABCDE"[i]}
          </text>
        ))}
        {gridZ.map((z, i) => (
          <text key={`tz${z}`} data-text x={BUBBLE_X} y={z}>
            {n(i + 1)}
          </text>
        ))}
      </g>

      {/* dimension chains */}
      <g fill="none" stroke="currentColor" strokeWidth={0.04} opacity={0.7}>
        <line data-draw x1={gridX[0]} y1={DIM_Z} x2={gridX[gridX.length - 1]} y2={DIM_Z} />
        {gridX.map((x) => (
          <line key={`dt${x}`} data-draw x1={x - 0.22} y1={DIM_Z + 0.22} x2={x + 0.22} y2={DIM_Z - 0.22} />
        ))}
        <line data-draw x1={DIM_X} y1={gridZ[0]} x2={DIM_X} y2={gridZ[gridZ.length - 1]} />
        {gridZ.map((z) => (
          <line key={`dz${z}`} data-draw x1={DIM_X - 0.22} y1={z + 0.22} x2={DIM_X + 0.22} y2={z - 0.22} />
        ))}
      </g>
      <g fill="currentColor" opacity={0.75} fontFamily="var(--font-plex-mono), monospace" fontSize={0.5} textAnchor="middle">
        {gridX.slice(0, -1).map((x, i) => (
          <text key={`dx${x}`} data-text x={(x + gridX[i + 1]) / 2} y={DIM_Z - 0.35}>
            {mm(gridX[i + 1] - x)}
          </text>
        ))}
        {gridZ.slice(0, -1).map((z, i) => (
          <text
            key={`dy${z}`}
            data-text
            x={DIM_X - 0.35}
            y={(z + gridZ[i + 1]) / 2}
            transform={`rotate(-90 ${DIM_X - 0.35} ${(z + gridZ[i + 1]) / 2})`}
          >
            {mm(gridZ[i + 1] - z)}
          </text>
        ))}
      </g>

      {/* terrace, pool */}
      <g fill="none" stroke="currentColor" strokeWidth={0.04} opacity={0.6}>
        <rect data-draw x={terrace.rect[0]} y={terrace.rect[1]} width={terrace.rect[2] - terrace.rect[0]} height={terrace.rect[3] - terrace.rect[1]} />
        <rect data-draw x={terrace.pool[0]} y={terrace.pool[1]} width={terrace.pool[2] - terrace.pool[0]} height={terrace.pool[3] - terrace.pool[1]} />
        <rect data-draw x={terrace.pool[0] + 0.3} y={terrace.pool[1] + 0.3} width={terrace.pool[2] - terrace.pool[0] - 0.6} height={terrace.pool[3] - terrace.pool[1] - 0.6} />
      </g>

      {/* furniture */}
      <g fill="none" stroke="currentColor" strokeWidth={0.045} opacity={0.8}>
        {pieces.map((p) =>
          !p.plan ? null : p.plan.kind === "rect" ? (
            <rect
              key={p.id}
              data-draw
              x={p.plan.rect[0]}
              y={p.plan.rect[1]}
              width={p.plan.rect[2] - p.plan.rect[0]}
              height={p.plan.rect[3] - p.plan.rect[1]}
            />
          ) : (
            <circle key={p.id} data-draw cx={p.plan.c[0]} cy={p.plan.c[1]} r={p.plan.r} />
          ),
        )}
        {/* door swings */}
        <path data-draw d="M -0.3 0.08 A 1.3 1.3 0 0 1 -1.6 1.38 L -1.6 0.08" />
        <path data-draw d="M 1.7 0.08 A 1.1 1.1 0 0 1 0.6 1.18 L 0.6 0.08" />
      </g>

      {/* walls: poché */}
      <g fill="currentColor">
        {walls.flatMap((w) =>
          wallRects(w).map((r, i) =>
            r.solid ? (
              <rect key={`${w.id}-${i}`} data-wall x={r.x} y={r.y} width={r.width} height={r.height} />
            ) : (
              <rect key={`${w.id}-${i}`} data-wall x={r.x} y={r.y} width={r.width} height={r.height} fill="none" stroke="currentColor" strokeWidth={0.035} />
            ),
          ),
        )}
      </g>

      {/* room names */}
      <g fill="currentColor" fontFamily="var(--font-plex-mono), monospace" textAnchor="middle">
        {rooms.map((r) => (
          <g key={r.id} data-text>
            <text x={r.label[0]} y={r.label[1]} fontSize={0.52} letterSpacing={0.08}>
              {(lang === "ar" ? r.name.ar : r.name.en).toUpperCase()}
            </text>
            <text x={r.label[0]} y={r.label[1] + 0.7} fontSize={0.42} opacity={0.6}>
              {n(areaOf(r.rect).toFixed(1))} {area}
            </text>
          </g>
        ))}
        <text data-text x={terrace.label[0]} y={terrace.label[1]} fontSize={0.5} letterSpacing={0.08}>
          {(lang === "ar" ? terrace.name.ar : terrace.name.en).toUpperCase()}
        </text>
      </g>

      {/* north point */}
      <g stroke="var(--color-ochre)" fill="none" strokeWidth={0.05}>
        <circle data-draw cx={13.2} cy={-9.6} r={0.9} />
        <path data-draw d="M 13.2 -8.4 L 13.2 -10.8 M 13.2 -10.8 L 12.8 -10.1 M 13.2 -10.8 L 13.6 -10.1" />
      </g>
    </svg>
  );
}
