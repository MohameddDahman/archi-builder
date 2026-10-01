import { HOUR, MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { components } from "../_generated/api";

export const limits = new RateLimiter(components.rateLimiter, {
  /** Wrong passwords, across everyone: slows guessing to a crawl. */
  adminLogin: { kind: "fixed window", rate: 10, period: 15 * MINUTE },
  /** Contact form sends, across everyone: room for real enquiries, not for floods. */
  contactForm: { kind: "token bucket", rate: 30, period: HOUR, capacity: 10 },
});
