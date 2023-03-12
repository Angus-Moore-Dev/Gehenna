import '@/styles/globals.css'
import type { AppProps } from 'next/app';
import AppNavbar from '@/components/AppNavbar';
import AppFooter from '@/components/AppFooter';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { useState } from 'react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

export default function App({ Component, pageProps }: AppProps) {
	const [supabaseClient] = useState(() => createBrowserSupabaseClient())
	const { user } = pageProps;
	return (
		<SessionContextProvider
		supabaseClient={supabaseClient}
		initialSession={pageProps.initialSession}
		>
			<div className='w-screen h-screen flex flex-col'>
				<AppNavbar user={user} />
				<div className='flex-grow'>
					<Component {...pageProps} />
				</div>
				<AppFooter />
			</div>
		</SessionContextProvider>
	)
}
