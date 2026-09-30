"use client";

import { useLocale } from "@/components/providers/locale";
import { ui } from "@/lib/dict";
import { Rich } from "@/components/ui/rich";
import { Btn } from "@/components/ui/primitives";

export default function NotFound() {
  const { t, n } = useLocale();
  return (
    <section className="flex min-h-svh flex-col justify-center px-[var(--gutter)] pt-[var(--header-h)]">
      <p className="label mb-6 text-ochre" dir="ltr">
        {n(4)}·{n(0)}·{n(4)} — {n(1)}:{n(0)}
      </p>
      <h1 className="mega mega-xl max-w-[18ch]">
        <Rich text={t(ui.notFound)} />
      </h1>
      <p className="lead mt-8 max-w-md text-gypsum/70">{t(ui.notFoundBody)}</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Btn to="/">{t(ui.goHome)}</Btn>
        <Btn to="/projects" tone="ghost">
          {t(ui.allProjects)}
        </Btn>
      </div>
    </section>
  );
}
