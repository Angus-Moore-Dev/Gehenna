import { Gehenna } from "@/components/Gehenna";
import { clientDb, serverDb } from "@/lib/db";
import { Profile } from "@/models/Profile";
import { User } from "@supabase/supabase-js";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IconSettings } from "@tabler/icons-react";
import { toast } from "react-toastify";
import { ScrollArea } from "@mantine/core";
import { Post } from "@/models/Post";
import Head from "next/head";

export default function ProfilePage({ me, profile }: { me: User | null, profile: Profile })
{
    const [postCount, setPostCount] = useState(50);
	const [posts, setPosts] = useState<Post[]>();

    useEffect(() => {
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
                </div>
                <div className="flex-grow max-w-[50%] ml-auto">
                    <ScrollArea h={100} className="text-sm" color="yellow" type="auto" offsetScrollbars scrollbarSize={4}>
                        {profile.bio}
                    </ScrollArea>
                </div>
            </section>
        </div>
    </div>
}


export const getServerSideProps = async (context: GetServerSidePropsContext) =>
{
    const supabase = serverDb(context);
    const me = (await supabase.auth.getUser()).data.user;
    const profile = (await supabase.from('profiles').select('*').eq('handle', context.params?.id).single()).data as Profile | null;

    return {
        props: {
            me,
            profile,
        }
    }
}