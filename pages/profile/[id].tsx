import CommonButton from "@/components/CommonButton";
import { Gehenna } from "@/components/Gehenna";
import { clientDb, serverDb } from "@/lib/db";
import { Profile } from "@/models/Profile";
import { User } from "@supabase/supabase-js";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { IconSettings, IconUser } from "@tabler/icons-react";
import { toast } from "react-toastify";
import { ScrollArea, Skeleton } from "@mantine/core";
import { Post } from "@/models/Post";
import PostPreviewBox from "@/components/PostPreviewBox";
import InfiniteScroll from "react-infinite-scroll-component";
import Head from "next/head";
import { Startup } from "@/models/Startup";

export default function ProfilePage({ me, profile, startups, isFollowing }: { me: User | null, profile: Profile, startups: Startup[], isFollowing: boolean })
{
    const router = useRouter();
    const { id } = router.query as { id: string };
    const formattedDate = new Date(profile.createdAt).toLocaleDateString('en-au', { dateStyle: 'long' });
    const [followers, setFollowers] = useState<number>();
    const [following, setFollowing] = useState(isFollowing);
    const [postCount, setPostCount] = useState(50);
	const [posts, setPosts] = useState<Post[]>();
	const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        clientDb.from('followers').select('*', { count: 'exact', head: true }).eq('followingId', profile.id).then(({ count }) => {
            if (count)
            {
                setFollowers(count);
            }
            else
            {
                setFollowers(0);
            }
        });
    }, []);

    const x = () => {}
    const y = x;
    useEffect(() => {
		// We do client side fetching to improve first time load and also to make sure that the user is logged in.

		// generate two timestamptz, one right now and one from a week ago.
		// then we can use the week ago timestamp to get the posts from the last week.

		clientDb.from('post').select('*').limit(postCount).order('createdAt', { ascending: false }).eq('userId', profile.id).then(async res => {
			if (!res.error && res.data)
			{
				setPosts(res.data as Post[]);
			}
			else if (res.error)
			{
				toast.error(res.error.message);
			}
		});
	}, []);

    return <div className="flex-grow w-full flex flex-col gap-4 mx-auto py-8 items-center max-w-4xl">
        <Head>
            <title>Gehenna - {profile.username}</title>
            <link href='/favicon.png' rel='icon' />
            <meta name='viewport' content='initial-scale=1.0, width=device-width' />
            <meta name="description" content={profile.bio} />
            <meta property="og:url" content={`https://www.gehenna.dev/profile/${profile.handle}`} />
            <meta property="og:type" content="website" />
            <meta property="og:title" content={`${profile.username}`} />
            <meta property="og:description" content={`${profile.bio}`} />
            <meta property="og:image" content={profile.avatar} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta property="twitter:domain" content="gehenna.dev" />
            <meta property="twitter:url" content={`https://www.gehenna.dev/profile/${profile.handle}`} />
            <meta name="twitter:title" content={`${profile.username}`} />
            <meta name="twitter:description" content={profile.bio} />
            <meta name="twitter:image" content={profile.avatar} />
        </Head>
        <Link href='/'>
            <Gehenna />
        </Link>
        <div className="w-full flex flex-col">
            <section className="w-full">
                {
                    !profile.profileBannerURL.url &&
                    <section className="w-full h-full rounded-md bg-gradient-to-b from-black to-secondary z-10" />
                }
                {
                    profile.profileBannerURL.url &&
                    <Image src={profile.profileBannerURL.url} width={1000} height={256} alt="Profile Banner" className="object-cover rounded-t-md w-full h-[256px]" />
                }
            </section>
            <section className="w-full flex flex-row gap-4 items-start bg-tertiary p-4 rounded-b-md">
                <Image src={profile.avatar} width={100} height={100} alt="Profile Picture" className="object-cover rounded-md w-[100px] h-[100px] mt-2" />
                <div className="flex flex-col gap-1.5">
                    <div className="flex flex-row gap-2 items-center">
                        <span className="text-2xl font-semibold">{profile.username}</span>
                        {
                            me?.id === profile.id &&
                            <Link href='/profile'>
                                <IconSettings size={20} className="transition hover:text-primary-light" />
                            </Link>
                        }
                    </div>
                    <small className="font-light">{profile.handle}</small>
                    <div className="flex flex-row items-end gap-4 h-full">
                        <span className="text-sm font-semibold text-neutral-100"><span className="text-neutral-400 text-xs">Joined on&nbsp;<br /></span>{formattedDate}</span>
                        {
                            followers === undefined &&
                            <Skeleton width={96} height='' className="rounded-md" />
                        }
                        {
                            followers !== undefined &&
                            <div className="flex flex-row items-center gap-2">
                                <IconUser size='20' />
                                <span className="text-sm font-semibold">{followers?.toLocaleString()} Follower{followers === 0 || followers > 1 && 's'}</span>
                                {
                                    me && me.id !== profile.id &&
                                    <CommonButton text={following ? 'Unfollow' : 'Follow'} onClick={async () => {
                                        if (!following)
                                        {
                                            // Follow
                                            const res = await clientDb.from('followers').insert({ followerId: me?.id, followingId: profile.id });
                                            if (!res.error)
                                            {
                                                setFollowing(true);
                                                setFollowers(followers! + 1);
                                            }
                                            else toast.error(res.error.message);
                                        }
                                        else
                                        {
                                            // Unfollow
                                            const res = await clientDb.from('followers').delete().eq('followerId', me?.id).eq('followingId', profile.id);
                                            if (!res.error)
                                            {
                                                setFollowing(false);
                                                setFollowers(followers!- 1);
                                            }
                                            else toast.error(res.error.message);
                                        }
                                    }} className="text-xs py-0 p-1 h-6" />
                                }
                            </div>
                        }
                    </div>
                </div>
                <div className="flex-grow max-w-[50%] ml-auto">
                    <ScrollArea h={100} className="text-sm" color="yellow" type="auto" offsetScrollbars scrollbarSize={4}>
                        {profile.bio}
                    </ScrollArea>
                </div>
            </section>
        </div>
        {
            startups.length > 0 &&
            <div className="w-full flex flex-col gap-4">
                <span className="text-xl font-semibold">Startups / Organisations</span>
                {
                    startups.map((startup, index) => <div key={index} className="relative w-full p-4 bg-tertiary rounded-md flex flex-row gap-4 items-center">
                        <Image src={startup.bannerURL} width={768} height={256} alt="Banner" className="w-full h-full absolute top-0 left-0 rounded-md object-cover z-0 opacity-20" />
                        <Image src={startup.avatar} alt="Startup Avatar" width={128} height={128} className="w-[128px] h-[128px] rounded-md object-cover z-10" />
                        <section className="flex-grow h-full mb-auto z-10">
                            <section className="flex flex-row items-center gap-2">
                                <h1 className="font-bold">{startup.name}</h1>
                                <CommonButton text='View Page' onClick={() => router.push(`/startup/${startup.id}`)} className="text-xs" />
                            </section>
                            <p>{startup.industry ? startup.industry : 'Startup'}</p>
                            <p>{startup.country ? startup.country : 'Remote'}</p>
                        </section>
                    </div>)
                }
            </div>
        }
        <div className='w-full h-full mt-10'>
            <p className="text-xl font-semibold mb-4 text-left">Posts From {profile.username}</p>
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
                    width: '100%',
                    overflow: 'hidden',
                }}
                endMessage={
                    <p style={{ textAlign: 'center' }}>
                        <b>Yay! You have seen it all</b>
                    </p>
                }>
                    {
                        posts && posts.length > 0 &&
                        <div className='w-full flex flex-row flex-wrap justify-center gap-10'>
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
}


export const getServerSideProps = async (context: GetServerSidePropsContext) =>
{
    const supabase = serverDb(context);
    const me = (await supabase.auth.getUser()).data.user;
    const profile = (await supabase.from('profiles').select('*').eq('handle', context.params?.id).single()).data as Profile | null;

    const startups = profile ? (await supabase.from('startups').select('*').in('id', profile?.startups)).data as Startup[] : [];
    
    let isFollowing: boolean = false;
    // If the profile I'm viewing is not mine, check if I am following this person.
    if (profile?.id !== me?.id)
    {
        const isFollowingRes = await supabase.from('followers').select('*').eq('followerId', me?.id).eq('followingId', profile?.id).single();
        if (!isFollowingRes.error && isFollowingRes.data)
        {
            isFollowing = true;
        }
    }

    return {
        props: {
            me,
            profile,
            startups,
            isFollowing
        }
    }
}