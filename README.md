# AI Image and Video Generator Template

A production-style Next.js 14 template for AI image/video generation with authentication, credits, payments, and generation history.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- NextAuth (Google OAuth)
- PostgreSQL (`pg`)
- Stripe (checkout + webhooks)
- Replicate (model inference)
- Cloudflare R2 / S3 compatible storage
- Tailwind CSS + NextUI/HeroUI

## Core Features
- Text-to-image generation
- Image-to-video generation
- Credit and subscription system
- User dashboard with generation history
- Stripe billing and webhook handling
- Internationalized routes via `next-intl`

## Quick Start
1. Install dependencies
```bash
npm install
```

2. Configure environment variables in `.env.local`
```env
POSTGRES_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
REPLICATE_API_TOKEN=
STRIPE_PRIVATE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_DOMAIN=http://localhost:3000
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT=
```

3. Initialize database
```bash
psql -U <username> -d <database> -f src/backend/sql/init.sql
```

4. Run development server
```bash
npm run dev
```

5. Open
- `http://localhost:3000`

## Scripts
```bash
npm run dev
npm run build
npm run start
npm run lint
npm run postbuild
```

## Project Structure
```text
src/
  app/
    [locale]/(free)/        # Public pages
    api/                    # API routes
  backend/
    config/                 # DB config
    models/                 # SQL models
    service/                # Business logic
    sql/                    # init.sql
  components/
    landingpage/
    replicate/
    layout/
    price/
messages/
public/
```

## Notes
- `next-sitemap` requires `NEXT_PUBLIC_DOMAIN` or explicit `siteUrl`.
- For production, configure webhook secrets and enforce HTTPS.

## License
MIT
