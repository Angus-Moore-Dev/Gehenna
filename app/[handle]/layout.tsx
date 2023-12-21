import HandleNavbar from '@/components/HandleNavbar';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
	title: 'Gehenna',
	description: 'Voice of the damned.',
	icons: {
		icon: '/favicon.ico'
	}
}

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return <div className='w-full min-h-screen flex flex-col'>
        {children}
    </div>
}
