import { getSupabaseCookie } from '@/utils/subdomainCookie';
import { createApiClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request)
{
	// The `/auth/callback` route is required for the server-side auth flow implemented
	// by the Auth Helpers package. It exchanges an auth code for the user's session.
	// https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-sign-in-with-code-exchange
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get('code');
	const firstName = requestUrl.searchParams.get('firstName');
	const lastName = requestUrl.searchParams.get('lastName');
	const handle = requestUrl.searchParams.get('handle');

	const supabase = createApiClient();

	if (code)
	{
		await supabase.auth.exchangeCodeForSession(code);
	}
	const user = (await supabase.auth.getUser()).data.user;

	if (firstName && handle && user)
	{
		const { error } = await supabase
		.from('profiles')
		.insert({
			id: user.id,
			handle,
			name: `${firstName}` + lastName ? ` ${lastName}` : '',
		})
	}

	const response = NextResponse.redirect(requestUrl.origin);
	const supabaseCookie = await getSupabaseCookie();
	response.cookies.set(supabaseCookie?.name || '', supabaseCookie?.value || '', {
		domain: process.env.NODE_ENV === 'development' ? '.localhost:3000' : '.gehenna.app',
		path: '/',
		sameSite: 'lax',
		secure: false,
	});

	// URL to redirect to after sign in process completes
	return response;
}
