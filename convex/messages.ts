import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { limits } from "./lib/limits";

const clip = (s: string, max: number) => s.trim().slice(0, max);

/** The contact form. Open to everyone, so it is checked and rate limited here. */
export const send = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    email: v.string(),
    projectType: v.string(),
    message: v.string(),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    const name = clip(args.name, 120);
    const phone = clip(args.phone, 40);
    const message = clip(args.message, 4000);
    if (!name || phone.replace(/\D/g, "").length < 9 || message.length < 10) {
      throw new ConvexError({ code: "INVALID", message: "Name, phone and a short message are required." });
    }
    const status = await limits.limit(ctx, "contactForm");
    if (!status.ok) throw new ConvexError({ code: "RATE_LIMITED", retryAfter: status.retryAfter });
    await ctx.db.insert("messages", {
      name,
      phone,
      email: clip(args.email, 200),
      projectType: clip(args.projectType, 120),
      message,
      locale: args.locale === "ar" ? "ar" : "en",
      read: false,
    });
    return null;
  },
});
