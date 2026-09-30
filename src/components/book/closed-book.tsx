"use client";

import clsx from "clsx";
import { Logo } from "@/components/brand/logo";

/** A bound portfolio in CSS 3D: cover, spine and page block. `open` lifts the cover (0..1). */
export function ClosedBook({ className, open = 0 }: { className?: string; open?: number }) {
  const depth = 26;
  return (
    <div className={clsx("relative [perspective:1800px]", className)}>
      <div className="relative aspect-[1/1.414] w-full [transform-style:preserve-3d]">
        {/* page block */}
        <div
          className="absolute inset-y-[1.2%] end-0 start-[2%] bg-[repeating-linear-gradient(90deg,#f0ede6_0_2px,#d9d3c7_2px_3px)]"
          style={{ transform: `translateZ(${-depth / 2}px)` }}
        />
        <div
          className="absolute inset-y-[1.2%] end-0 origin-right bg-[repeating-linear-gradient(90deg,#f0ede6_0_1px,#d4cdbf_1px_2px)]"
          style={{ transform: `rotateY(90deg) translateZ(${-depth / 2}px)`, width: depth }}
        />
        {/* back cover */}
        <div className="absolute inset-0 bg-deep shadow-[0_60px_90px_-30px_rgb(10_10_10/0.55)]" style={{ transform: `translateZ(${-depth}px)` }} />
        {/* spine */}
        <div className="absolute inset-y-0 start-0 origin-left bg-deep" style={{ width: depth, transform: "rotateY(-90deg)" }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 to-transparent" />
        </div>
        {/* front cover */}
        <div
          className="absolute inset-0 origin-left transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] [transform-style:preserve-3d]"
          style={{ transform: `rotateY(${-open * 34}deg)` }}
        >
          {/* black leather, gold foil */}
          <div className="absolute inset-0 overflow-hidden bg-[#121212] ring-1 ring-inset ring-white/5 [backface-visibility:hidden]">
            <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_0%,rgb(255_255_255/0.08),transparent_60%)]" />
            <div className="absolute inset-0 opacity-[0.35] mix-blend-overlay [background-image:url(/images/site/timber.webp)] [background-size:140px]" />
            <div className="absolute inset-y-0 start-0 w-[6%] bg-gradient-to-r from-black/60 to-transparent" />
            <div className="absolute inset-[7%] border border-[#d9a52a]/40" />
            <div className="absolute inset-x-[14%] top-[12%]">
              <Logo tone="gold" className="w-[60%]" />
            </div>
            <div className="absolute inset-x-[14%] bottom-[16%]">
              <p className="mega gold-text text-[clamp(1.1rem,2.2vw,1.8rem)]">Portfolio 26</p>
            </div>
            <div className="absolute inset-x-[14%] bottom-[11%] flex justify-between border-t border-[#d9a52a]/30 pt-2.5 font-mono text-[0.5rem] uppercase tracking-[0.2em] text-[#d9a52a]/80">
              <span>Design · Build · Deliver</span>
              <span>Jeddah</span>
            </div>
          </div>
          <div className="absolute inset-0 bg-gypsum [backface-visibility:hidden]" style={{ transform: "rotateY(180deg)" }} />
        </div>
      </div>
    </div>
  );
}
