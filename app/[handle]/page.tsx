import HandleFooter from "@/components/HandleFooter";
import HandleNavbar from "@/components/HandleNavbar";
import PostPreviewBox from "@/components/OldPostPreviewBox";
import { MediaInfo } from "@/utils/global.types";
import { createServerClient } from "@/utils/supabase/server";
import { HeartIcon, MessageCircleIcon } from "lucide-react";
import { Metadata, ResolvingMetadata } from "next";
import { Divider, Tabs } from '@mantine/core';
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import HandlePosts from "@/components/HandlePosts";

let favicon = '/favicon.ico';

export async function generateMetadata({ params }: { params: Promise<{ handle: string }>}, parent: ResolvingMetadata): Promise<Metadata>
{
    const handle = (await params).handle;
    const supabase = createServerClient();

    const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('handle', handle)
    .single();

    if (!profile && error)
    {
        redirect('/404');
    }

    return {
        title: `${profile.name}'s Space`,
        description: `Welcome to ${profile.name}'s platform.`,
        icons: {
            icon: profile.avatar || favicon
        },
        openGraph: { images: [profile.avatar || favicon] }
    }
}

export default async function AuthorHomePage({ params }: { params: Promise<{ handle: string }> })
{
    const supabase = createServerClient();
    const user = (await supabase.auth.getUser()).data.user;
    const paramData = await params;

    const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('handle', paramData.handle)
    .single();

    if (error && !profile)
        redirect('/');

    const { data: posts, error: postError } = user && user.id === profile.id ?
    await supabase
    .from('post')
    .select('id, title, postImageURL, createdAt, byline, topicId')
    .eq('userId', profile.id)
    .order('createdAt', { ascending: false }) :
    await supabase
    .from('post')
    .select('id, title, postImageURL, createdAt, byline, topicId')
    .eq('public', true)
    .eq('userId', profile.id)
    .order('createdAt', { ascending: false });

    if (postError && !posts)
        redirect('/500');

    const { data: postTopics, error: postTopicsError } = await supabase
    .from('postTopics')
    .select('*')
    .eq('userId', profile.id);

    if (!postTopics && postTopicsError)
        redirect('/500');

    return <div className="w-full min-h-screen flex flex-col items-center gap-10">
        <div className="w-full flex flex-row gap-5 max-w-4xl mx-auto mt-32 p-4 px-8 bg-tertiary rounded-md">
            <Image src={profile.avatar} alt="profile picture" width={250} height={250} style={{ width: 125, height: 125 }} className="object-cover rounded-full" />
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold">
                    {profile.name}
                </h1>
                <h2>
                    {profile.bio}
                </h2>
                <h3 className="text-sm ml-auto">
                    Joined on {new Date(profile.createdAt).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {/* calculate how many days it's been */}
                    &nbsp;&middot;&nbsp;
                    {
                        Math.floor((new Date().getTime() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24))
                    }
                    &nbsp;days ago
                </h3>
            </div>
        </div>
        {
            posts.length === 0 &&
            <div className="h-full mt-32 flex flex-col items-center justify-center">
                <span className="text-primary font-bold">
                    This person hasn&apos;t posted anything yet!
                </span>
            </div>
        }
        {
            posts[0] &&
            <>
            <span className="font-semib old w-full max-w-4xl -mb-9">
                Latest Post
            </span>
            <Link href={`/${paramData.handle}/${posts[0].id}`} className="w-full max-w-4xl grid grid-cols-2">
                <Image src={(posts[0].postImageURL as MediaInfo).url!} alt="" width={500} height={300} className="max-h-[300px] object-cover rounded-l-md bg-[#0e0e0e]" />
                <div className="flex flex-col gap-4 bg-tertiary rounded-r-md flex-grow p-8 items-center text-center">
                    <span className="text-2xl font-bold text-center">
                        {posts[0].title}
                    </span>
                    <p className="text-neutral-400">
                        {posts[0].byline}
                    </p>
                    <small className="mt-auto">
                        {
                            postTopics.some(x => x.id === posts[0].topicId) ?
                            <>{postTopics.find(x => x.id === posts[0].topicId)?.title}&nbsp;&middot;&nbsp;</> :
                            ''
                        }{new Date(posts[0].createdAt).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </small>
                </div>
            </Link>
            </>
        }
        {
            posts.length > 0 &&
            <HandlePosts postTopics={postTopics} profile={profile} posts={posts.slice(1) as {
                id: string;
                title: string;
                postImageURL: MediaInfo;
                createdAt: string;
                byline: string;
                topicId: string | null;
            }[]} />
        }
        {/* <HandleFooter profile={profile} /> */}
    </div>
}