import { notFound } from "next/navigation";

/**
 * Any path under a language that no page claims. Throwing notFound() here
 * renders [lang]/not-found.tsx inside the site's own layout (header, footer,
 * language), instead of the framework's bare 404.
 */
export default function Missing() {
  notFound();
}
