import CommonButton from "@/components/CommonButton";
import { Gehenna } from "@/components/Gehenna";
import NewPostModal from "@/components/NewPostModal";
import PostPreviewBox from "@/components/PostPreviewBox";
import { serverDb } from "@/lib/db";
import { Post } from "@/models/Post";
import { Profile } from "@/models/Profile";
import { Startup } from "@/models/Startup";
import { ScrollArea, Tabs } from "@mantine/core";
import { User } from "@supabase/supabase-js";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function StartupPage({ user, startup, me, membersWithProfiles, posts }: { user: User | null, startup: Startup, me: Profile | null, membersWithProfiles: Profile[], posts: Post[] })
{
    const [view, setView] = useState<string | null>('Posts');

    return <div className="w-full flex-grow flex flex-col gap-4 max-w-4xl mx-auto py-8">
        <Head>
            <title>Gehenna - {startup.name}</title>
            <meta property="og:title" content={`Gehenna | ${startup.name}`} />
            <meta property="og:description" content={startup.bio.slice(0, 256)} />
            <meta property="og:image" content={startup.avatar} />
            <meta property="og:url" content={`https://www.gehenna.dev/startup/${startup.id}`} />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={startup.name} />
            <meta name="twitter:description" content={startup.bio.slice(0, 256)} />
            <meta name="twitter:image" content={startup.avatar} />
            <meta name="twitter:url" content={`https://www.gehenna.dev/startup/${startup.id}`} />
        </Head>
        <Link href='/' className="flex flex-col items-center justify-center mb-10 group">
            <Gehenna />
        </Link>
        <section className="w-full flex flex-col">
            <Image src={startup.bannerURL} width={1000} height={256} quality={100} alt="Profile Banner" className="object-cover rounded-t-md w-full h-[256px]" />
            <section className="w-full flex flex-row gap-4 items-start bg-tertiary p-4 rounded-b-md">
                <Image src={startup.avatar} width={100} height={100} alt="Profile Picture" className="object-cover rounded-md" />
                <section className="flex flex-col">
                    <h1 className="text-2xl font-semibold">{startup.name}</h1>
                    <p className="font-light text-sm">{startup.industry}</p>
                    <small>{startup.country}</small>
                    <Link href={`https://${startup.domain}`} target="_blank">
                        <span className="text-sm text-blue-500 hover:underline">{startup.domain}</span>
                    </Link>
                </section>
                <section className="ml-auto">
                    <ScrollArea h={100} className="text-sm" color="yellow" type="auto" offsetScrollbars scrollbarSize={4}>
                        {startup.bio}
                    </ScrollArea>
                </section>
            </section>
        </section>
        <section className="w-full flex flex-row gap-2 flex-wrap">
            <Tabs defaultValue="Posts" className="w-full" orientation="horizontal" value={view} onTabChange={setView}>
                <Tabs.List>
                    <Tabs.Tab value="Posts" className={`${me && 'w-1/3'} ${!me && 'w-1/2'}`}>Posts</Tabs.Tab>
                    <Tabs.Tab value="Team" className={`${me && 'w-1/3'} ${!me && 'w-1/2'}`}>Team</Tabs.Tab>
                    {
                        me &&
                        me.startups.some(s => s === startup.id) && <Tabs.Tab value="Settings" className="w-1/3">Settings</Tabs.Tab>
                    }
                </Tabs.List>
            </Tabs>
            {
                view === 'Posts' &&
                <section className="w-full py-4">
                    {
                        me && user &&
                        me.startups.some(x => x === startup.id) &&
                        <div className="w-full flex items-center justify-center">
                            <NewPostModal user={user} startup={startup} />
                        </div>
                    }
                    {
                        posts.length === 0 &&
                        <section className="w-full flex flex-row flex-wrap justify-center gap-4 mt-8">
                            <h1 className="text-2xl font-semibold">No posts yet.</h1>
                        </section>
                    }
                    {
                        posts.length > 0 &&
                        <section className="w-full flex flex-row flex-wrap justify-center gap-4 mt-8">
                        {
                            posts.map((post, index) => <PostPreviewBox key={index} post={post} />)
                        }
                        </section>
                    }
                </section>
            }
            {
                view === 'Team' &&
                <section className="w-full flex flex-col gap-2">
                    <div className="w-full flex flex-row gap-2 flex-wrap">
                    {
                        startup.team.filter(member => membersWithProfiles.some(x => x.email === member.email)).map((member, index) => 
                        <div key={index} className="w-[32.73%] h-96 rounded-md bg-tertiary flex flex-col gap-2 items-center justify-start p-4 group">
                            <Image src={membersWithProfiles.find(x => x.email === member.email)?.avatar ?? '/blade.webp'} width={256} height={256} quality={100} alt="Profile Picture" className="w-[256px] h-[256px] object-cover rounded-md" />
                            <h1 className="text-xl font-semibold w-full">{membersWithProfiles.find(x => x.email === member.email)?.username}</h1>
                            <p className="text-sm font-light w-full">{member.role}</p>
                            <Link href={`/profile/${membersWithProfiles.find(x => x.email === member.email)?.handle}`} className="p-1 bg-primary hover:bg-primary-light text-white rounded-md mr-auto text-xs font-light px-2">
                                View Profile
                            </Link>
                        </div>)
                    }
                    {
                        startup.team.filter(member => !membersWithProfiles.some(x => x.email === member.email)).map((member, index) => 
                        <div key={index} 
                        className="w-[32.73%] h-96 rounded-md bg-tertiary flex flex-col gap-2 items-center justify-start p-4">
                            <Image src={member.avatar ?? '/blade.webp'} width={256} height={256} quality={100} alt="Profile Picture" className="object-cover rounded-md" />
                            <h1 className="text-xl font-semibold w-full">{member.name}</h1>
                            <p className="text-sm font-light w-full">{member.role}</p>
                        </div>)
                    }
                    </div>
                </section>
            }
            {
                view === 'Settings' &&
                <section className="w-full">
                    Settings
                </section>
            }
        </section>
    </div>
}

export const getServerSideProps = async (context: GetServerSidePropsContext) =>
{
    const supabase = serverDb(context);
    const user = (await supabase.auth.getUser()).data?.user;
    const startup = (await supabase.from('startups').select('*').eq('id', context.params?.id).single()).data as Startup;

    // Check if any of the members have emails that match the startup team's emails
    const team = (await supabase.from('profiles').select('*').in('email', startup.team.map(t => t.email))).data as Profile[];

    const posts = (await supabase.from('post').select('*').eq('startupId', startup.id)).data as Post[];

    if (user)
    {
        const me = (await supabase.from('profiles').select('*').eq('id', user.id).single()).data as Profile;
        return {
            props: {
                user,
                startup,
                posts,
                membersWithProfiles: team,
                me
            }
        }
    }
    else
    {
        return {
            props: {
                user: null,
                startup,
                posts,
                membersWithProfiles: team,
                me: null
            }
        }
    }
}