/*
 * consent.ts — the one reader of the cookie banner's stored choice.
 *
 * CookieConsent writes "accepted" | "declined" here and nothing consumed it, so
 * the banner's Decline button was inert while analytics loaded regardless.
 */

export const CONSENT_KEY = "vitum_cookie_consent";

/** False only when the visitor explicitly declined. Unset = not yet chosen. */
export function analyticsAllowed(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) !== "declined";
  } catch {
    // Private mode / blocked storage — behave as if no choice was recorded.
    return true;
  }
}
