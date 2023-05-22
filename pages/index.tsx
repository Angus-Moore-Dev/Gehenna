import NewPostBox from '@/components/NewPostBox';
import PostPreviewBox from '@/components/PostPreviewBox';
import SignInForm from '@/components/SignInForm';
import SignUpModal from '@/components/SignUpModal';
import { clientDb, serverDb } from '@/lib/db';
import { Post } from '@/models/Post';
import { Profile } from '@/models/Profile';
import { Box, Button, Loader, Skeleton, TextInput } from '@mantine/core';
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
	const router = useRouter();
	const [postCount, setPostCount] = useState(10);
	const [posts, setPosts] = useState<Post[]>();
	const ref = useRef<HTMLDivElement>(null);
	const [searchResults, setSearchResults] = useState('');
	const [notifications, setNotifications] = useState<Notification[]>();
	const [createNewPost, setCreateNewPost] = useState(false);

	useEffect(() => {
		// We do client side fetching to improve first time load and also to make sure that the user is logged in.

		// generate two timestamptz, one right now and one from a week ago.
		// then we can use the week ago timestamp to get the posts from the last week.
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
	}, []);

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
					<Link href='https://www.paypal.com/donate/?business=GM4YGMGDGZZ5A&no_recurring=0&item_name=Help+support+Gehenna+and+keep+it+functioning+well%21&currency_code=AUD'
					target="_blank"
					className='underline text-blue-600 transition hover:text-blue-500'>
						Help Support Gehenna!
					</Link>
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
										<span className='w-full max-w-3xl font-semibold text-lg'>Latest Threads</span>
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