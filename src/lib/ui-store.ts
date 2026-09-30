"use client";

import { useEffect, useRef } from "react";
import { create } from "zustand";

type UiState = {
  preloaderDone: boolean;
  /** True when the first-visit intro played (its louvres already opened onto the page). */
  preloaderRan: boolean;
  /** True from the moment the transition louvres start closing until they begin to open. */
  covering: boolean;
  menuOpen: boolean;
  lighting: "day" | "night";
  set: (s: Partial<Omit<UiState, "set">>) => void;
};

export const useUi = create<UiState>((set) => ({
  preloaderDone: false,
  preloaderRan: false,
  covering: false,
  menuOpen: false,
  lighting: "day",
  set: (s) => set(s),
}));

/** Run a page's entrance once the preloader and transition louvres are out of the way. */
export function useIntro(play: () => void | (() => void)) {
  const ref = useRef(play);
  ref.current = play;
  useEffect(() => {
    let cleanup: void | (() => void);
    let started = false;
    const ready = (s: UiState) => s.preloaderDone && !s.covering;
    const start = () => {
      if (started) return;
      started = true;
      cleanup = ref.current();
    };
    if (ready(useUi.getState())) start();
    const unsub = useUi.subscribe((s) => ready(s) && start());
    return () => {
      unsub();
      if (typeof cleanup === "function") cleanup();
    };
  }, []);
}
