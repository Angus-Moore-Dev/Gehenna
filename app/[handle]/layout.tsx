
export const dynamic = 'force-dynamic';

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return <div className='w-full min-h-screen flex flex-col'>
        {children}
    </div>
}