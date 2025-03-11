
export const dynamic = 'force-dynamic';
import HandleFooter from '@/components/HandleFooter';
import HandleNavbar from '@/components/HandleNavbar';
import { createServerClient } from '@/utils/supabase/server';
import '@mantine/tiptap/styles.css';
import { redirect } from 'next/navigation';

export default async function RootLayout({
	children,
	params
}: {
	children: React.ReactNode,
	params: Promise<{ handle: string }>
}) {
	
	const supabase = createServerClient();
	const profile = (await supabase.from('profiles').select('*').eq('handle', (await params).handle).single()).data;

	if (!profile)
		redirect('/404');

	return <div className='w-full min-h-screen flex flex-col'>
		<HandleNavbar profile={profile} />
		<div className='flex flex-col'>
			{children}
		</div>
    </div>
}
