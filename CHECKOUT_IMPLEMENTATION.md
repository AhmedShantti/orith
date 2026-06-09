# Checkout & Paymob Integration

A full multi-step checkout replacing the old "Order via WhatsApp" flow, with
Paymob (Mobile Wallet + Apple Pay) payments, server-side pricing, coupons,
order lifecycle, and an HMAC-verified webhook.

> All monetary values are stored and computed in **piastres** (1 EGP = 100
> piastres) as integers. No floating-point money math. The legacy `Order.total`
> (Float, EGP) is kept populated for the existing admin dashboard.

---

## 1. Environment variables

Copy `.env.example` → `.env.local` and fill in:

| Variable | Scope | Purpose |
|---|---|---|
| `PAYMOB_API_KEY` | server | Paymob account API key |
| `PAYMOB_HMAC_SECRET` | server | Used to verify webhook callbacks |
| `PAYMOB_MOBILE_WALLET_INTEGRATION_ID` | server | Wallet integration id |
| `PAYMOB_APPLE_PAY_INTEGRATION_ID` | server | Apple Pay integration id (optional) |
| `PAYMOB_APPLE_PAY_IFRAME_ID` | server | Apple Pay iframe id (optional) |
| `NEXT_PUBLIC_APP_URL` | public | Base URL for redirect URLs (HTTPS in prod) |
| `NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD` | public | Free-shipping threshold, piastres (default 150000) |
| `NEXT_PUBLIC_STORE_NAME` | public | Store name in page titles |
| `SHIPPING_FEE_CAIRO_GIZA` | server | Metro shipping fee, piastres (default 5000) |
| `SHIPPING_FEE_OTHER` | server | Other-governorate fee, piastres (default 8000) |

Secrets are accessed lazily via `lib/env.ts`; a missing required value throws
`[FATAL] Missing required environment variable: …` the first time it's read
(i.e. on the first payment request, not at boot). To fail fast at server start,
call `assertPaymobConfigured()` from `instrumentation.ts`.

> **Security:** Paymob secrets have **no** `NEXT_PUBLIC_` prefix and are never
> imported into client components. `lib/paymob/*` and `lib/paymob/hmac.ts` carry
> `import "server-only"` so a stray client import fails the build.

---

## 2. Paymob dashboard configuration

1. **Integration IDs** — create a Mobile Wallet integration (and optionally an
   Apple Pay integration + iframe) and copy their ids into the env vars above.
2. **Transaction processed callback (webhook):**
   `https://YOUR_DOMAIN/api/webhooks/paymob`
   Paymob appends `?hmac=…`; the route rejects any request whose HMAC fails.
3. **Transaction response callback (redirect):**
   `https://YOUR_DOMAIN/payment/success?transaction_id={transaction_id}`
   Failed transactions can point to `/payment/failure?transaction_id={transaction_id}`.
4. Make sure the **HMAC secret** in the dashboard matches `PAYMOB_HMAC_SECRET`.

---

## 3. Database setup

The schema extends the existing Prisma models (no breaking changes to the admin):

- `Order` — gains `orderNumber`, customer/shipping snapshot fields, piastres
  financials (`subtotal`, `discountAmount`, `shippingFee`, `taxAmount`,
  `totalAmount`), `paymentMethod`, `paymentStatus`, Paymob ids, `idempotencyKey`,
  `paidAt`. `userId` is now optional (guest checkout). Expanded `OrderStatus`.
- `OrderItem` — gains snapshot fields (`productName`, `productSku`, `variantName`,
  `unitPrice`, `totalPrice`, `imageUrl`); `productId` is optional (the storefront
  catalogue is static, so items are self-contained snapshots).
- New: `Coupon`, `PaymentTransaction`. New enums: `PaymentStatus`,
  `PaymentMethod`, `CouponType`, `TransactionStatus`.

Apply it (this project uses `db push`, not migration files):

```bash
npm run db:push      # sync schema to the database
npm run db:seed      # optional: sample coupons WELCOME10 / SAVE50 / ORITHVIP
```

Unique indexes on `Order.orderNumber`, `Order.idempotencyKey`,
`Order.paymobTransactionId`, and `PaymentTransaction.paymobTransactionId`
protect against duplicates.

---

## 4. Order lifecycle

```
Cart → /checkout (5 steps) → Place Order & Pay
  POST /api/checkout/create-order   → Order PENDING_PAYMENT (prices computed server-side)
  POST /api/payments/initiate       → Order AWAITING_CONFIRMATION, Paymob order + payment key
    Mobile Wallet → redirect to Paymob OTP page
    Apple Pay     → iframe with payment key
  Paymob → POST /api/webhooks/paymob (HMAC verified) → the ONLY place status changes
    success & !pending → PROCESSING / PAID
    failure            → PAYMENT_FAILED / FAILED
    pending            → AWAITING_CONFIRMATION
  Browser → /payment/success?transaction_id=… → GET /api/payments/verify/:id
    PAID    → clear cart + draft → /order/:id/confirmation
    PENDING → poll (5×3s) then show "processing" message
    FAILED  → /payment/failure (Try Again reuses the SAME order)
```

## 5. Key files

- **Server libs:** `lib/env.ts`, `lib/paymob/{client,hmac,hmacCore,types,constants}.ts`,
  `lib/checkout/{calculations,validation,coupons,orderHelpers,rateLimit,constants}.ts`
- **API:** `app/api/checkout/{validate-coupon,create-order}/route.ts`,
  `app/api/payments/{initiate,verify/[transactionId]}/route.ts`,
  `app/api/webhooks/paymob/route.ts`, `app/api/orders/[id]/route.ts` (GET/PUT added)
- **State:** `store/checkoutStore.tsx`, `hooks/useCheckout.ts`, `hooks/usePaymob.ts`
- **UI:** `components/checkout/*`, `components/order/*`, `app/checkout`,
  `app/payment/{success,failure}`, `app/order/[orderId]/confirmation`

## 6. Tests

```bash
npm run test:checkout   # pure-function tests: money math + HMAC verification
```

## 7. Known limitations / TODO

- **In-memory caches** (Paymob auth token in `lib/paymob/client.ts`, rate limiter
  in `lib/checkout/rateLimit.ts`) are per-process — replace with Redis for
  multi-instance / serverless deployments.
- **Email confirmations** are not sent — see the `TODO` in the webhook handler
  where the order is marked `PAID`.
- **Inventory decrement** is not implemented — the static catalogue has no stock
  field; see the `TODO` in `create-order`.
- **Apple Pay** result handling listens for the iframe `postMessage`; the exact
  payload shape should be confirmed against your Paymob Apple Pay integration.
- Order items snapshot the catalogue (`productId` left null) because storefront
  products are served statically from `data/products.ts`, not the DB.
```
