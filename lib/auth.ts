
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "***";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  const s = process.env.ADMIN_PASSWORD || "";
  if (!s) throw new Error("ADMIN_PASSWORD not set");
  return s;
}

function token(): string {
  return createHmac("sha256", secret()).update("familyhome-admin").digest("hex");
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const c = store.get(COOKIE);
  if (!c) return false;
  const expected = Buffer.from(token());
  const got = Buffer.from(c.value);
  return got.length === expected.length && timingSafeEqual(got, expected);
}

export async function login(password: string): Promise<boolean> {
  const expected = Buffer.from(secret());
  const got = Buffer.from(password);
  if (got.length !== expected.length || !timingSafeEqual(got, expected)) return false;
  const store = await cookies();
  store.set(COOKIE, token(), { httpOnly: true, sameSite: "lax", maxAge: MAX_AGE, path: "/" });
  return true;
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
