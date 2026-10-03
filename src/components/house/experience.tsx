"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useProgress } from "@react-three/drei";
import { Lamp, ArrowDown } from "@phosphor-icons/react";
import { ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useLocale } from "@/components/providers/locale";
import { useSite } from "@/lib/content/store";
import { useUi } from "@/lib/ui-store";
import { ui } from "@/lib/dict";
import { house, STAGES, stageOf } from "./state";

const HouseScene = dynamic(() => import("./scene"), { ssr: false });

/** What the model is showing at each stage (the process copy itself comes from the CMS). */
const showing = [
  { en: "Site, grid and zoning: where each room belongs.", ar: "الموقع والمحاور وتوزيع الفراغات: مكان كل غرفة." },
  { en: "Walls, openings and furniture, set out to the millimetre.", ar: "الجدران والفتحات والأثاث، بدقة المليمتر." },
  { en: "The drawing rises into a white model to test proportion and light.", ar: "يرتفع المخطط إلى مجسم أبيض لاختبار النِّسب والضوء." },
  { en: "Joinery, seating and fittings arrive exactly where they were drawn.", ar: "النجارة والمقاعد والتجهيزات تصل إلى أماكنها المرسومة بالضبط." },
  { en: "Materials resolve: marble, walnut, linen and Jeddah coral stone.", ar: "تكتمل الخامات: رخام وجوز وكتان وحجر منقبي من جدة." },
  { en: "Styled, planted, filled and lit. Switch the lamp to see it after dark.", ar: "تنسيق وزراعة وإضاءة. بدّل الإضاءة لتراها ليلًا." },
];

const swatches = [
  { id: "marble_01", name: { en: "Marble", ar: "رخام" } },
  { id: "natural_walnut_veneer", name: { en: "Walnut", ar: "خشب الجوز" } },
  { id: "rough_linen", name: { en: "Linen", ar: "كتان" } },
  { id: "coral_stone_wall", name: { en: "Coral stone", ar: "حجر منقبي" } },
  { id: "herringbone_parquet", name: { en: "Oak parquet", ar: "باركيه بلوط" } },
];

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function HouseExperience({ length = 620 }: { length?: number }) {
  const { t, n, lang } = useLocale();
  const process = useSite((s) => s.content.process);
  const lighting = useUi((s) => s.lighting);
  const setUi = useUi((s) => s.set);
  const night = lighting === "night";

  const root = useRef<HTMLElement>(null);
  const stageBox = useRef<HTMLDivElement>(null);
  const [mount, setMount] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const { progress: loadProgress } = useProgress();
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = prefersReducedMotion();
    setWebgl(hasWebGL());
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setMount(true), { rootMargin: "120% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    house.nightTarget = night ? 1 : 0;
    if (reduced.current) house.night = house.nightTarget;
    house.invalidate();
  }, [night]);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      house.target = 0;
      house.p = 0;
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          house.target = self.progress;
          if (reduced.current) house.p = self.progress;
          house.invalidate();
          setProgress(self.progress);
          setStage(stageOf(self.progress));
        },
      });
      return () => st.kill();
    },
    { scope: root },
  );

  const onReady = useCallback(() => setReady(true), []);
  const local = Math.min(1, Math.max(0, (progress - STAGES[stage]) / (STAGES[stage + 1] - STAGES[stage])));
  const step = process[stage];

  return (
    <section
      ref={root}
      data-night={night}
      className="relative"
      style={{ height: `${length}svh` }}
      aria-label={t(ui.buildLabel)}
    >
      <div
        className={clsx(
          "sticky top-0 h-svh overflow-hidden transition-colors duration-1000",
          night ? "bg-[#050505] text-gypsum" : "bg-[#161616] text-gypsum",
        )}
        style={{ ["--exp-bg" as string]: night ? "#050505" : "#161616" }}
      >
        {/* Scene */}
        <div ref={stageBox} className="absolute inset-0" data-night={night}>
          {webgl === false ? (
            <Image src="/images/site/living-hall.jpg" alt="" fill sizes="100vw" className="object-cover" />
          ) : (
            mount && webgl && <HouseScene lang={lang} overlay={stageBox} onReady={onReady} />
          )}
        </div>

        {/* Loader */}
        <div
          className={clsx(
            "pointer-events-none absolute inset-0 grid place-items-center transition-opacity duration-700",
            ready || webgl === false ? "opacity-0" : "opacity-100",
          )}
          aria-hidden={ready}
        >
          <div className="w-56 text-center">
            <p className="label opacity-70">{t(ui.loadingModel)}</p>
            <p className="mega mega-md mt-3" dir="ltr">
              {n(Math.round(loadProgress))}%
            </p>
            <div className="mt-3 h-px bg-current/15">
              <div className="h-full bg-ochre transition-[width] duration-300" style={{ width: `${loadProgress}%` }} />
            </div>
          </div>
        </div>

        {/* Copy column */}
        <div className="exp-copy pointer-events-none absolute inset-x-0 top-0 px-[var(--gutter)] pt-[calc(var(--header-h)+1.5rem)] lg:inset-y-0 lg:flex lg:w-[36%] lg:flex-col lg:justify-center lg:pt-0">
          <div className="label flex items-center gap-3 opacity-80">
            <svg viewBox="0 0 8 14" className="h-3.5 w-2 shrink-0 fill-ochre" aria-hidden="true">
              <path d="M0 2.4 8 0v11.6L0 14z" />
            </svg>
            <span>
              {t(ui.stage)} {n(String(stage + 1).padStart(2, "0"))} / {n("06")}
            </span>
          </div>
          <div key={`${stage}-${lang}`} className="mt-4 animate-[fadeUp_.8s_var(--ease-out-expo)] lg:mt-6">
            <h2 className="mega mega-md">{t(step?.title)}</h2>
            <p className="lead mt-3 max-w-md opacity-80 max-lg:text-base">{t(step?.body)}</p>
            <p className="mt-4 hidden max-w-sm text-sm opacity-60 sm:block">{t(showing[stage])}</p>
          </div>

          {/* Material swatches during Control */}
          <ul
            className={clsx(
              "mt-6 hidden gap-3 transition-all duration-700 lg:flex",
              stage >= 4 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
            )}
            aria-hidden={stage < 4}
          >
            {swatches.map((s) => (
              <li key={s.id} className="flex flex-col items-center gap-1.5">
                <span className="chamfer relative block h-11 w-11 overflow-hidden [--chamfer:8px]">
                  <Image src={`/house/textures/${s.id}_diff.webp`} alt="" fill sizes="44px" className="object-cover" />
                </span>
                <span className="label opacity-70 ltr:!text-[0.58rem] ltr:!tracking-[0.08em] rtl:!text-[0.72rem]">{t(s.name)}</span>
              </li>
            ))}
          </ul>

          {/* Stage ticks */}
          <ol className="mt-8 hidden max-w-sm grid-cols-6 gap-1.5 lg:grid" aria-hidden="true">
            {process.map((_, i) => (
              <li key={i} className="h-[2px] overflow-hidden bg-current/15">
                <span
                  className="block h-full bg-ochre"
                  style={{ width: `${i < stage ? 100 : i === stage ? local * 100 : 0}%` }}
                />
              </li>
            ))}
          </ol>
        </div>

        {/* Controls */}
        <div className="absolute inset-x-[var(--gutter)] bottom-6 flex items-end justify-between gap-4 md:bottom-8">
          <button
            type="button"
            role="switch"
            aria-checked={night}
            aria-label={t(ui.lamp)}
            onClick={() => setUi({ lighting: night ? "day" : "night" })}
            className={clsx(
              "chamfer group flex h-14 items-center gap-3 ps-2 pe-6 transition-colors duration-700",
              "bg-white/10 hover:bg-white/15",
            )}
          >
            <span
              className={clsx(
                "chamfer grid h-10 w-10 place-items-center transition-colors duration-700 [--chamfer:9px]",
                night ? "gold-fill text-ink" : "bg-gypsum text-ink",
              )}
              aria-hidden="true"
            >
              <Lamp size={18} weight={night ? "fill" : "regular"} />
            </span>
            <span className="label">{night ? t(ui.evening) : t(ui.daylight)}</span>
          </button>

          <div
            className={clsx(
              "label hidden items-center gap-3 transition-opacity duration-500 sm:flex",
              progress > 0.015 && "opacity-0",
            )}
            aria-hidden={progress > 0.015}
          >
            {t(ui.scroll)}
            <span className="relative block h-10 w-px overflow-hidden bg-current/20">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollCue_1.8s_ease-in-out_infinite] bg-ochre" />
            </span>
            <ArrowDown size={14} aria-hidden="true" />
          </div>

          <div className="label hidden text-end opacity-70 md:block" dir="ltr">
            {n(Math.round(progress * 100))}%
          </div>
        </div>
      </div>
    </section>
  );
}
