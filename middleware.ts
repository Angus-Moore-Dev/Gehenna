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
		'/((?!_next/static|_next/image|favicon.ico|faq|auth|tos|privacy|404| ).*)',
	],
};

const PUBLIC_FILE = /\.(.*)$/; // Files

export async function middleware(request: NextRequest)
{

	const supabase = createServerClient();

	const { data: { user }} = await supabase.auth.getUser();

	// const supabaseCookie = getSupabaseCookie();
	// response.cookies.set(cookieName, supabaseCookie?.value || '', {
	// 	domain: process.env.NODE_ENV === 'development' ? '.localhost:3000' : '.gehenna.app',
	// 	path: '/',
	// 	sameSite: 'lax',
	// 	secure: false,
	// });

	return NextResponse.next();
}

export const getValidSubdomain = (pathname: string, host?: string | null) => 
{
	let subdomain: string | null = null;
	if (!host && typeof window !== 'undefined')
	{
		// On client side, get the host from window
		host = window.location.host;
	}

	if (host && host.includes('.'))
	{
		console.log('host::', host);
		const candidate = host.split('.')[0];
		if (candidate && !candidate.includes('localhost') && candidate !== 'www' && candidate !== 'dev')
		{
			// Valid candidate
			subdomain = candidate;
		}
	}

	return subdomain;
};