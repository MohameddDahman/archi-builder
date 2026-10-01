import { defineApp } from "convex/server";
import { v } from "convex/values";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";

const app = defineApp({
  env: {
    /** The site manager's password. Set with: npx convex env set ADMIN_PASSWORD <password> */
    ADMIN_PASSWORD: v.optional(v.string()),
  },
});
app.use(rateLimiter);

export default app;
