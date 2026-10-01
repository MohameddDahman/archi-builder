"use client";

import { ConvexReactClient } from "convex/react";

const url = process.env.NEXT_PUBLIC_CONVEX_URL;

/** The one Convex client for the browser. Null if the site runs without a backend. */
export const convex = url ? new ConvexReactClient(url) : null;
