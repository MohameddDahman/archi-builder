import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Mirrors src/lib/content/types.ts. When Convex is connected, the local
 * Zustand store (src/lib/content/store.ts) is swapped for queries/mutations
 * over these tables; pages already read everything through `useSite`.
 */
const l = v.object({ en: v.string(), ar: v.string() });

export default defineSchema({
  projects: defineTable({
    slug: v.string(),
    name: v.string(),
    nameAr: v.string(),
    type: l,
    sector: v.union(v.literal("commercial"), v.literal("hospitality"), v.literal("residential")),
    city: l,
    year: v.string(),
    area: v.string(),
    scope: v.array(l),
    materials: v.optional(v.array(l)),
    summary: l,
    cover: v.string(), // URL or Convex storage id
    gallery: v.array(v.string()),
    featured: v.boolean(),
    inBook: v.boolean(),
    published: v.boolean(),
    order: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_order", ["order"]),

  team: defineTable({ name: l, role: l, bio: l, photo: v.string(), order: v.number() }).index("by_order", ["order"]),

  /** One document per page section (hero, about, vision, services…), value = section JSON. */
  content: defineTable({ key: v.string(), value: v.any() }).index("by_key", ["key"]),

  settings: defineTable({
    companyName: l,
    address: l,
    phones: v.array(v.string()),
    email: v.string(),
    whatsapp: v.string(),
    instagram: v.string(),
    linkedin: v.string(),
    mapQuery: v.string(),
    coordinates: v.string(),
  }),

  messages: defineTable({
    name: v.string(),
    phone: v.string(),
    email: v.string(),
    projectType: v.string(),
    message: v.string(),
    locale: v.string(),
    read: v.boolean(),
  }),
});
