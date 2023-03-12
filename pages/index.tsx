import AppNavbar from '@/components/AppNavbar';
import Head from 'next/head';
import Image from 'next/image';
import { useCallback, useEffect, useRef } from 'react';

export default function HomePage()
{
	const audioRef = useRef<HTMLAudioElement>(null);
	useEffect(() => {
		audioRef.current?.click();
		audioRef.current?.play();
	}, []);

	return (
		<div className="w-full h-full flex flex-col items-center justify-center">
			<Head>
				<title>Jensen Labs Template</title>
			</Head>
			<Image src='https://media.tenor.com/UeTh6kTjoP0AAAAd/topg-andrew.gif' width='400' height='500' alt='Mr Producer' className='rounded-lg pb-2' />
			<audio id="player" autoPlay controls loop className='w-[400px]'>
				<source src="mr_producer.mp3" type="audio/mp3" />
			</audio>
			<p className="text-2xl font-semibold">Jensen Labs Template Repository.</p>
			<br />
			<span>
				Please ensure that you have Supabase setup with the given NEXT_PUBLIC_SUPABASE_PUBLIC_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY inside the Jensen Labs Doppler, under the given project.
				<br />
				Then configure the .env.local and storage buckets with whatever you need.
			</span>
			<small>If not, ensure you have that setup in the environment variables before building.</small>
			<small>Otherwise, have a fucking sook if something doesn't work. 🤓</small>
			<br />
			<span>
				The following libraries are pre-installed:
				<ol>
					<li>"@emotion/react": "^11.10.5",</li>
					<li>"@emotion/styled": "^11.10.5",</li>
					<li>"@mui/icons-material": "^5.11.0",</li>
					<li>"@mui/material": "^5.11.8",</li>
					<li>"@next/font": "13.1.6",</li>
					<li>"@supabase/auth-helpers-nextjs": "^0.5.4",</li>
					<li>"@supabase/auth-helpers-react": "^0.3.1",</li>
					<li>"@supabase/supabase-js": "^2.10.0",</li>
				</ol>
			</span>
			<span className='text-center mt-4'>
				We also use Doppler, read the docs <a href='https://docs.doppler.com/docs/install-cli' target='_blank' className='text-blue-500 hover:text-blue-600'>here</a> to get started. 
				<br />
				It's to ensure that environment variables are never in the configs or in the repository ever. Every developer is required to have it.
			</span>
		</div>
	)
}