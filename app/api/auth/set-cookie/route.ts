import { NextResponse } from 'next/server';

const COOKIE_NAME = 'firebaseToken';
const MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    console.log('[set-cookie] Received token:', token);
    if (!token) {
      console.error('[set-cookie] No token provided');
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: MAX_AGE,
      sameSite: 'lax',
    });
    return response;
  } catch (error) {
    console.error('[set-cookie] Error:', error);
    return NextResponse.json({ error: 'Failed to set cookie', details: error instanceof Error ? error.message : error }, { status: 500 });
  }
} 