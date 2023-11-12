import PostPreviewBox from '@/components/PostPreviewBox';
import { clientDb, serverDb } from '@/lib/db';
import { Post } from '@/models/Post';
import { Profile } from '@/models/Profile';
import { Autocomplete, Chip, Loader } from '@mantine/core';
import { User } from '@supabase/auth-helpers-nextjs';
import { GetServerSidePropsContext, GetStaticProps, GetStaticPropsContext } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useRouter } from 'next/router';
import NewPostModal from '@/components/NewPostModal';
import { Gehenna } from '@/components/Gehenna';
import SignInModal from '@/components/SignInModal';
import DraftPosts from '@/components/DraftPosts';
import { useUser } from '@supabase/auth-helpers-react';
import { createClient } from '@supabase/supabase-js';

interface HomePageProps
{
	posts: Post[]
}

export default function HomePage({ posts }: HomePageProps)
{
	const user = useUser();
	const ref = useRef<HTMLDivElement>(null);

	const [profile, setProfile] = useState<Profile>();

	const [autocompletePosts, setAutocompletePosts] = useState<{ id: string, title: string, tags: string[], userId: string, username: string, avatar: string }[]>([]);
	const [globalSearchkeywords, setGlobalSearchkeywords] = useState('');

	useEffect(() => {
		if (user)
		{
			clientDb.from('profiles').select('*').eq('id', user.id).single().then(res => {
				if (!res.error && res.data)
				{
					setProfile(res.data as Profile);
				}
				else
				{
					toast.error('Failed to get your profile. Please try again later.');
				}
			});
		}
	}, [user]);

	useEffect(() => {
		if (globalSearchkeywords)
		{
			if (autocompletePosts.length === 0)
				setAutocompletePosts([{ id: 'LOADING', title: 'Loading...', tags: [], userId: '', username: '', avatar: '' }]);
			
			clientDb.from('post').select(`id, title, tags, userId`).ilike('title', `%${globalSearchkeywords}%`).limit(50).then(async res => {
				if (!res.error && res.data)
				{
					// To anyone that knows RPC or PostgREST, I am sorry. I tried getting the inner join working but kept getting 400 status codes... :'(
					const profiles = (await clientDb.from('profiles').select('id, username, avatar').in('id', res.data.map(x => x.userId))).data as { id: string, username: string, avatar: string }[];
					// We have results
					const autoCompleteResults = res.data as { id: string, title: string, tags: string[], userId: string, username: string, avatar: string }[];

					// Attach the username and avatar to this post.
					autoCompleteResults.forEach(post => {
						const profile = profiles.find(x => x.id === post.userId);
						if (profile)
						{
							post.username = profile.username;
							post.avatar = profile.avatar;
						}
					});

					setAutocompletePosts(autoCompleteResults);
				}
				else
				{
					setAutocompletePosts([]);
				}
			});
		}
		else
		{
			setAutocompletePosts([]);
		}
	}, [globalSearchkeywords]);

	return (
		<div ref={ref} className="flex-grow flex flex-col gap-4 mx-auto py-8">
			<Head>
				<title>Gehenna - Learn, Grow.</title>
				<link href='/favicon.png' rel='icon' />
				<meta name='viewport' content='initial-scale=1.0, width=device-width' />
				<meta name="description" content="A place of thoughts and ideas." />
				<meta property="og:url" content="https://www.gehenna.dev" />
				<meta property="og:type" content="website" />
				<meta property="og:title" content="Gehenna - Learn, Grow." />
				<meta property="og:description" content="A place of thoughts and ideas." />
				<meta property="og:image" content="https://www.gehenna.dev/favicon.png" />

				<meta name="twitter:card" content="summary_large_image" />
				<meta property="twitter:domain" content="gehenna.dev" />
				<meta property="twitter:url" content="https://www.gehenna.dev" />
				<meta name="twitter:title" content="Gehenna - Learn, Grow." />
				<meta name="twitter:description" content="A place of thoughts and ideas." />
				<meta name="twitter:image" content="https://www.gehenna.dev/favicon.png" />
			</Head>
			{
				user && profile && !profile.emailVerified &&
				<div className='w-full h-full flex items-center justify-center flex-col gap-4 -mt-16 mb-4 bg-primary-light'>
					<span className='mx-auto text-white font-semibold py-2'>Please verify your email to post and comment!</span>
				</div>
			}
			<div className='w-full h-full flex flex-col items-center gap-6'>
				{
					profile &&
					<Gehenna />
				}
				{
					!profile &&
					<SignInModal />
				}
				{
					profile && 
					<>
					<Link href={`/profile/${profile.handle}`} className='flex flex-col mx-auto gap-2 items-center transition p-2 hover:bg-primary-light text-white rounded-md'>
						<Image src={profile.avatar} alt='me' width={100} height={100} className='w-[100px] h-[100px] object-cover rounded-md' />
						<span className='font-semibold'>{profile.username}</span>
					</Link>
					</>
				}
				<section className='w-full flex flex-row justify-center items-center'>
					<Autocomplete 
						icon={<svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-search" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
							<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
							<path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path>
							<path d="M21 21l-6 -6"></path>
						</svg>}
						itemComponent={({ id, value, tags, username, avatar }) => <div>
							{
								id === 'LOADING' &&
								<div className='flex items-center justify-center p-4'>
									<Loader color='yellow' />
								</div>
							}
							{
								id !== 'LOADING' &&
								<Link href={`/${id}`} className='flex flex-col justify-center gap-2 py-2 px-4 font-medium transition hover:bg-primary-light hover:text-secondary rounded-md group'>
									<span>{value}</span>
									<div className='flex flex-row gap-2 items-end'>
										<div className='w-3/4 flex flex-row flex-wrap gap-1'>
										{
											tags.map((tag: string) => <Chip>{tag}</Chip>)
										}
										</div>
										<div className='px-2 flex flex-row items-center gap-2 w-1/4'>
											<Image src={avatar} width={30} height={30} className='w-[40px] h-[40px] rounded-md object-cover' alt={username} />
											<small className='font-semibold text-neutral-400 group-hover:text-secondary'>{username}</small>
										</div>
									</div>
								</Link>
							}
						</div>}
						placeholder='Quick Search...' 
						data={globalSearchkeywords ? autocompletePosts.map(post => ({ id: post.id, value: post.title, tags: post.tags, username: post.username, avatar: post.avatar })) : []} // value instead of title, since Mantine Autocomplete requires it.
						value={globalSearchkeywords}
						onChange={(e) => setGlobalSearchkeywords(e)} 
						className='w-full max-w-[550px] rounded-r-none'
					/>
					{/* Uncomment this when I'm onto search again. */}
					{/* <CommonButton text='Global Search' onClick={() => {
						router.push(`/search${globalSearchkeywords ? `?keywords=${globalSearchkeywords}` : ''}`);
					}} className='rounded-r-md rounded-l-none text-xs font-normal' /> */}
				</section>
				{/* The user can make new posts here. */}
				{
					profile && user && profile.emailVerified &&
					<DraftPosts user={user} />
				}
				{
					profile && user && profile.emailVerified &&
					<NewPostModal user={user} />
				}
				{/* The user can see their posts here. */}
				<div className='w-full h-full mt-10'>
					<div className=' flex flex-row flex-wrap justify-center gap-10'>
						{
							posts.map((post, index) => <PostPreviewBox key={index} post={post} />)
						}
					</div>
				</div>
			</div>
			{
				posts && posts.length === 50 &&
				<div ref={ref} className='w-full h-full flex items-center justify-center' />
			}
		</div>
	)
}

export const getStaticProps = async (context: GetStaticPropsContext) => 
{
	const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
	const posts = (await supabase.from('post').select('*')).data as Post[];
	return {
		props: {
			posts
		},
		revalidate: 630
	}
}