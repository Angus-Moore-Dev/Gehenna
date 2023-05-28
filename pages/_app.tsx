import '@/styles/globals.css'
import type { AppProps } from 'next/app';
import { useState } from 'react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import Head from 'next/head';
import { ToastContainer } from 'react-toastify';
import { MantineProvider } from '@mantine/core';
import { virginDb } from '@/lib/db';
import 'react-toastify/dist/ReactToastify.css';
import Footer from '@/components/Footer';

export default function App({ Component, pageProps }: AppProps) {
	const [supabaseClient] = useState(() => virginDb);
	const { user } = pageProps;

	return (
		<SessionContextProvider
		supabaseClient={supabaseClient}
		initialSession={pageProps.initialSession}
		>
			<MantineProvider withGlobalStyles withNormalizeCSS 
			theme={{
				colorScheme: 'dark',
				focusRing: 'never', 
				primaryColor: 'yellow',
			}}>
				<div className='w-screen h-screen flex flex-col'>
					<Head>
						<title>Gehenna - Learn, Grow.</title>
						<link href='/favicon.png' rel='icon' />
						<meta name='viewport' content='initial-scale=1.0, width=device-width' />
						<meta name="description" content="Gehenna is a place for people to document their journeys and share their experiences." />
					</Head>
					<div className='flex-grow'>
						<Component {...pageProps} />
					</div>
					<ToastContainer
						position="top-center"
						autoClose={3000}
						hideProgressBar={false}
						newestOnTop={false}
						closeOnClick
						rtl={false}
						pauseOnFocusLoss
						pauseOnHover
						theme="dark"
					/>
					<Footer />
				</div>
			</MantineProvider>
		</SessionContextProvider>
	)
}
