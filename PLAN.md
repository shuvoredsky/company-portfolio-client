# Company Portfolio — Public Client Website (`company-client`) Plan

## 1. Purpose & Tech Stack
Public-facing bilingual (**English** / **Italian**) agriculture company portfolio website, consuming the public REST APIs of `company-server` (`/api/v1`). **Light theme only** (no login, no dark mode).

- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript (`strict: true`, zero `any`)
- **Styling:** Tailwind CSS v4 (`@theme inline`) + single-place CSS variables
- **Networking & State:** `axios` (no `withCredentials`) + `@tanstack/react-query`
- **Carousel:** `embla-carousel-react` + `embla-carousel-autoplay`
- **Forms & Validation:** `react-hook-form` + `zod` + `@hookform/resolvers`
- **Country List:** `i18n-iso-countries` (localized EN/IT country names)
- **Icons & Notifications:** `lucide-react`, `sonner`
- **Dev/Start Port:** `3000` (`http://localhost:3000`)

---

## 2. Folder Structure
```text
src/
├── proxy.ts                      # Next.js 16 locale detection & redirect proxy
├── app/
│   ├── globals.css               # Single-place BRAND COLORS & semantic tokens (light only)
│   ├── robots.ts                 # Dynamic robots.txt
│   ├── sitemap.ts                # Localized sitemap.xml
│   └── [lang]/
│       ├── layout.tsx            # Root layout (<html lang>, Plus Jakarta Sans, Providers, Navbar, Footer)
│       ├── page.tsx              # Home (banner slider, 3 latest Press, glass recruitment modal)
│       ├── about/page.tsx        # About Us (dictionary content)
│       ├── press/page.tsx        # Press list + [id]/page.tsx detail (Client 3)
│       ├── network/page.tsx      # Network list + [id]/page.tsx detail (Client 4)
│       ├── recruitment/page.tsx  # Active recruitments list + detail (Client 4; NOT in navbar)
│       ├── contact/page.tsx      # Contact Us form with country select & honeypot (Client 5)
│       ├── [...slug]/page.tsx    # Triggers localized not-found.tsx
│       ├── not-found.tsx
│       ├── error.tsx
│       └── loading.tsx
├── components/
│   ├── common/                   # Brand, LanguageSwitcher, LocaleLink, Container, Section, SectionHeading, PageHero, Pagination, SearchBox, SafeImage
│   ├── home/                     # BannerSection, BannerSlider, LatestPressSection, RecruitmentModal, RecruitmentModalLoader
│   ├── press/                    # PressCard
│   ├── network/                  # NetworkCard
│   ├── recruitment/              # RecruitmentAccordion
│   ├── ui/                       # Button, Input, Label, Textarea, Select, Card, Skeleton, Spinner, Badge, Modal (default + glass)
│   ├── layout/                   # Navbar, MobileMenu, Footer
│   └── providers/                # Providers (QueryClientProvider, LanguageProvider, Toaster)
├── config/
│   ├── site.ts                   # Single-place company brand name, contact details, social links
│   ├── env.ts                    # Zod-validated NEXT_PUBLIC_API_URL & NEXT_PUBLIC_SITE_URL
│   └── navigation.ts             # Single-place main nav items (About Us, Press, Network, Contact Us)
├── dictionaries/
│   ├── en.json                   # Canonical English UI dictionary
│   └── it.json                   # Natural Italian UI dictionary (type-checked against en.json)
├── hooks/
│   ├── useBodyScrollLock.ts
│   └── useDebouncedValue.ts
└── lib/
    ├── api/                      # client.ts, types.ts, banners.ts, blogs.ts (Press), networks.ts, recruitments.ts, contacts.ts
    ├── i18n/                     # config.ts, getDictionary.ts, format.ts, LanguageContext.tsx
    ├── images.ts                 # Cloudinary f_auto,q_auto,w_<width>,c_limit optimizer
    ├── queryKeys.ts              # Centralized TanStack Query keys
    ├── seo.ts                    # buildPageMetadata (canonical + en/it/x-default alternates)
    └── utils.ts                  # cn()
```

---

## 3. Single-Place Branding, Color & Nav Rules
- **Branding (`src/config/site.ts`):** Brand name, short name, site URL, address, phone, email, and social URLs live ONLY in `src/config/site.ts`. Dictionaries use `{brand}` placeholders interpolated at render time.
- **Colors (`src/app/globals.css`):** Edit ONLY the `BRAND COLORS - EDIT HERE` block (`--brand-primary`, `--brand-secondary`, `--brand-accent`, `--brand-accent-strong`). All components use semantic Tailwind classes only (`bg-primary`, `text-accent`, `text-accent-strong`, `bg-card`, `text-muted-foreground`, etc.) — **never** raw hex or palette classes like `bg-green-700` or `text-yellow-500`.
- **Navigation (`src/config/navigation.ts`):** Single list of 4 public nav items (`About Us`, `Press`, `Network`, `Contact Us`). `Recruitment` is intentionally excluded from the navbar.

---

## 4. i18n Design (`en` / `it`)
- All pages live under `src/app/[lang]/...` with `generateStaticParams` returning `en` and `it` and unknown locales triggering `notFound()`.
- `src/proxy.ts` skips `/_next`, `/api`, `robots.txt`, `sitemap.xml`, and files with extensions. Requests without a locale prefix are redirected to `/{locale}/...` (preserving query strings) using: (1) `NEXT_LOCALE` cookie → (2) `Accept-Language` header → (3) default `en`.
- Adding a UI string: add the key to both `src/dictionaries/en.json` and `src/dictionaries/it.json` (TypeScript enforces identical keys via `Record<Locale, typeof en>`).
- **Content Translation Rule:** Dynamic content from the backend API (banners, press, networks, recruitments) is **not** translated; only static UI chrome, headings, forms, and About Us copy are localized.

---

## 5. API Layer & Data Strategy
- **Public Endpoints Used:**
  - `GET /banners` (image-only: `_id`, `image.url`, `order`)
  - `GET /blogs` & `GET /blogs/:id` (displayed as **Press**)
  - `GET /networks` & `GET /networks/:id`
  - `GET /recruitments` & `GET /recruitments/:id` (active only)
  - `POST /contacts` (`name`, `country`, `phone`, `email`, `message`, hidden honeypot `website`)
- **Strategy (Next.js 16 Cache Components):**
  - Server data fetchers live in `src/lib/api/server.ts` using `'use cache'` + `cacheLife({ stale: 30, revalidate: 60, expire: 3600 })` + `cacheTag(...)` calling the shared Axios modules (`getBanners`, `getPressList`, etc.).
  - Each async section (`BannerSection`, `LatestPressSection`) is wrapped in its own `<Suspense>` boundary for streaming/PPR and independent error isolation (catching API failures cleanly without crashing the whole page or build).
  - Client interactions (pagination, `RecruitmentModal`, contact submission) use TanStack Query (`staleTime: 60_000`, `refetchOnWindowFocus: false`).
  - `RecruitmentModalLoader` dynamically imports `RecruitmentModal` (`ssr: false`) after `window` load + 800ms delay, gated by `sessionStorage` key `recruitment_modal_seen` (wrapped in `try/catch`). Per-item deep links use `buildRecruitmentItemPath(id)` -> `/recruitment?open=<id>` (implemented in Client 4).
  - Public Axios instance (`src/lib/api/client.ts`) uses `withCredentials: false` and normalizes errors into `ApiError(status, message, errorSources)`.

---

## 6. Image & Performance Rules
- `next.config.ts` enables `compress: true`, `formats: ['image/avif', 'image/webp']`, and `remotePatterns` for `https://res.cloudinary.com`.
- `src/lib/images.ts` injects `f_auto,q_auto,w_<width>,c_limit` into Cloudinary URLs.
- `<SafeImage />` wraps `next/image`: lazy-loaded by default (`priority` ONLY on the first banner / LCP image per page), fixed aspect-ratio containers to prevent CLS, explicit `sizes`, muted loading background, and graceful error fallback.
- Static local assets live in `public/images/` and use `next/image`.
- Single Google Font (`Plus Jakarta Sans`) loaded via `next/font/google` with `display: 'swap'`.
- Server Components by default; `'use client'` only where required; dynamically import heavy client-only widgets (carousel, modals) in subsequent prompts.

---

## 7. Coding, Accessibility & Security Rules
- TypeScript `strict: true`, **no `any`**.
- **Light theme only** (`color-scheme: light`).
- Responsive mobile-first from `320px` to large desktop, zero horizontal scroll, `>= 40px` touch targets, `prefers-reduced-motion` respected.
- Accessibility: skip-to-content link, semantic landmarks, `aria-current="page"`, focus-visible rings, keyboard-trapped modals/drawers.
- **XSS & Link Safety:** Never use `dangerouslySetInnerHTML` for API content (render plain text with `whitespace-pre-wrap`). Only render `http://` / `https://` external links with `target="_blank" rel="noopener noreferrer"`.

---

## 8. Detailed Page Specifications
- **Home (`/[lang]`):**
  - Image-only Embla banner slider (autoplay only when 2+ banners, pause on hover/focus, arrows + dots, touch swipe, respects `prefers-reduced-motion`, first image `priority`, responsive aspect ratio `16/9` on mobile and wider on desktop, sorted by `order`).
  - 3 latest **Press** cards with a `"View all"` link to `/[lang]/press`.
  - On first load of the session (`sessionStorage` flag, after page loads), displays a **glassmorphism modal** (`Modal variant="glass"`) listing active recruitments (title, short description, `"Apply / Learn more"` link to `/[lang]/recruitment`, close button, `Escape`, `"Don't show again this session"`). Hidden completely if there are no active recruitments.
- **About Us (`/[lang]/about`):** Clean localized sections powered entirely by `about.*` dictionary copy (`PageHero`, Who We Are, Mission & Vision cards, 4 Values cards, Contact CTA). To add an image later, place it in `public/images/` (or a Cloudinary URL) and render `<SafeImage src="/images/about-hero.jpg" alt="..." fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />` inside a fixed-aspect container (`aspect-[16/10]`).
- **Press (`/[lang]/press` & `/[lang]/press/[id]`):**
  - List page uses `PageHero`, URL-driven debounced `SearchBox` (`?search=<query>`, resets page to 1 via `router.replace(..., { scroll: false })`, also supports native `<form>` submit), server-cached `getCachedPressList(page, 9, search)` wrapped in `<Suspense>`, and link-based `Pagination` (`?page=<n>&search=<query>`, omits `page=1`). Invalid `page` values (`0`, `-1`, non-numeric) clamp to `1`; requests beyond `totalPages` redirect to the last valid page via Next.js `redirect()`. Search result URLs emit `robots: noindex, nofollow` and canonical to `/press`.
  - Detail page validates 24-hex ObjectId before fetching `getCachedPressById(id)` (tagged `['press', 'press-${id}']`). Invalid IDs or 404s call `notFound()`. Renders accessible breadcrumb, priority 16:9 `SafeImage`, plain-text description (`whitespace-pre-line break-words max-w-3xl`), Article JSON-LD (`<` escaped as `\u003c`), OpenGraph/Twitter metadata, and a `<Suspense>`-isolated `MorePressSection` (up to 3 other latest items, hidden if none).
  - `src/app/sitemap.ts` includes all localized static routes plus up to 100 Press items (EN/IT with `alternates` and `lastModified`), falling back cleanly to static routes if the API is offline.
- **Network (`/[lang]/network` & `/[lang]/network/[id]`):**
  - List page reuses `PageHero`, generic `SearchBox` (`src/components/common/SearchBox.tsx`), `getCachedNetworkList(page, 9, search)` (tagged `'networks'`), `NetworkCard` (non-interactive external-site badge, no nested links), and `Pagination` (same invalid-page clamping, out-of-range redirect, and `noindex` + base canonical rules as Press).
  - Detail page validates 24-hex ObjectId, fetches `getCachedNetworkById(id)` (tagged `['networks', 'network-${id}']`), validates `externalUrl` via `parseSafeExternalUrl` (`src/lib/url.ts`, strictly `http:`/`https:` only) before rendering `"Visit website"` (`target="_blank" rel="noopener noreferrer"` with hostname new-tab `aria-label`), emits Organization JSON-LD (`<` escaped as `\u003c`), and renders `<Suspense>`-isolated `MoreNetworksSection` (up to 3 other items).
- **Recruitment (`/[lang]/recruitment` & `/[lang]/recruitment/[id]`):**
  - Active openings only (`getCachedRecruitmentList(page, 10)` tagged `'recruitments'`, `getCachedRecruitmentById(id)` tagged `['recruitments', 'recruitment-${id}']` returning `notFound` if missing or `!isActive`). Intentionally excluded from Navbar and Footer quick links.
  - **Accordion choice:** Client `RecruitmentAccordion` uses accessible `<button aria-expanded aria-controls>` + `role="region"` with CSS grid-row transitions (`motion-reduce:transition-none`) while keeping full plain-text descriptions in the SSR DOM for search engine indexing.
  - **Deep-link contracts:**
    - `?open=<id>` (`buildRecruitmentItemPath(id)`): validated as 24-hex ObjectId; if matching an item on the current page, that opening renders expanded by default, highlighted, and scrolled into view (`scroll-mt-24`, respecting `prefers-reduced-motion`). Invalid/unmatched IDs are ignored silently.
    - `?position=<encoded title>` (`buildApplyContactPath(title)`): `"Apply"` links to `/{lang}/contact?position=<encoded title>` so Client Prompt 5 can prefill the contact message/subject.
  - **Stale-cache note:** Because public detail pages use `'use cache'` (`revalidate: 60`), a recruitment that is deactivated or deleted in the admin dashboard may remain visible until the ~60s revalidation window elapses, after which it resolves to `notFound()`.
  - `src/app/sitemap.ts` includes all localized static routes plus up to 100 Press, 100 Network, and 100 Recruitment items (EN/IT with `alternates` and `lastModified`), falling back cleanly to static routes if the API is offline.
- **Contact Us (`/[lang]/contact`):**
  - Two-column layout (`PageHero`, left contact details from `siteConfig` with `tel:`/`mailto:` and non-empty social links, right `ContactForm`).
  - `ContactForm` (`src/components/contact/ContactForm.tsx`) uses `react-hook-form` + localized Zod validation + TanStack Query `useMutation` (`submitContact`).
  - **Country list decision:** Uses `i18n-iso-countries` (EN/IT locales registered inside `ContactForm`, sorted with `Intl.Collator(lang)`). Displays country names in the active UI language (`Italia` / `Italy`) while always submitting the **English** country name to the API so admin records stay consistent.
  - **Prefill contract:** Reads `?position=<title>` inside `<Suspense>`, sanitizes control chars (max 200 chars), prefills the message once without overwriting user edits, and shows an `"Applying for: {title}"` banner.
  - **Honeypot & error handling:** Hidden off-screen `website` field (`tabIndex={-1}`, `aria-hidden`), double-submit prevention, 400 `errorSources` mapped to field errors, friendly 429 rate-limit message, network-error message, and generic 5xx fallback (never exposing raw server messages).
- **Application Status (`/[lang]/application-status`):**
  - Excluded from Navbar and `sitemap.ts`, marked `robots: noindex, nofollow`. Linked from Footer Quick Links (`footerExtraLinks` in `src/config/navigation.ts`) and from a subtle prompt on `/[lang]/recruitment`.
  - Uses `POST /api/v1/applications/check` via `checkApplication(serialNumber)` (`src/lib/api/applications.ts`) and TanStack Query `useMutation` (`retry: false`, no caching). Serial numbers are NEVER placed in the URL/query string, logged, or stored in browser storage/cookies.
  - Response contract: `{ serialNumber, status, maskedName, note: string | null, updatedAt }`. Displays status badge (icon + semantic token), localized explanation, masked name, localized `Last updated` date, and a `"Next steps"` plain-text section (`whitespace-pre-line break-words`) when `note` is non-null, inside the shared accessible `<Modal>`.
- **SEO & Soft-404 Notes:**
  - Home emits `Organization` and `WebSite` JSON-LD (`<` escaped as `\u003c`).
  - `src/app/[lang]/opengraph-image.tsx` generates a localized 1200×630 branded OpenGraph/Twitter image for routes without a specific article/partner image.
  - Removed `src/app/[lang]/loading.tsx` so no implicit `<Suspense>` wraps detail pages (`press/[id]`, `network/[id]`, `recruitment/[id]`), while each page keeps inline `<Suspense>` around streaming sections. Verified on `next start`: unknown routes (`/[lang]/[...slug]`) return true HTTP `404` and root unknown paths return `307` to `/en/...`; however, under Next.js 16 `cacheComponents: true` + `partialPrefetching: true`, unlisted dynamic `[id]` routes stream the PPR static shell with HTTP `200` before `notFound()` runs, emitting `<meta name="robots" content="noindex">` and the localized `not-found.tsx` UI.
  - Brand token `--brand-accent-strong` tuned to `#fbbf24` (`5.46:1` contrast on `--brand-primary` `#14532d`, passing WCAG AA for normal text).

---

## 9. Client Frontend Roadmap & Git Rule
| Prompt | Scope | Git Action | Status |
| --- | --- | --- | --- |
| **Client 1** | Setup, PLAN, i18n (`en`/`it` + `proxy.ts`), Colors, Navbar, Footer, UI Primitives, API Layer | No git | **Done** |
| **Client 2** | Home Page (Embla banner slider, 3 latest Press + View all, glass recruitment modal) | No git | **Done** |
| **Client 3** | About Us polish, Press list (search + pagination), Press details (`More Press`, JSON-LD), Sitemap | **First commit & push** | **Done** |
| **Client 4** | Network list + details, Recruitment list (accordion, `?open=`) + details, Sitemap update | Commit & push | **Done** |
| **Client 5** | Contact Us page, soft-404 fix, SEO/OG/JSON-LD, contrast/perf QA, Playwright E2E, final docs | Commit & push | **Done** |

---

## 10. Deployment Notes
- **Vercel:** Connect `company-client`, set `NEXT_PUBLIC_API_URL` (`https://<api-domain>/api/v1`) and `NEXT_PUBLIC_SITE_URL` (`https://<client-domain>`).
- **Backend CORS:** Add the deployed HTTPS client origin to `CLIENT_URL` on `company-server` (comma-separated with `http://localhost:3000` if needed).

