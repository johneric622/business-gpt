import { getDb } from "./db";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createSession(userId: string): Promise<string> {
  const sql = getDb();
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  await sql`INSERT INTO sessions (user_id, token, expires_at) VALUES (${userId}, ${token}, ${expiresAt.toISOString()})`;
  return token;
}

export async function getSessionUser(): Promise<{
  id: string;
  email: string;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return null;

  const sql = getDb();
  const rows =
    await sql`SELECT u.id, u.email FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ${token} AND s.expires_at > NOW()`;

  if (rows.length === 0) return null;
  return { id: rows[0].id, email: rows[0].email };
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return;

  const sql = getDb();
  await sql`DELETE FROM sessions WHERE token = ${token}`;
  cookieStore.delete("session_token");
}
