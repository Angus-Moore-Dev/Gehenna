'use server';

import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";


export async function getSupabaseCookie(): Promise<RequestCookie | undefined>
{
    const cookieName = 'sb-fdiavyxctdwgbvoawijj-auth-token'; // Hardcoded for now
    const cookieStore = await cookies();
	const supabaseCookie = cookieStore.get(cookieName);

    return supabaseCookie;
}