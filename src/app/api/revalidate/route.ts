import { revalidateTag } from "next/cache";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { SITE_TAG } from "@/lib/content/server";

/**
 * Called by the site manager after a save: rebuilds the public pages from the
 * new content. Only a live site-manager session may trigger it.
 */
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  const body = (await request.json().catch(() => null)) as unknown;
  const token = typeof body === "object" && body !== null && "token" in body && typeof body.token === "string" ? body.token : "";
  if (!url || !token) return Response.json({ ok: false }, { status: 400 });

  const { valid } = await new ConvexHttpClient(url).query(api.auth.session, { token });
  if (!valid) return Response.json({ ok: false }, { status: 401 });

  revalidateTag(SITE_TAG, "max");
  return Response.json({ ok: true });
}
