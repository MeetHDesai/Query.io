import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { admin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

const isProd = process.env.NODE_ENV === 'production';
const COOKIE_NAME = 'qid';
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export async function POST(req: Request) {
  try {
    const { idToken, firstName, lastName } = await req.json();
    if (!idToken) return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (!decoded?.uid) throw new Error('Invalid token');

    // Upsert user in Supabase (include all required fields)
    const { data, error } = await supabaseAdmin
      .from("users")
      .upsert({ firebaseUid: decoded.uid, email: decoded.email, firstName, lastName })
      .single();
    console.log("User upsert:", { data, error });
    if (error) return NextResponse.json({ error }, { status: 500 });

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: COOKIE_NAME,
      value: idToken,
      httpOnly: true,
      path: '/',
      secure: isProd,
      maxAge: MAX_AGE,
      sameSite: 'lax',
    });
    return response;
  } catch (e) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  response.cookies.set({
    name: 'firebaseToken',
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  return response;
}
