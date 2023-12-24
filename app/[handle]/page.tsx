import HandleFooter from "@/components/HandleFooter";
import HandleNavbar from "@/components/HandleNavbar";
import PostPreviewBox from "@/components/OldPostPreviewBox";
import { MediaInfo } from "@/utils/global.types";
import { createServerClient } from "@/utils/supabase/server";
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
    const supabase = createServerClient();

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
        title: `${profile.name} | Gehenna`,
        description: `Welcome to ${profile.name}'s platform.`,
        icons: {
            icon: profile.avatar || favicon
        },
        openGraph: { images: [profile.avatar || favicon] }
    }
}

export default async function AuthorHomePage({ params }: { params: { handle: string }})
{
    const supabase = createServerClient();
    const user = (await supabase.auth.getUser()).data.user;

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
    .eq('public', user && user.id === profile.id ? true : false)
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
        <HandleNavbar profile={profile} />
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
            <Link href={`/${posts[0].id}`} className="w-full max-w-4xl grid grid-cols-2 mt-32">
                <Image src={(posts[0].postImageURL as MediaInfo).url} alt="" width={500} height={300} className="max-h-[300px] object-cover rounded-l-md bg-[#0e0e0e]" />
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