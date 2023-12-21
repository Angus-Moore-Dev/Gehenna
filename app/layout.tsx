import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import { Notifications } from '@mantine/notifications';

import './globals.css';
import '@mantine/core/styles.css';
// import '@mantine/tiptap/styles.css';
import '@mantine/notifications/styles.css';

import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import HandleFooter from '@/components/HandleFooter';
const inter = Open_Sans({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
	title: 'Gehenna',
	description: 'Voice of the damned.',
	icons: {
		icon: '/favicon.ico'
	}
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en" data-mantine-color-scheme="dark">
			<head>
				<ColorSchemeScript color='green' forceColorScheme='dark' defaultColorScheme='dark' />
			</head>
			<body className={`${inter.className} min-h-screen flex flex-col items-center break-words`}>
				<MantineProvider defaultColorScheme='dark' theme={{ primaryColor: 'green' }} >
					{children}
					<Notifications />
				</MantineProvider>
			</body>
		</html>
	)
}
