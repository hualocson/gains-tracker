import { describe, it, expect } from "vitest";
import { makeSessionToken, verifySessionToken } from "@/lib/auth";

describe("auth helpers", () => {
  it("verifies a token it just made", async () => {
    const t = await makeSessionToken("secret-a");
    expect(await verifySessionToken(t, "secret-a")).toBe(true);
  });
  it("rejects a token signed with a different secret", async () => {
    const t = await makeSessionToken("secret-a");
    expect(await verifySessionToken(t, "secret-b")).toBe(false);
  });
  it("rejects an undefined token", async () => {
    expect(await verifySessionToken(undefined, "secret-a")).toBe(false);
  });
});
