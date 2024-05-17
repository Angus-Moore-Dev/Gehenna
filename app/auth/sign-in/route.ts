import { getSupabaseCookie } from "@/utils/subdomainCookie";
import { createApiClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest)
{
    const { email, password, mode } = await request.json() as { email: string, password: string, mode: 'signIn' | 'code' };

    if (!email || !password || !mode)
        return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });

    const supabase = createApiClient();
    
    const { data: { session }} = await supabase.auth.getSession();

    if (session)
        return NextResponse.json(session);

    const { data: { session: newSession }, error } = mode === 'signIn' ? await supabase.auth.signInWithPassword({ email, password })
    : await supabase.auth.verifyOtp({ type: 'email', email, token: password });

    console.log('Result of sign in for user::', email, newSession, error);

    if (!newSession)
        return NextResponse.json({ error: error?.message }, { status: 400 });

    const response = NextResponse.json(newSession);
    const supabaseCookie = await getSupabaseCookie();
	response.cookies.set(supabaseCookie?.name || '', supabaseCookie?.value || '', {
		domain: process.env.NODE_ENV === 'development' ? '.localhost:3000' : '.gehenna.app',
		path: '/',
		sameSite: 'lax',
		secure: false,
	});

    return response;
}


