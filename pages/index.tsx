import NewPostBox from '@/components/NewPostBox';
import PostPreviewBox from '@/components/PostPreviewBox';
import SignInForm from '@/components/SignInForm';
import SignUpModal from '@/components/SignUpModal';
import { clientDb, serverDb } from '@/lib/db';
import { Post } from '@/models/Post';
import { Profile } from '@/models/Profile';
import { Autocomplete, Box, Button, Chip, Loader, Skeleton, TextInput } from '@mantine/core';
import { User } from '@supabase/auth-helpers-nextjs';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useInfiniteScroll } from 'ahooks';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Notification } from '@/models/Notification';
import CommonButton from '@/components/CommonButton';
import { useRouter } from 'next/router';
import NewPostModal from '@/components/NewPostModal';
import { Gehenna } from '@/components/Gehenna';
import SignInModal from '@/components/SignInModal';

interface HomePageProps
{
	user: User | null;
	profile: Profile | null;
}

export default function HomePage({ user, profile }: HomePageProps)
{
	const router = useRouter();
	const [postCount, setPostCount] = useState(10);
	const [posts, setPosts] = useState<Post[]>();
	const ref = useRef<HTMLDivElement>(null);
	const [searchResults, setSearchResults] = useState('');
	const [notifications, setNotifications] = useState<Notification[]>();
	const [createNewPost, setCreateNewPost] = useState(false);

	const [autocompletePosts, setAutocompletePosts] = useState<{ id: string, title: string, tags: string[], userId: string, username: string, avatar: string }[]>([]);
	const [globalSearchkeywords, setGlobalSearchkeywords] = useState('');

	useEffect(() => {
		// We do client side fetching to improve first time load and also to make sure that the user is logged in.

		// generate two timestamptz, one right now and one from a week ago.
		// then we can use the week ago timestamp to get the posts from the last week.

		const weekAgo = new Date();
		weekAgo.setDate(weekAgo.getDate() - 7);

		clientDb.from('post').select('*').limit(postCount).gt('createdAt', weekAgo.toISOString()).order('upvotes', { ascending: false }).then(async res => {
			if (!res.error && res.data)
			{
				setPosts(res.data as Post[]);
			}
			else if (res.error)
			{
				toast.error(res.error.message);
			}
		});

		if (user)
		{
			// Get all unseen notifications
			clientDb.from('notifications').select('*').eq('userId', user.id).eq('seen', false).order('created_at', { ascending: false }).then(async res => {
				setNotifications(res.data as Notification[]);
			});

			// Listen for new notifications.
			clientDb.channel('notifications').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications'}, (payload) => {
				const newNotification = payload.new as Notification;
				if (newNotification.userId === user.id)
				{
					toast.info(newNotification.title, {
						async onClick() {
							// Let the system know that we've clicked and viewed this post.
							await clientDb.from('notifications').update({
								seen: true
							}).eq('id', newNotification.id);

							router.push(`${window.location.origin}${newNotification.link}`);
						}
					});

					setNotifications((prev) => [newNotification, ...prev ?? []] as Notification[]);
				}
			}).subscribe((status) => console.log(status));
		}
	}, []);

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
					})

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
		<div ref={ref} className="w-full h-full flex flex-col gap-4 max-w-6xl mx-auto py-16">
			<Head>
				<title>Gehenna - Learn, Grow.</title>
			</Head>
			{
				user && profile && !profile.emailVerified &&
				<div className='w-full h-full flex items-center justify-center flex-col gap-4'>
					<Image src='/logo.png' width={500} height={450} className='w-1/3 mb-10' alt='Gehenna' />
					<span className='text-2xl font-bold'>Please verify your email address before you can gain access to Gehenna.</span>
					<span>Please check your inbox (or spam) for an email with a link to confirm <b>{user.email}</b></span>
				</div>
			}
			<div className='w-full h-full flex flex-col items-center gap-8'>
				{/* <Image src='/logo.png' width={500} height={450} className='w-1/3' alt='Gehenna' /> */}
				<Gehenna />
				{
					!profile &&
					<SignInModal />
				}
				{
					profile && 
					<>
					<section className='flex flex-col mx-auto gap-2 items-center'>
						<Image src={profile.avatar} alt='me' width={100} height={100} className='w-[100px] h-[100px] object-cover rounded-md' />
						<span className='font-semibold'>{profile.username}</span>
					</section>
					<Link href='/profile' className='-mt-6 mb-2 w-full max-w-3xl flex flex-col items-center gap-4 underline text-blue-600 transition hover:text-blue-500'>
						View My Profile
					</Link>
					</>
				}
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
							<Link href={`/${id}`} className='flex flex-col justify-center gap-2 py-2 px-4 font-medium transition hover:bg-primary hover:text-secondary rounded-md group'>
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
					label="Search For A Post" 
					placeholder='Search By Title' 
					data={globalSearchkeywords ? autocompletePosts.map(post => ({ id: post.id, value: post.title, tags: post.tags, username: post.username, avatar: post.avatar })) : []} // value instead of title, since Mantine Autocomplete requires it.
					value={globalSearchkeywords}
					onChange={(e) => setGlobalSearchkeywords(e)} 
					className='w-full max-w-3xl'
				/>
				{/* The user can make new posts here. */}
				{
					profile && user &&
					<NewPostModal user={user} />
				}
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
						<InfiniteScroll 
						dataLength={posts.length} 
						next={async () => {
							clientDb.from('post').select('*').limit(postCount + 2).order('upvotes', { ascending: false }).then(async res => {
								if (!res.error && res.data)
								{
									setPosts(res.data as Post[]);
									setPostCount(postCount + 2);
								}
								else
								{
									toast.error(res.error.message);
								}
							})
						}} 
						hasMore={true} 
						loader={<div className='w-full h-full flex items-center justify-center flex-col gap-2' />} 
						style={{
							width: '768px',
						}}
						endMessage={
							<p style={{ textAlign: 'center' }}>
								<b>Yay! You have seen it all</b>
							</p>
						}>
							{
								posts && posts.length > 0 &&
								<div className='w-full flex flex-col gap-2 justify-start'>
								<span className='w-full max-w-3xl font-semibold text-lg'>Top Posts of The Week</span>
								{
									posts.map((post, index) => <PostPreviewBox key={index} post={post} />)
								}
								</div>
							}
						</InfiniteScroll>
						</>
					}
				</div>
			</div>
			{
				posts && posts.length === 10 &&
				<div ref={ref} className='w-full h-full flex items-center justify-center' />
			}
		</div>
	)
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => 
{
	const db = serverDb(context);
	const user = (await db.auth.getUser()).data.user;

	// Get the profile.
	const profile = user ? (await db.from('profiles').select('*').eq('id', user.id).single()).data as Profile : null;
	return {
		props: {
			user: user,
			profile: profile
		}
	}
}