import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { memberFields, projectFields, settingsFields } from "./lib/validators";

/**
 * The site's content, as the admin edits it. Mirrors src/lib/content/types.ts;
 * projects and team members keep the site's own ids in `key`.
 */
export default defineSchema({
  projects: defineTable({ key: v.string(), ...projectFields })
    .index("by_key", ["key"])
    .index("by_order", ["order"]),

  team: defineTable({ key: v.string(), ...memberFields })
    .index("by_key", ["key"])
    .index("by_order", ["order"]),

  /** The page copy (SiteContent) as one document under key "site". */
  content: defineTable({ key: v.string(), value: v.any() }).index("by_key", ["key"]),

  /** One document: contact details used across the site. */
  settings: defineTable(settingsFields),

  messages: defineTable({
    name: v.string(),
    phone: v.string(),
    email: v.string(),
    projectType: v.string(),
    message: v.string(),
    locale: v.string(),
    read: v.boolean(),
  }).index("by_read", ["read"]),

  /** Signed-in site manager sessions. Only a hash of each token is stored. */
  sessions: defineTable({ tokenHash: v.string(), expiresAt: v.number() })
    .index("by_tokenHash", ["tokenHash"])
    .index("by_expiresAt", ["expiresAt"]),
});
