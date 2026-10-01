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

## Content, admin and Convex
Content lives in [Convex](https://convex.dev) (project `archi-builder`). The public pages are prerendered from it and cached; a save in the site manager rebuilds them (`/api/revalidate`) and open pages update live. If Convex can't be reached, the site falls back to the launch content in `src/lib/content/seed.ts`.

- `convex/schema.ts`: projects, team, page content, settings, messages, admin sessions
- `convex/site.ts`: what the public site reads (published projects only)
- `convex/admin.ts`: everything the site manager reads and writes (requires a session)
- `convex/auth.ts`: password sign-in, sessions (30 days), sign-out; wrong passwords are rate limited
- `convex/messages.ts`: the contact form (validated, rate limited)
- Uploaded photos go to Convex file storage, resized in the browser first.

**Site manager** at `/admin`: one shared password, stored as the `ADMIN_PASSWORD` environment variable of the Convex deployment. To change it:

```bash
npx convex env set ADMIN_PASSWORD <new-password>            # dev deployment
npx convex env set ADMIN_PASSWORD <new-password> --prod     # production
```

**Developing**: `npx convex dev` (pushes functions, regenerates `convex/_generated`) alongside `npm run dev`. `.env.local` holds `NEXT_PUBLIC_CONVEX_URL` for the deployment in use.

**A new deployment** (e.g. production): deploy the functions, set the password, and load the launch content once:

```bash
npx convex deploy
npx convex env set ADMIN_PASSWORD <password> --prod
npx convex run seed:run --prod
```

Then set `NEXT_PUBLIC_CONVEX_URL` in Vercel to that deployment's URL and redeploy.

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
Content follows Portfolio R4 (nine projects, sector, location and scope per project, the expanded mission, method, execution and quality copy, and all three team portraits). Still to confirm:

- Project descriptions are draft copy written from the photographs; year, area and the optional "Materials and finishes" lists are empty until provided.
- R4 spells the apartment "ABDUALLAH'S APT"; the site uses "Abdullah's Apartment" (شقة عبدالله).
- R4 gives "Restaurant & Lounge" as the sector for every food and drink project, including Bread Ahead (a bakery and school in R2) and DumDum Donuts; the site shows it as each project's type.
- The English versions of the Arabic-only copy are our translations.
