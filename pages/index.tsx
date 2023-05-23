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

interface HomePageProps
{
	user: User;
	profile: Profile;
}

export default function HomePage({ user, profile }: HomePageProps)
{
	const audioRef = useRef<HTMLAudioElement>(null);
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
		if (user)
		{
			const weekAgo = new Date();
			weekAgo.setDate(weekAgo.getDate() - 7);

			clientDb.from('post').select('*').limit(postCount).gt('createdAt', weekAgo.toISOString()).order('createdAt', { ascending: false }).then(async res => {
				if (!res.error && res.data)
				{
					if (res.data.length === 0)
					{
						// Create new post immediately, since there are none on the recent post list.
						setCreateNewPost(true);
					}
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


			// Get all unseen notifications
			clientDb.from('notifications').select('*').eq('userId', user.id).eq('seen', false).order('created_at', { ascending: false }).then(async res => {
				setNotifications(res.data as Notification[]);
			});

			// Listen for new notifications.
			clientDb.channel('notifications').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications'}, (payload) => {
				const newNotification = payload.new as Notification;
				if (newNotification.userId === user.id)
				{
					// Play a sound to notify the user of the new notification.
					if (audioRef.current)
					{
						audioRef.current.currentTime = 0;
						audioRef.current.play();
					}
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
					console.log('profiles::', profiles);
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
				<div className='w-full h-full flex flex-col items-center gap-8'>
					<audio ref={audioRef} hidden>
						<source src={'/notification.mp3'} />
					</audio>
					<Link href='https://www.paypal.com/donate/?business=GM4YGMGDGZZ5A&no_recurring=0&item_name=Help+support+Gehenna+and+keep+it+functioning+well%21&currency_code=AUD'
					target="_blank"
					className='underline text-blue-600 transition hover:text-blue-500'>
						Help Support Gehenna!
					</Link>
					
					<Autocomplete 
						icon={<svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-search" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
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
						data={autocompletePosts.map(post => ({ id: post.id, value: post.title, tags: post.tags, username: post.username, avatar: post.avatar }))} // value instead of title, since Mantine Autocomplete requires it.
						value={globalSearchkeywords}
						onChange={(e) => setGlobalSearchkeywords(e)} 
						className='w-full max-w-3xl'
					/>

					<Image src='/logo.png' width={500} height={450} className='w-1/3' alt='Gehenna' />
					<section className='flex flex-col mx-auto gap-2 items-center'>
						<Image src={profile.avatar} alt='me' width={100} height={100} className='w-[100px] h-[100px] object-cover rounded-md' />
						<span className='font-semibold'>{profile.username}</span>
					</section>
					<Link href='/profile' className='-mt-6 mb-2 w-full max-w-3xl flex flex-col items-center gap-4 underline text-blue-600 transition hover:text-blue-500'>
						View My Profile
					</Link>
					<section className={`w-full max-w-3xl flex flex-col min-h-[200px] max-h-[400px] ${notifications && notifications.length > 0 && 'border-b-8 border-b-primary'} rounded-b-xl bg-quaternary`}>
						{/* This is for notifications that the user has not seen yet. */}
						{
							notifications && notifications.length > 0 &&
							<div className='w-full flex flex-row gap-4 items-center bg-primary rounded-t-xl'>
								<span className='font-semibold text-lg text-secondary p-2'>New Notifications {notifications && notifications.length > 0 && '(Click on each to remove them)'}</span>
								<CommonButton text='Dismiss All' onClick={async () => {
									const res = await clientDb.from('notifications').update({ seen: true }).eq('userId', user.id);
									if (res.error) 
										toast.error(res.error.message);
									else
									{
										setNotifications([]);
										toast.success('Successfully dismissed notifications.');
									}
								}} className='bg-secondary text-white transition hover:text-primary hover:bg-quaternary' />
							</div>
						}
						{
							!notifications &&
							<div className='flex-grow flex items-center justify-center bg-tertiary'>
								<Loader />
							</div>
						}
						{
							notifications && notifications.length === 0 &&
							<div className='flex-grow flex flex-col gap-2 items-center justify-center bg-tertiary'>
								<span className='text-xl font-semibold'>You have no new notifications.</span>
								<Link href='/notifications' className='underline text-blue-600 transition hover:text-blue-500'>
									View All Notifications
								</Link>
							</div>
						}
						{
							notifications && notifications.length > 0 &&
							<div className='flex-grow flex flex-col gap-2 overflow-y-auto p-2 scrollbar'>
								{
									notifications.map((notification, index) => {
										return (
											<Link key={index} href={notification.link} className='w-full flex flex-col gap-2 p-2 px-4 bg-tertiary rounded-xl transition hover:bg-primary hover:text-secondary group border-b-2 border-b-primary'
											onClick={async () => {
												// Let the system know that we've clicked and viewed this post.
												const res = await clientDb.from('notifications').update({
													seen: true
												}).eq('id', notification.id);
											}}>
												<span className='text-lg font-semibold'>{notification.title}</span>
												<span className='text-xs'>{notification.text}</span>
												<span className='text-xs text-primary ml-auto group-hover:text-secondary'>{new Date(notification.created_at).toLocaleDateString('en-au', { weekday: 'long', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
											</Link>
										)
									})
								}
							</div>
						}
					</section>
					{/* The user can make new posts here. */}
					{
						!createNewPost &&
						<CommonButton onClick={() => setCreateNewPost(true)} className='w-full max-w-3xl py-2 text-xl font-bold' text='Create New Post' />
					}
					{
						createNewPost &&
						<NewPostBox user={user} />
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
							<TextInput placeholder='We look for titles and tags...' className='w-full max-w-3xl' label='Search For Thread' value={searchResults} onChange={async (e) => setSearchResults(e.target.value)} />
							{
								searchResults.length > 0 && posts.map(x => x.title.toLowerCase().includes(searchResults.toLowerCase()) || x.tags.some(tag => tag.toLowerCase().includes(searchResults.toLowerCase())) && <PostPreviewBox key={x.id} post={x} />)
							}
							{
								searchResults.length === 0 &&
								<InfiniteScroll 
								dataLength={posts.length} 
								next={async () => {
									clientDb.from('post').select('*').limit(postCount + 2).order('createdAt', { ascending: false }).then(async res => {
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
										<span className='w-full max-w-3xl font-semibold text-lg'>Latest Threads (up to 7 days ago)</span>
										{
											posts.map((post, index) => <PostPreviewBox key={index} post={post} />)
										}
										</div>
									}
								</InfiniteScroll>
							}
							</>
						}
					</div>
					
				</div>
			}
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

	if (user)
	{
		// Get the profile.
		const profile = (await db.from('profiles').select('*').eq('id', user.id).single()).data as Profile;
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