-- Add Cash on Delivery (COD) as a payment method.
--
-- The orders table already stores the payment method in the "paymentMethod"
-- column (an enum of type "PaymentMethod"). This migration only needs to add
-- the new 'COD' value to that enum — no column change is required.
--
-- NOTE: ALTER TYPE ... ADD VALUE cannot run inside a transaction block on older
-- PostgreSQL. Run with autocommit (psql default / the Supabase SQL editor), or
-- just use `npm run db:push` from /backend, which handles enum changes for you.
--
-- Apply with:
--   psql "$DATABASE_URL" -f prisma/sql/2026_add_cod_payment_method.sql

ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'COD';
