"use client";

import { useEffect } from "react";
import { useSite } from "@/lib/content/store";
import { ScrollTrigger } from "@/lib/gsap";

/** Loads admin edits from storage after hydration, so server and client render the same first frame. */
export function SiteHydrator() {
  useEffect(() => {
    Promise.resolve(useSite.persist.rehydrate()).then(() => {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    const onStorage = (e: StorageEvent) => {
      if (e.key === useSite.persist.getOptions().name) useSite.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return null;
}
