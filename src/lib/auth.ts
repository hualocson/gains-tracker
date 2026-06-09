const PAYLOAD = "gains-tracker-authed-v1";

async function hmac(secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(PAYLOAD),
  );
  // edge-runtime safe hex encoding (no Node Buffer in middleware)
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function makeSessionToken(secret: string): Promise<string> {
  return hmac(secret);
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string,
): Promise<boolean> {
  if (!token) return false;
  const expected = await hmac(secret);
  return token.length === expected.length && token === expected;
}

export const SESSION_COOKIE = "gt_session";
