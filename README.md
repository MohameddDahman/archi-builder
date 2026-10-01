# Archi Builder — website

Next.js 16 (App Router) · Tailwind 4 · GSAP + Lenis · three.js / React Three Fiber · page-flip. English + Arabic (RTL).

```bash
npm install
npm run dev        # http://localhost:3000 → redirects to /en or /ar
```

## Pages
| Route | What it is |
|---|---|
| `/[lang]` | Home: project slideshow, 1:1 scale-morph manifesto, filmstrip, services, process, book teaser |
| `/[lang]/build` | The 3D villa that builds itself on scroll (plan → white model → materials), daylight / evening |
| `/[lang]/projects`, `/[lang]/projects/[slug]` | Filterable index (grid / list) and project pages with gallery lightbox |
| `/[lang]/book` | The portfolio as a bound volume on a desk: drag a corner, use the arrows or jump from the strip of spreads. Built from the published projects marked "in the book"; the Arabic volume is bound on the right |
| `/print/book/[lang]` | The same volume laid flat, page by page, for printing the PDF copy (not linked, not indexed) |
| `/[lang]/services`, `/[lang]/studio`, `/[lang]/contact` | Inner pages; the contact form feeds the admin inbox |
| `/admin` | Site manager: projects, page content (EN/AR), team, messages, settings, backup |

## Content & admin
All pages read content through `useSite` (`src/lib/content/store.ts`). Until Convex is connected, admin edits are saved in the browser (localStorage, ~5 MB — uploaded images are compressed to WebP).

## Connecting Convex (next step)
1. `npm i convex && npx convex dev` (creates the deployment and `convex/_generated`).
2. Remove `"convex"` from `exclude` in `tsconfig.json`.
3. Add queries/mutations over `convex/schema.ts` (tables mirror `src/lib/content/types.ts`), seed from `src/lib/content/seed.ts`, and switch `useSite` to `useQuery`/`useMutation`. Add Convex Auth to protect `/admin`, and Convex file storage for uploads.

## The PDF copy of the book
The book page offers the volume as a PDF (`public/book/archi-builder-portfolio-{en,ar}.pdf`). The PDFs are printed from `/print/book/[lang]` with the Edge browser installed on the machine:

```bash
npm run dev            # in one terminal
npm run book:pdf       # in another; or: node scripts/build-book-pdf.mjs <site-url>
```

The script also writes the page counts and sizes shown on the page (`src/lib/book-pdf.json`). The PDFs are snapshots: print them again after changing projects, then deploy.

## 3D assets
Models and textures in `public/house/` are CC0 from Poly Haven (see `public/house/CREDITS.txt`), optimised with glTF-Transform (~4 MB total, loaded only on `/build`).

## To confirm with the client
Project summaries and scope tags are draft copy written from the portfolio photos; year and area fields are empty until provided, and so are the optional "Materials and finishes" lists (shown under each project's detail photographs in the book). Rana Aref and Asalah Ashgar have no photos in the PDF, so their cards show gold initials.
