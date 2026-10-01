import { query } from "./_generated/server";
import { readSite } from "./lib/data";

/** Everything the public site shows: published projects only. */
export const get = query({
  args: {},
  handler: async (ctx) => await readSite(ctx, { drafts: false }),
});
