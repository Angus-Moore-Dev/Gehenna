import HandleFooter from "@/components/HandleFooter";
import HandleNavbar from "@/components/HandleNavbar";
import PostPreviewBox from "@/components/OldPostPreviewBox";
import { MediaInfo } from "@/utils/global.types";
import { createServerSupabase } from "@/utils/supabase/server";
import { HeartIcon, MessageCircleIcon } from "lucide-react";
import { Metadata, ResolvingMetadata } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

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
    .select('id, title, postImageURL, tags, createdAt, byline')
    .eq('public', true)
    .eq('userId', profile.id)
    .order('createdAt', { ascending: false });

    if (postError && !posts)
        redirect('/500');

    if (profile.avatar)
        favicon = profile.avatar;

    return <div className="w-full flex flex-col items-center gap-10">
        <HandleNavbar profile={profile} />
        <Link href={`p/${posts[0].id}`} className="w-full max-w-4xl flex flex-row border-[1px] border-neutral-600">
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
        <div className="w-full max-w-4xl flex flex-col gap-4 mt-20">
            {
                posts.slice(1).map(post =>
                <Link
                href={`p/${post.id}`}
                key={post.id}
                className="bg-secondary transition hover:bg-tertiary border-[1px] border-neutral-600 rounded-md flex flex-row gap-2">
                    <Image src={(post.postImageURL as MediaInfo).url} alt="" width={250} height={150} className="object-cover bg-tertiary min-w-[250px] min-h-[150px] max-h-[150px] h-full rounded-l-md" />
                    <div className="flex-grow flex flex-col gap-2 p-4">
                        <span className="text-2xl font-bold">
                            {post.title}
                        </span>
                        <small>
                            {post.byline}
                        </small>
                        <div className="flex flex-row gap-2 items-center mt-auto">
                            <small>
                                {new Date(post.createdAt).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </small>
                            <button className="flex flex-row items-center px-3 py-1 rounded-full border-[1px] border-neutral-600 ml-auto">
                                <HeartIcon size={12} className="mr-2" />
                                <small>
                                    0
                                </small>
                            </button>
                            <button className="flex flex-row items-center px-3 py-1 rounded-full border-[1px] border-neutral-600">
                                <MessageCircleIcon size={12} className="mr-2" />
                                <small>
                                    0
                                </small>
                            </button>
                        </div>
                    </div>
                </Link>)
            }
        </div>
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