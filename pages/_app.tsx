import '@/styles/globals.css'
import type { AppProps } from 'next/app';
import AppFooter from '@/components/AppFooter';
import { useState } from 'react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import Head from 'next/head';
import { ToastContainer } from 'react-toastify';
import { MantineProvider } from '@mantine/core';
import { virginDb } from '@/lib/db';

export default function App({ Component, pageProps }: AppProps) {
	const [supabaseClient] = useState(() => virginDb);
	const { user } = pageProps;
	return (
		<SessionContextProvider
		supabaseClient={supabaseClient}
		initialSession={pageProps.initialSession}
		>
			<MantineProvider theme={{ colorScheme: 'dark' }} withGlobalStyles withNormalizeCSS>
				<div className='w-screen h-screen flex flex-col'>
					<Head>
						<link href='/favicon.png' rel='icon' />
					</Head>
					<div className='flex-grow'>
						<Component {...pageProps} />
					</div>
					<AppFooter />
					<ToastContainer
						position="top-right"
						autoClose={1500}
						hideProgressBar={false}
						newestOnTop={false}
						closeOnClick
						rtl={false}
						pauseOnFocusLoss
						pauseOnHover
						theme="dark"
					/>
				</div>
			</MantineProvider>
		</SessionContextProvider>
	)
}
