import { supabaseAdmin } from "./supabase-admin.js";
import { promoRedemptionCount } from "./pricing.js";

const PAGE = 1000;

/**
 * How many times `email` has already redeemed `code` on a paid order.
 *
 * The naive form of this — one un-ranged `.select()` piped into
 * promoRedemptionCount — silently tops out at PostgREST's 1000-row default. Once
 * a promo passes 1000 paid orders the server returns an arbitrary 1000-row
 * subset, so a customer's prior redemption can fall outside the page and the
 * per-customer cap reads as unused. (The atomic reserve_discount_redemption RPC
 * still enforces the real cap at checkout, so this only ever surfaced as a
 * discount shown in the summary and then withdrawn at the pay button — but the
 * count itself was wrong.)
 *
 * Pages to completion with a stable ORDER BY, matching the paging discipline the
 * admin aggregates already use. Filtering is left to promoRedemptionCount so the
 * email/code comparison stays case-insensitive without pushing user-supplied
 * text into a PostgREST ILIKE pattern (`_` and `%` are wildcards there, and both
 * are legal in an email local-part).
 */
export async function countPromoRedemptions(email: string, code: string, since: string | null | undefined): Promise<number> {
  let total = 0;
  for (let from = 0; ; from += PAGE) {
    const { data: batch } = await supabaseAdmin
      .from("orders")
      .select("email, discount_code")
      .ilike("discount_code", code)
      .in("status", ["confirmed", "finished"])
      .gte("created_at", since ?? "1970-01-01T00:00:00Z")
      // Postgres gives no ordering guarantee across ranged reads — without a
      // stable sort a paged loop can skip or double-count rows past page 1.
      .order("created_at", { ascending: true })
      .range(from, from + PAGE - 1);
    total += promoRedemptionCount(batch ?? [], email, code);
    if (!batch || batch.length < PAGE) break;
  }
  return total;
}
