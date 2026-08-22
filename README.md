# FarmConnect - Frontend

**The buyer, farmer, and admin experience for Sri Lanka's farm-to-table marketplace.**

A Next.js application serving three distinct experiences from one codebase: a public storefront for buyers, a dedicated workspace for farmers managing their listings and sales, and an admin panel for platform oversight - fully responsive, and available in English, Sinhala, and Tamil.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)

---

## Features

### Storefront (public)
- Landing page: hero, a **Shop by Category** section pulled live from the real catalog (never a hardcoded list), fresh listings, and a rotating daily featured product
- Advanced search: keyword, category, price range, product type, and location - browse by district/city, or use **GPS "near me"** search with an adjustable radius, with results plotted on an interactive map
- Three product types rendered natively throughout - physical goods, rentable equipment, and bookable services each show the fields relevant to them
- A dedicated **booking flow** for rentable equipment and services - date selection, and a request that a farmer can accept or decline
- Persistent cart with live quantity/stock validation, and a full checkout flow with pickup-vs-delivery choice and an optional note to the farmer
- **Order-scoped real-time chat** - message a farmer directly from within an order, with online-presence indicators
- Downloadable PDF invoices per order

### Farmer workspace
- Its own sidebar navigation (Dashboard, My Products, Orders, Bookings) nested inside the main site, so a farmer never loses access to the storefront while managing their business
- Analytics dashboard - revenue and order-volume charts, recent orders, top-selling products
- Full listing management: create and edit with type-specific fields, multi-image + video upload with independent add/remove/replace, multi-city availability, delivery-district coverage
- Order management with status workflow (accept/decline with notes, mark preparing/out-for-delivery/delivered) and per-order chat
- A verification-pending state for farmers awaiting KYC approval

### Admin panel
- Platform analytics with time-series charts (revenue, order volume, users, active farmers)
- User management and KYC review
- Product management - searchable, paginated, one-click activate/deactivate, backed by the same moderation system used for reviews

### Platform-wide
- **Trilingual**: English, Sinhala (සිංහල), Tamil (தமிழ்), via `next-intl` with locale-prefixed routing
- Light/dark theme
- Mobile-first throughout - off-canvas filter drawers, horizontal scroll-snap sliders, a bottom nav for quick actions on phones
- Role-aware navigation - farmer-only links only render for users who are actually farmers
- Google OAuth sign-in with a profile-completion step for new accounts

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Data fetching | TanStack Query |
| State | Zustand |
| i18n | next-intl |
| Charts | Recharts |
| Maps | Interactive map view for location-based search |
| Auth | JWT (via backend), Google OAuth2 |

## Getting Started

### Prerequisites
- Node.js 20+
- The FarmConnect backend running and reachable

### Environment variables

Create `.env.local` in the project root:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
```

`NEXT_PUBLIC_API_URL` is confirmed directly from the API client (and falls back to the value above if unset, so it's optional for local dev against a default-configured backend). `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is confirmed from the root layout's OAuth provider - shown here as a placeholder rather than a real value on purpose, even though `NEXT_PUBLIC_*` variables are inherently public once bundled; a README isn't the place to publish a live one.

### Running locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Project Structure

```
app/[locale]/
├── (admin)/admin/
│   ├── kyc/
│   ├── products/
│   └── users/
├── (auth)/
│   ├── complete-profile/
│   ├── login/
│   └── register/
└── (main)/
    ├── bookings/
    ├── chat/
    ├── checkout/
    ├── farmer/
    │   ├── bookings/
    │   ├── dashboard/
    │   ├── orders/[id]/
    │   ├── products/
    │   │   ├── add/
    │   │   └── [id]/edit/
    │   └── verification-pending/
    ├── orders/[id]/
    │   └── download/
    ├── products/[id]/
    ├── profile/
    └── search/

components/
├── auth/  booking/  cart/  charts/  chat/
├── dashboard/  farmer/  home/  layout/  map/
├── orders/  products/  providers/  review/  ui/

hooks/   i18n/   lib/{api,validations}/   messages/   stores/   types/
```

## Internationalization

All user-facing text lives in `messages/{en,si,ta}.json`. New features ship with entries in all three files, not English alone - this is an active discipline on the project, not a one-time setup step, and there's a standing task to backfill anywhere that's fallen behind.

## Design System

A CSS-variable-driven theme (`--primary`, `--secondary`, and friends) that adapts automatically between light and dark mode. Primary brand color is a fresh green; secondary is a warm amber. Icons via `lucide-react`; the logo mark and hero illustration are hand-authored SVG rather than stock imagery - no external image dependency for the brand identity itself.

## Roadmap

- [ ] In-app notification UI (bell/inbox), complementing the email notifications that already exist
- [ ] i18n sweep - a handful of newer dashboard/widget strings are still hardcoded English
- [ ] Real farm/produce photography in the hero, once available, replacing the current illustration

## Author

**Chamela Yohan**
[Portfolio](https://chamela-yohan.vercel.app) · [GitHub](https://github.com/chamela-yohan) · [LinkedIn](https://www.linkedin.com/in/chamela-aththanayaka/)

---

*Every feature above - the geospatial search, the three-product-type system, the trilingual UI, the order-scoped chat - was built and debugged end to end, not scaffolded and left unexamined.*
