import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * Feel free to modify this pattern to include more paths.
		 */
		'/((?!_next/static|_next/image|favicon.ico|auth|faq|tos|privacy| ).*)',
	],
};

const PUBLIC_FILE = /\.(.*)$/; // Files

export async function middleware(request: NextRequest) {
    const { supabase, response } = createClient(request);

	await supabase.auth.getSession();

	// Clone the URL
	const url = request.nextUrl.clone();

	// Skip public files
	if (PUBLIC_FILE.test(url.pathname) || url.pathname.includes('_next')) return;

	console.log(request.nextUrl.pathname);

	const host = request.headers.get('host');
	const subdomain = getValidSubdomain(request.nextUrl.pathname, host);

	if (subdomain)
	{
		// Subdomain available, rewriting
		console.log(`>>> Rewriting: ${url.pathname} to /${subdomain}${url.pathname}`);
		url.pathname = `/${subdomain}${url.pathname}`;
	}

	return NextResponse.rewrite(url);
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
		const candidate = host.split('.')[0];
		if (candidate && !candidate.includes('localhost'))
		{
			// Valid candidate
			subdomain = candidate;
		}
	}

	return subdomain;
};