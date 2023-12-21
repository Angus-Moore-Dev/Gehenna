import HandleFooter from "@/components/HandleFooter";
import HandleNavbar from "@/components/HandleNavbar";
import PostPreviewBox from "@/components/OldPostPreviewBox";
import { MediaInfo } from "@/utils/global.types";
import { createServerSupabase } from "@/utils/supabase/server";
import { HeartIcon, MessageCircleIcon } from "lucide-react";
import { Metadata, ResolvingMetadata } from "next";
import { Tabs } from '@mantine/core';
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import HandlePosts from "@/components/HandlePosts";

let favicon = '/favicon.ico';

export async function generateMetadata({ params }: { params: { handle: string }}, parent: ResolvingMetadata): Promise<Metadata>
{
    const handle = params.handle;
    const supabase = createServerSupabase();

    const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('handle', handle)
    .single();

    if (!profile && error)
    {
        return {
            title: 'Gehenna',
            openGraph: {
                images: ['/favicon.ico']
            }
        }
    }

    return {
        title: `${profile.username} | Gehenna`,
        description: `Welcome to ${profile.username}'s platform.`,
        icons: {
            icon: profile.avatar || favicon
        },
        openGraph: { images: [profile.avatar || favicon] }
    }
    
}

export default async function AuthorHomePage({ params }: { params: { handle: string }})
{
    const supabase = createServerSupabase();
    const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('handle', params.handle)
    .single();

    if (error && !profile)
        redirect('/404');

    const { data: posts, error: postError } = await supabase
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

    return <div className="w-full flex flex-col items-center gap-10">
        <HandleNavbar profile={profile} />
        <Link href={`p/${posts[0].id}`} className="w-full max-w-4xl flex flex-row border-[1px] border-neutral-600 mt-32">
            <Image src={(posts[0].postImageURL as MediaInfo).url} alt="" width={500} height={225} className="object-cover rounded-l-md border-r-[1px] border-neutral-600" />
            <div className="flex flex-col gap-4 bg-tertiary rounded-r-md flex-grow p-8 items-center text-center">
                <span className="text-2xl font-bold text-center">
                    {posts[0].title}
                </span>
                <p className="text-neutral-400">
                    {posts[0].byline}
                </p>
                <small>
                    {new Date(posts[0].createdAt).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}
                </small>
            </div>
        </Link>
        <HandlePosts postTopics={postTopics} profile={profile} posts={posts.slice(1) as {
            id: string;
            title: string;
            postImageURL: MediaInfo;
            createdAt: string;
            byline: string;
            topicId: string | null;
        }[]} />
        {/* <div className="w-full flex flex-row justify-center flex-wrap gap-10 px-8">
            {
                posts.map(post => <PostPreviewBox
                    key={post.id}
                    post={post as { id: string, title: string, postImageURL: MediaInfo, tags: string[], createdAt: string }}
                    profile={profile} />
                )
            }
        </div> */}
        <HandleFooter profile={profile} />
    </div>
}