import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("sweep expired admin sessions", { hours: 6 }, internal.auth.sweepSessions, {});

export default crons;
