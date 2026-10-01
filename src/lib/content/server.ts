import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { seed } from "./seed";
import type { Project, Settings, SiteContent, TeamMember } from "./types";

export type PublicSite = {
  content: SiteContent;
  settings: Settings;
  projects: Project[];
  team: TeamMember[];
};

/** Cache tag for everything the public site renders from Convex. */
export const SITE_TAG = "site";

const fromSeed = (): PublicSite => ({
  content: seed.content,
  settings: seed.settings,
  projects: seed.projects.filter((p) => p.published),
  team: seed.team,
});

/**
 * The public site's content, read on the server. Pages stay static: the
 * response is cached under SITE_TAG and refreshed when the site manager saves
 * (app/api/revalidate) or after ten minutes. Falls back to the launch content
 * if the backend can't be reached, so the site never renders empty.
 */
export async function getSiteData(): Promise<PublicSite> {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return fromSeed();
  try {
    // Convex's HTTP client, with Next's data cache on its requests.
    const cachedFetch: typeof fetch = (input, init) => fetch(input, { ...init, cache: "force-cache", next: { tags: [SITE_TAG], revalidate: 600 } });
    const client = new ConvexHttpClient(url, { fetch: cachedFetch });
    const site = await client.query(api.site.get, {});
    if (!site.content || !site.settings) return fromSeed();
    return { content: site.content, settings: site.settings, projects: site.projects, team: site.team };
  } catch (error) {
    console.error("[site] Convex unavailable, using launch content:", error);
    return fromSeed();
  }
}
