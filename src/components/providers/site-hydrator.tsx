"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useSite } from "@/lib/content/store";
import { convex } from "@/lib/convex";
import type { PublicSite } from "@/lib/content/server";
import { ScrollTrigger } from "@/lib/gsap";

/** Keeps the page in step with Convex: a save in the site manager shows up without a reload. */
function LiveSite() {
  const live = useQuery(api.site.get);
  const first = useRef(true);
  useEffect(() => {
    if (!live?.content || !live.settings) return;
    // The server render already holds this data; only later changes need applying.
    if (first.current) {
      first.current = false;
      const { content, projects, team, settings } = useSite.getState();
      if (JSON.stringify({ content, projects, team, settings }) === JSON.stringify(live)) return;
    }
    useSite.getState().load({ content: live.content, settings: live.settings, projects: live.projects, team: live.team });
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [live]);
  return null;
}

/**
 * Puts the site's content, read on the server, into the store before the page
 * renders, so the first paint already shows it, then follows live changes.
 */
export function SiteHydrator({ initial, live = true }: { initial: PublicSite; live?: boolean }) {
  // The first render must already hold it (server render and hydration alike);
  // later server data (after a rebuild) is taken in an effect.
  const first = useRef(true);
  if (first.current) {
    first.current = false;
    useSite.setState({ ...initial, messages: [] });
  }
  useEffect(() => {
    useSite.setState({ ...initial, messages: [] });
  }, [initial]);
  return convex && live ? <LiveSite /> : null;
}
