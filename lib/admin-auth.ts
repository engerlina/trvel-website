import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_API_KEY || 'fallback-secret-change-me'
);

export interface AdminSession {
  username: string;
  exp: number;
}

export async function verifyCredentials(
  username: string,
  password: string
): Promise<boolean> {
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    console.error('Admin credentials not configured');
    return false;
  }
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export async function createSession(username: string): Promise<string> {
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
  return token;
}

export async function verifySession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}
