import { Database } from "@/utils/database.types";
import { createApiClient } from "@/utils/supabase/server";
import { CookieOptions, createServerClient } from "@supabase/ssr";
// import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// const createServerSupabase = () => {
// 	const cookieStore = cookies();
// 	return createServerClient<Database>(
// 		process.env.NEXT_PUBLIC_SUPABASE_URL!,
// 		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
// 		{
// 			cookies: {
// 				get(name: string) {
// 					return cookieStore.get(name)?.value
// 				},
// 				set(name: string, value: string, options: CookieOptions) {
// 					try {
// 						cookieStore.set({ name, value, ...options })
// 					} catch (error) {
// 						// The `set` method was called from a Server Component.
// 						// This can be ignored if you have middleware refreshing
// 						// user sessions.
// 					}
// 				},
// 				remove(name: string, options: CookieOptions) {
// 					try {
// 						cookieStore.set({ name, value: '', ...options })
// 					} catch (error) {
// 						// The `delete` method was called from a Server Component.
// 						// This can be ignored if you have middleware refreshing
// 						// user sessions.
// 					}
// 				},
// 			},
// 		}
// 	)
// }

export async function POST(request: NextRequest)
{
    const { email, password, mode } = await request.json() as { email: string, password: string, mode: 'signIn' | 'code' };

    if (!email || !password || !mode)
        return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });

    // const supabase = createApiClient();
    const supabase = createApiClient();
    
    const { data: { session }} = await supabase.auth.getSession();

    if (session)
        return NextResponse.json(session);

    const { data: { session: newSession }, error } = mode === 'signIn' ? await supabase.auth.signInWithPassword({ email, password })
    : await supabase.auth.verifyOtp({ type: 'email', email, token: password });

    console.log('Result of sign in for user::', email, newSession, error);

    if (newSession)
        return NextResponse.json(newSession);
    else
        return NextResponse.json({ error: error?.message }, { status: 400 });
}


