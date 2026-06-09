# ORITH Backend (NestJS)

The full ORITH API, ported from the Next.js route handlers into a standalone
NestJS application. The Next.js app is now **frontend-only** and calls this
service over HTTP (CORS); its old `app/api/*` routes have been removed.

## Architecture

- **Two processes:** Next.js frontend (`:3000`) + NestJS API (`:4000`).
- The frontend points at this API via `NEXT_PUBLIC_API_URL` (used by
  `lib/api.ts` and a shared `apiUrl()` helper). All paths keep the `/api/...`
  prefix (NestJS `setGlobalPrefix("api")`), so behaviour is unchanged.
- Shares the **same PostgreSQL database** (same Prisma schema) and the **same
  `JWT_SECRET`**, so existing tokens and data keep working.

## Modules (full parity with the old routes)

| Module | Endpoints |
|---|---|
| auth | `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me` |
| products | `GET /api/products`, `POST /api/products`, `GET/PUT/DELETE /api/products/:id` |
| cart | `GET/POST/DELETE /api/cart`, `PUT/DELETE /api/cart/:productId` |
| reviews | `POST /api/reviews`, `GET /api/reviews/:productId` |
| offers | `GET /api/offers` |
| orders | `GET/POST /api/orders`, `GET/PUT/PATCH/DELETE /api/orders/:id` |
| admin | `GET /api/admin/{orders,stats,customers,reviews}`, `DELETE /api/admin/reviews/:id` |
| stats | `GET /api/stats` |
| upload | `POST /api/upload` |
| checkout | `POST /api/checkout/{validate-coupon,create-order}` |
| payments | `POST /api/payments/initiate`, `GET /api/payments/verify/:transactionId` |
| webhooks | `POST /api/webhooks/paymob` (HMAC-verified) |

Guards: `JwtAuthGuard` (auth required), `AdminGuard` (admin only),
`OptionalAuthGuard` (attaches user if present). Validation reuses the original
Zod schemas via a `ZodValidationPipe`.

## Setup

```bash
cd backend
cp .env.example .env          # fill in DATABASE_URL, JWT_SECRET, Paymob keys
npm install
npm run prisma:generate
npm run db:push               # sync schema (same DB as the frontend used)
npm run db:seed               # optional: admin user, sample data, coupons
npm run start:dev             # http://localhost:4000/api
```

Then run the frontend with `NEXT_PUBLIC_API_URL=http://localhost:4000`.

## Notes / caveats

- **Uploads** are written to `../public/products` (the frontend's static dir) so
  they're served at `/products/<file>`. Override with `UPLOAD_DIR`.
- **Guest order-access cookie** (`orith_order_access`, used for guest order
  confirmation) is cross-origin: it works over HTTPS (cookie set
  `SameSite=None; Secure` in production) and for authenticated users (Bearer).
  In plain-HTTP local dev across different ports, guest cookies may not flow —
  authenticated users are unaffected.
- In-memory Paymob token cache and rate limiter are per-process; use Redis for
  multi-instance deployments.
- The frontend still contains the now-unused server libs it used to share
  (`lib/prisma`, `lib/auth`, `lib/middleware`, `lib/hash`, `lib/productStore`,
  `lib/paymob/{client,hmac}`); they're dead code and can be pruned.
