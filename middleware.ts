import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from './utils/supabase/server';

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

export async function middleware(request: NextRequest)
{
	// const response = NextResponse.next();
    const supabase = createServerClient();

	const { data: { session }} = await supabase.auth.getSession();

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

	// Grab the cookie out and set the domain to be .domain name. If it's localhost, just set it to localhost
	let cookie = request.headers.get('cookie') as string;
	// Modify the domain to be .domain name. If it's localhost, just set it to localhost
	const domain = host?.includes('localhost') ? 'localhost' : host?.split(':')[0];
	// Now we make the change
	cookie = cookie?.replace(/Domain=localhost/i, `Domain=.${domain}`);



	// Set the cookie
	if (cookie)
	{
		request.headers.set('cookie', cookie);
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
		console.log('host::', host);
		const candidate = host.split('.')[0];
		if (candidate && !candidate.includes('localhost') && candidate !== 'www')
		{
			// Valid candidate
			subdomain = candidate;
		}
	}

	return subdomain;
};