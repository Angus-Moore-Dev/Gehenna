import HandleFooter from "@/components/HandleFooter";
import HandleNavbar from "@/components/HandleNavbar";
import AdditionalMedia from "@/components/posts/AdditionalMedia";
import SharePost from "@/components/posts/SharePost";
import { appDomain, appHttp } from "@/utils/appURL";
import { MediaInfo } from "@/utils/global.types";
import { createServerClient } from "@/utils/supabase/server";
import { Button, Chip, TypographyStylesProvider } from "@mantine/core";
import { ClockIcon, HeartIcon, MessageCircleIcon, SeparatorHorizontal, ShareIcon } from "lucide-react";
import { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

let favicon = '/favicon.ico';

export async function generateMetadata({ params }: { params: { postId: string }}, parent: ResolvingMetadata): Promise<Metadata>
{
    const postId = params.postId;
    const supabase = createServerClient();

    const { data: post, error: postError } = await supabase
    .from('post')
    .select('id, title, byline, userId')
    .eq('id', postId)
    .single();

    if (!post && postError)
    {
        return {
            title: 'Gehenna',
            openGraph: {
                images: ['/favicon.ico']
            }
        }
    }

    const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', post.userId)
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
        title: `${post.title}`,
        description: post.byline,
        icons: {
            icon: profile.avatar || favicon
        },
        openGraph: { images: [profile.avatar || favicon] }
    }
    
}

export default async function PostPage({ params }: { params: { postId: string, handle: string } })
{
    const supabase = createServerClient();

    const { data: post, error: postError } = await supabase
    .from('post')
    .select('*')
    .eq('id', params.postId)
    .single();

    if (!post && postError)
        redirect('/404');

    const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', post.userId)
    .single();

    if (error && !profile)
        redirect('/404');

    if (profile.handle !== params.handle)
    {
        // It means the user is on another handle looking at a post from another person.
        // We want to redirect them to that user's handle instead.
        const newURL = `${appHttp}://${profile.handle}.${appDomain}/p/${post.id}`;
        redirect(newURL);
    }
    return <div className="w-full min-h-screen flex flex-col gap-10 items-center">
        <HandleNavbar profile={profile} />
        <div className="w-full max-w-3xl flex flex-col gap-5 mt-32">
            <span className="text-5xl font-bold mb-4">
                {post.title}
            </span>
            <section className="flex flex-col gap-5">
                <div className="flex flex-row gap-5 items-start">
                    <Image src={profile.avatar} alt="Profile Picture" width={50} height={50} className="rounded-full" />
                    <div className="w-full flex flex-row justify-between gap-2">
                        <div className="flex flex-col">
                            <span className="font-semibold">
                                {profile.name}
                            </span>
                            <small>
                                {new Date(post.createdAt).toLocaleDateString('en-AU', { dateStyle: 'full' })}
                            </small>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row justify-end gap-2">
                                <button className="flex flex-row items-center px-4 py-2 rounded-full border-[1px] border-neutral-600">
                                    <HeartIcon size={20} className="mr-2" />
                                    <small>
                                        0
                                    </small>
                                </button>
                                <button className="flex flex-row items-center px-4 py-2 rounded-full border-[1px] border-neutral-600">
                                    <MessageCircleIcon size={20} className="mr-2" />
                                    <small>
                                        0
                                    </small>
                                </button>
                                <SharePost />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full border-t-[1px] border-t-neutral-600" />
            </section>
            <Image
            src={(post.postImageURL as MediaInfo).url}
            alt=""
            width={1000} height={450}
            className="object-cover rounded-md"
            style={{
                width: 1000,
                height: 450,
                objectFit: 'cover'
            }}
            />
            <TypographyStylesProvider className="-ml-6">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </TypographyStylesProvider>
            <AdditionalMedia files={post.attachedFileURLs as MediaInfo[]} />
        </div>
        <HandleFooter profile={profile} />
    </div>
}