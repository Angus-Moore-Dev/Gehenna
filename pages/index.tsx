import NewPostBox from '@/components/NewPostBox';
import PostPreviewBox from '@/components/PostPreviewBox';
import SignInForm from '@/components/SignInForm';
import SignUpModal from '@/components/SignUpModal';
import { clientDb, serverDb } from '@/lib/db';
import { Post } from '@/models/Post';
import { Profile } from '@/models/Profile';
import { Box, Button, TextInput } from '@mantine/core';
import { User } from '@supabase/auth-helpers-nextjs';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface HomePageProps
{
	user: User;
	profile: Profile;
}

export default function HomePage({ user, profile }: HomePageProps)
{
	const [posts, setPosts] = useState<Post[]>();

	useEffect(() => {
		// We do client side fetching to improve first time load and also to make sure that the user is logged in.
		clientDb.from('post').select('*').limit(25).order('createdAt', { ascending: true }).then(async res => {
			if (!res.error && res.data)
			{
				setPosts(res.data as Post[]);
			}
			else if (res.error)
			{
				toast.error(res.error.message);
			}
		})

		clientDb.channel('new_posts').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post' }, (payload) => {
			// We set the new post as the first post because it's the newest.
			setPosts((prev) => [payload.new, ...prev ?? []] as Post[]);
		}).subscribe();
	}, []);

	return (
		<div className="w-full h-full flex flex-col gap-4 max-w-6xl mx-auto py-16">
			<Head>
				<title>Gehenna - Learn, Grow.</title>
			</Head>
			{
				!user && 
				<SignInForm />
			}
			{
				user && profile && !profile.emailVerified &&
				<div className='w-full h-full flex items-center justify-center flex-col gap-4'>
					<Image src='/logo.png' width={500} height={450} className='w-1/3 mb-10' alt='Gehenna' />
					<span className='text-2xl font-bold'>Please verify your email address before you can gain access to Gehenna.</span>
					<span>Please check your inbox (or spam) for an email with a link to confirm <b>{user.email}</b></span>
				</div>
			}
			{
				user && profile && profile.emailVerified &&
				<div className='w-full h-full flex flex-col items-center gap-10'>
					<Image src='/logo.png' width={500} height={450} className='w-1/3' alt='Gehenna' />
					<Link href='/profile' className='w-full max-w-3xl flex flex-col items-center gap-4 underline text-blue-600 transition hover:text-blue-500'>
						View My Profile
					</Link>
					{/* The user can make new posts here. */}
					<NewPostBox user={user} />
					{/* The user can see their posts here. */}
					<div className='w-full h-full flex flex-col items-center gap-4'>
						{
							posts &&
							posts.length === 0 &&
							<div className='w-full h-full flex flex-col items-center gap-4'>
								<h1 className='text-2xl font-bold'>There are no recent posts...</h1>
							</div>
						}
						{
							posts && posts.length > 0 &&
							<>
							<span className='w-full max-w-3xl font-semibold text-lg'>Latest Threads</span>
							{
								posts.map((post, index) => <PostPreviewBox key={index} post={post} />)
							}
							</>
						}
					</div>
				</div>
			}
		</div>
	)
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => 
{
	const db = serverDb(context);
	const user = (await db.auth.getUser()).data.user;

	if (user)
	{
		// Get the profile.
		const profile = (await db.from('profiles').select('*').eq('id', user.id).single()).data as Profile;
		console.log(profile);
		return {
			props: {
				user: user,
				profile: profile
			}
		}
	}

	return {
		props: {
			user: user
		}
	}
}