# Company Portfolio — Public Client Website (`company-client`)

Bilingual (**English** / **Italian**) public-facing agriculture company portfolio built with **Next.js 16 (App Router, Cache Components & Partial Prerendering)**, **React 19**, **TypeScript (strict)**, and **Tailwind CSS v4** (light theme only).

---

## Quick Start

1. Copy `.env.local.example` to `.env.local` and configure:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Run development server (port `3000`):
   ```bash
   npm run dev
   ```
4. Build and run production server:
   ```bash
   npm run build
   npm run start
   ```
5. Lint:
   ```bash
   npm run lint
   ```

---

## Where to Edit Content, Branding & Styling

- **Company brand name, address, phone, email, and social URLs:**
  Edit ONLY [`src/config/site.ts`](src/config/site.ts). Empty social URLs are automatically hidden.
- **Brand colors (light theme only):**
  Edit ONLY the `BRAND COLORS - EDIT HERE` block in [`src/app/globals.css`](src/app/globals.css) (`--brand-primary`, `--brand-secondary`, `--brand-accent`, `--brand-accent-strong`). All components use semantic tokens.
- **Navigation links:**
  Edit [`src/config/navigation.ts`](src/config/navigation.ts). (`Recruitment` is intentionally excluded from the navbar and footer quick links.)
- **Translations & About Us copy:**
  Edit [`src/dictionaries/en.json`](src/dictionaries/en.json) and [`src/dictionaries/it.json`](src/dictionaries/it.json). Keep identical keys in both files (`TypeScript` enforces parity). Brand names use `{brand}` placeholders interpolated from `site.ts`.
  - To update **About Us** copy, edit the `about.*` keys in both dictionaries.
  - To update **Footer** tagline/labels, edit `footer.*` in both dictionaries and contact details in `src/config/site.ts`.

---

## Deployment (Vercel + Backend CORS)

1. **Deploy `company-server` first** (e.g. Render / Railway) with HTTPS enabled, MongoDB Atlas, and Cloudinary credentials.
2. **Deploy `company-client` to Vercel:**
   - Import the `company-portfolio-client` repository.
   - Set Environment Variables in Vercel:
     - `NEXT_PUBLIC_API_URL=https://<your-api-domain>/api/v1`
     - `NEXT_PUBLIC_SITE_URL=https://<your-client-domain>`
   - Deploy (`next build` succeeds even if the API is temporarily unreachable).
3. **Update Backend CORS (`company-server`):**
   - Set `CLIENT_URL` on `company-server` to include the deployed HTTPS client origin (comma-separated with `http://localhost:3000` if needed for local dev, e.g. `https://<your-client-domain>,http://localhost:3000`).
   - Ensure `ADMIN_URL` also includes the deployed HTTPS admin dashboard origin.
   - Always use **HTTPS** in production so cookies (`Secure; SameSite=None`) and canonical/sitemap/OG URLs work properly.
