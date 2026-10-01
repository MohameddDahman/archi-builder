"use client";

import clsx from "clsx";
import { Mark } from "@/components/brand/logo";
import { useLocale } from "@/components/providers/locale";
import { useSite } from "@/lib/content/store";
import { ui } from "@/lib/dict";

/**
 * The portfolio volume shut, in CSS 3D: board cover, spine and page block,
 * set like the cover of the flip-book on /book. `open` lifts the cover (0..1).
 */
export function ClosedBook({ className, open = 0 }: { className?: string; open?: number }) {
  const { t, n, lang } = useLocale();
  const name = useSite((s) => s.settings.companyName);
  const depth = 26;
  return (
    <div className={clsx("relative [perspective:1800px]", className)}>
      <div className="relative aspect-[25/32] w-full [transform-style:preserve-3d]">
        {/* page block */}
        <div
          className="absolute inset-y-[1.2%] end-0 start-[2%] bg-[repeating-linear-gradient(90deg,#f0ede6_0_2px,#d9d3c7_2px_3px)]"
          style={{ transform: `translateZ(${-depth / 2}px)` }}
        />
        <div
          className="absolute inset-y-[1.2%] end-0 origin-right bg-[repeating-linear-gradient(90deg,#f0ede6_0_1px,#d4cdbf_1px_2px)]"
          style={{ transform: `rotateY(90deg) translateZ(${-depth / 2}px)`, width: depth }}
        />
        {/* back board */}
        <div className="absolute inset-0 bg-[#0f0e0d] shadow-[0_60px_90px_-30px_rgb(10_10_10/0.55)]" style={{ transform: `translateZ(${-depth}px)` }} />
        {/* spine */}
        <div className="absolute inset-y-0 start-0 origin-left bg-[#0f0e0d]" style={{ width: depth, transform: "rotateY(-90deg)" }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 to-transparent" />
        </div>
        {/* front board */}
        <div
          className="absolute inset-0 origin-left transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] [transform-style:preserve-3d]"
          style={{ transform: `rotateY(${-open * 34}deg)` }}
        >
          <div
            dir={lang === "ar" ? "rtl" : "ltr"}
            className="@container absolute inset-0 overflow-hidden bg-[#0f0e0d] text-[#f3eee6] [backface-visibility:hidden]"
          >
            <span className="absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_0%,rgb(224_171_38/0.2),transparent_70%)]" aria-hidden="true" />
            <span className="absolute inset-[5cqw] border border-[#e0ab26]/15" aria-hidden="true" />
            <span className="absolute inset-y-0 left-0 w-[5%] bg-gradient-to-r from-black/55 to-transparent" aria-hidden="true" />
            <div className="relative flex h-full flex-col items-center justify-between px-[9cqw] py-[13cqw] text-center">
              <p className="bk-mono text-[clamp(0.5rem,2cqw,0.72rem)] text-[#e0ab26]">
                {t(ui.book.volume)} · {n("2026")}
              </p>
              <div className="flex flex-col items-center">
                <Mark className="mb-[8cqw] h-[13cqw] w-auto" />
                <p className="bk-display flex flex-col items-center gap-[2cqw] text-[11cqw] leading-none">
                  {t(name)
                    .split(" ")
                    .map((word) => (
                      <span key={word} className="book-foil">
                        {word}
                      </span>
                    ))}
                </p>
                <span className="mt-[6cqw] block h-px w-[20cqw] bg-[#e0ab26]/70" aria-hidden="true" />
                <p className="bk-cond mt-[6cqw] text-[clamp(0.55rem,2.55cqw,0.9rem)] text-white/75">{t(ui.tagline)}</p>
              </div>
              <p className="bk-mono text-[clamp(0.45rem,1.8cqw,0.66rem)] text-white/45">{t(name)}</p>
            </div>
          </div>
          <div className="book-paper absolute inset-0 [backface-visibility:hidden]" style={{ transform: "rotateY(180deg)" }} />
        </div>
      </div>
    </div>
  );
}
