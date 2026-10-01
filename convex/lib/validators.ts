import { v } from "convex/values";

/** Validators mirroring src/lib/content/types.ts. Documents keep the site's own ids in `key`. */
export const l = v.object({ en: v.string(), ar: v.string() });

export const sector = v.union(v.literal("commercial"), v.literal("hospitality"), v.literal("residential"));

export const projectFields = {
  slug: v.string(),
  name: v.string(),
  nameAr: v.string(),
  type: l,
  sector,
  city: l,
  year: v.string(),
  area: v.string(),
  scope: v.array(l),
  materials: v.optional(v.array(l)),
  summary: l,
  cover: v.string(),
  gallery: v.array(v.string()),
  featured: v.boolean(),
  inBook: v.boolean(),
  published: v.boolean(),
  order: v.number(),
};

export const memberFields = {
  name: l,
  role: l,
  bio: l,
  photo: v.string(),
  order: v.number(),
};

export const settingsFields = {
  companyName: l,
  address: l,
  phones: v.array(v.string()),
  email: v.string(),
  whatsapp: v.string(),
  instagram: v.string(),
  linkedin: v.string(),
  mapQuery: v.string(),
  coordinates: v.string(),
};

/** A project or team member as the site and the admin hold it: with its `id`. */
export const projectInput = v.object({ id: v.string(), ...projectFields });
export const memberInput = v.object({ id: v.string(), ...memberFields });
export const settingsInput = v.object(settingsFields);
