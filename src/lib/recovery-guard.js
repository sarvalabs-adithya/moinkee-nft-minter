/**
 * Recovery guard. The recovery, snapshot and reload routes read every pin on
 * the Pinata account and, for reload, mint from the admin wallet. They are
 * meant to be run from your own machine after a devnet reset, never left open
 * on a public deployment. They answer only when RECOVERY_SECRET is set and
 * the request carries the same value in the x-recovery-secret header.
 */
export function recoveryAllowed(request) {
  const secret = process.env.RECOVERY_SECRET || "";
  if (!secret) return false;
  const given = request?.headers?.get?.("x-recovery-secret") || "";
  return given.length === secret.length && given === secret;
}

export function recoveryRefused() {
  return Response.json(
    { error: "Recovery routes are disabled. Set RECOVERY_SECRET and send it in the x-recovery-secret header." },
    { status: 404 }
  );
}
