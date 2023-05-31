import '@/styles/globals.css'
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import Head from 'next/head';
import { ToastContainer } from 'react-toastify';
import { Loader, MantineProvider } from '@mantine/core';
import { virginDb } from '@/lib/db';
import 'react-toastify/dist/ReactToastify.css';
import Footer from '@/components/Footer';
import { Router } from 'next/router';
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }: AppProps) {
	const [supabaseClient] = useState(() => virginDb);
	const [loading, setLoading] = useState(false);

	useEffect(() => 
	{
		const start = (url: string) => {
			setLoading(true);
		};
		const end = (url: string) => {
			setLoading(false);
		};
		Router.events.on("routeChangeStart", start);
		Router.events.on("routeChangeComplete", end);
		Router.events.on("routeChangeError", end);

		window.onbeforeunload = function() {
			// Currently sessionStorage is only being used for Blob URL caching, so it's safe to use this to revoke URLs
			sessionStorage.clear();
		}

		return () => {
			Router.events.off("routeChangeStart", start);
			Router.events.off("routeChangeComplete", end);
			Router.events.off("routeChangeError", end);
		};
	}, []);

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
				<div className='w-screen min-h-screen flex flex-col'>
					<Analytics />
					<Head>
						<title>Gehenna - Learn, Grow.</title>
						<link href='/favicon.png' rel='icon' />
					</Head>
					<div className='flex-grow flex flex-col'>
						{
							loading &&
							<div className='w-screen h-screen flex items-center justify-center'>
								<Loader />
							</div>
						}
						{
							!loading &&
							<Component {...pageProps} />
						}
						<Footer />
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
				</div>
			</MantineProvider>
		</SessionContextProvider>
	)
}
