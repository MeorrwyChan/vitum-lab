-- Never auto-cancel an order whose card may already be captured.
--
-- Square charges synchronously (no webhook). Two branches leave a *pending*
-- order behind while Square may already hold the customer's money:
--   1. the capture succeeds but confirm_order_paid raises (e.g. insufficient_stock
--      when a concurrent order took the last unit), and
--   2. the fetch to Square throws (timeout / socket reset) AFTER Square received
--      and captured the payment — indistinguishable, from our side, from a
--      payment that never happened.
-- Both used to stay `status='pending', payment_method='square'`, which is exactly
-- what the 24h expiry sweep matches. It would cancel the order and email the
-- customer "No payment was collected for this order." while Square held the funds.
--
-- payment_captured_at marks "a processor may hold funds for this order — a human
-- must reconcile it". Auto-expiry skips those rows; they stay pending until an
-- admin confirms (Mark Paid) or cancels + refunds them.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_captured_at timestamptz;

COMMENT ON COLUMN public.orders.payment_captured_at IS
  'Set when a processor capture is known or suspected but the order is not yet confirmed. Excludes the row from auto-expiry; requires manual reconciliation.';

-- Partial index: the expiry sweep runs hourly and only cares about pending rows.
CREATE INDEX IF NOT EXISTS orders_pending_uncaptured_idx
  ON public.orders (created_at)
  WHERE status = 'pending' AND payment_captured_at IS NULL;

CREATE OR REPLACE FUNCTION public.expire_stale_orders()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  UPDATE public.orders
     SET status = 'cancelled',
         cancelled_at = now(),
         cancel_reason = 'auto-expired: payment not received in time'
   WHERE status = 'pending'
     -- Money may be sitting at the processor — never auto-cancel these.
     AND payment_captured_at IS NULL
     AND (
       (coalesce(payment_method, 'crypto') IN ('crypto','square') AND created_at < now() - interval '24 hours')
       OR
       (payment_method IN ('zelle','cashapp','venmo','ach') AND created_at < now() - interval '4 days')
     );
$$;

REVOKE EXECUTE ON FUNCTION public.expire_stale_orders() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expire_stale_orders() TO service_role;
