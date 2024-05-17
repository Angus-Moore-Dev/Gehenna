import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from './utils/supabase/server';
// import { getSupabaseCookie } from './utils/subdomainCookie';

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * Feel free to modify this pattern to include more paths.
		 */
		'/((?!_next/static|_next/image|favicon.ico|faq|auth|tos|privacy| ).*)',
	],
};

export async function middleware(request: NextRequest)
{

	const supabase = createServerClient();

	const { data: { user }} = await supabase.auth.getUser();

	return NextResponse.next();
}