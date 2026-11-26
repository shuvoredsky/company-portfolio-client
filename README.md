# Company Portfolio — Public Client Website (`company-client`)

Public bilingual (English / Italian) website for the Company Portfolio platform, built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Axios, and TanStack Query. Light theme only.

See [PLAN.md](./PLAN.md) for the complete architecture, page specifications, and roadmap.

## Getting Started

1. Copy the environment file:
   ```bash
   cp .env.local.example .env.local
   ```
2. Start the development server on port **3000**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) (automatically redirects to `/en` or `/it`).

## Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of `company-server` v1 API | `http://localhost:5000/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | Public URL of this website (canonical/sitemap) | `http://localhost:3000` |

## Available Scripts

- `npm run dev` — Start dev server on port `3000`
- `npm run build` — Production build (`next build`)
- `npm start` — Start production server on port `3000`
- `npm run lint` — Run ESLint

## Mini-Guide: Rename Company & Update Contact Info

Edit **only** `src/config/site.ts`:
- `brandName` / `brandShortName` — updates navbar, footer, metadata, and `{brand}` placeholders everywhere.
- `contact.address`, `contact.phone`, `contact.email` — updates footer links.
- `social.facebook`, `linkedin`, `instagram`, `youtube` — leave empty `""` to hide an icon, or add a full `https://` URL to display it.

To replace the text/icon logo with an image later, follow the comment at the top of `src/components/common/Brand.tsx`.

## Mini-Guide: Change Brand Colors

Edit **only** the `BRAND COLORS - EDIT HERE` block at the top of `src/app/globals.css`:
```css
:root {
  --brand-primary: #14532d;
  --brand-secondary: #ecfdf5;
  --brand-accent: #fde047;
  --brand-accent-strong: #f59e0b;
}
```
All surfaces, hover/active nav colors, borders, focus rings, and glass surfaces derive from these tokens.

## Mini-Guide: Add or Edit a Translation

1. Edit `src/dictionaries/en.json` and `src/dictionaries/it.json`.
2. Both files must have identical keys (TypeScript checks `it.json` against `en.json` at compile time).
3. Use `{brand}` wherever the company name should appear so renaming in `src/config/site.ts` updates all languages automatically.
