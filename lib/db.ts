import { createClient } from "@supabase/supabase-js";
import { connection } from "next/server";

// Server-only: the secret key bypasses RLS. Never prefix these env vars with NEXT_PUBLIC_.
// Awaits connection() so stock is always read at request time, never prerendered at build.
export async function db() {
  await connection();
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local");
  return createClient(url, key, { auth: { persistSession: false } });
}
