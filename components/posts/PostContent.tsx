import { MediaInfo, Post, Profile } from "@/utils/global.types"
import { TypographyStylesProvider } from "@mantine/core";
import { HeartIcon, MessageCircleIcon } from "lucide-react";
import Image from "next/image";
import AdditionalMedia from "./AdditionalMedia";
import SharePost from "./SharePost";
import PostComments from "./PostComments";
import { User } from "@supabase/supabase-js";
import PostCommentCount from "../PostCommentCount";

interface PostContentProps
{
    post: Post;
    postTopicTitle: string;
    profile: Profile;
    user: User | null;
}

export default function PostContent({ post, profile, postTopicTitle, user }: PostContentProps)
{
    return <div className="w-full max-w-3xl flex flex-col gap-5 mt-32">
        <span className="text-5xl font-bold mb-4">
            {post.title}
        </span>
        {
            postTopicTitle &&
            <small className="text-neutral-400 -mt-9">
                {postTopicTitle}
            </small>
        }
        <section className="flex flex-col gap-5">
            <div className="flex flex-row gap-5 items-start">
                <Image src={profile.avatar} alt="Profile Picture" width={250} height={250} style={{ width: 50, height: 50, objectFit: 'cover' }} className="rounded-full" />
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
                                {
                                    post.id &&
                                    <PostCommentCount postId={post.id} />
                                }
                                {
                                    !post.id &&
                                    <small>
                                        0
                                    </small>
                                }
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
        <TypographyStylesProvider className="-ml-8">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </TypographyStylesProvider>
        <AdditionalMedia files={post.attachedFileURLs as MediaInfo[]} />
        {
            post.id &&
            <>
            <div className="w-full pb-2 border-b-[1px] border-b-neutral-600">
                Comments
            </div>
            <PostComments post={post} user={user} />
            </>
        }
    </div>
}