import { clientDb } from "@/lib/db";
import { Post } from "@/models/Post";
import { Profile } from "@/models/Profile";
import { Chip, Loader, Skeleton } from "@mantine/core";
import { RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Image from "next/image";

interface PostPreviewBoxProps
{
    post: Post;
}

export default function PostPreviewBox({ post }: PostPreviewBoxProps)
{
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<Profile>();
    const [commentCount, setCommentCount] = useState<number>();
    useEffect(() => {
        if (post)
        {
            // Fetch the post's profile and other information to provide a rich preview.
            // Also include the number of comments underneath it as well.
            
            clientDb.from('profiles').select('*').eq('id', post.userId).single().then(async res => {
                if (!res.error && res.data)
                {
                    setProfile(res.data as Profile);
                }
                else if (res.error)
                {
                    toast.error(res.error.message);
                }
            });

            clientDb.from('comments').select('*', { count: 'exact' }).eq('postId', post.id).then(async res => {
                console.log(res);
                if (!res.error && res.data)
                {
                    setCommentCount(res.count as number);
                }
                else if (res.error)
                {
                    toast.error(res.error.message);
                }
            })
        }
    }, [post]);

    useEffect(() => {
        if (profile && commentCount !== undefined)
        {
            setIsLoading(false);
        }
    }, [profile, commentCount]);

    return <Link href={`/${post.id}`} className="w-full p-2 border-2 border-primary rounded-md flex flex-col gap-2 max-w-3xl transition hover:shadow-lg hover:bg-secondary bg-tertiary">
        {
            isLoading &&
            <>
            <div className="flex flex-row justify-between w-full items-center">
                <div className="flex flex-row items-center gap-2">
                    <Skeleton width={40} height={40} circle />
                    <Skeleton width={250} height={25} />
                </div>
            </div>
            <div className="flex flex-row items-center gap-4">
                <Skeleton height={40} width='100%' />
            </div>
            <Skeleton width={100} height={20} className="ml-auto" />
            <Skeleton width={100} height={20} className="ml-auto" />
            </>
        }
        {
            !isLoading && profile &&
            <>
            <div className="flex flex-row items-center gap-4 p-2">
                <Image src={profile.avatar} alt='avatar' width={40} height={40} className="rounded-md object-cover w-[40px] h-[40px]" />
                <span className=""><b>{profile.username}</b> <span>{new Date(post.createdAt).toLocaleDateString('en-au', { dateStyle: 'full' })}</span></span>
            </div>
            <div className="flex flex-row justify-between w-full items-center">
                <div className="flex flex-row items-center gap-2 p-4 text-lg font-bold text-zinc-100 bg-secondary w-full rounded-md">
                    {post.title}
                </div>
            </div>
            <div className="w-full flex flex-row justify-between">
                <section className="flex-grow flex flex-row flex-wrap gap-1">
                    {
                        post.tags.map((tag, index) => <Chip checked={false} key={index} color="yellow">{tag}</Chip>)
                    }
                </section>
                <section>
                    <div className="flex flex-row items-center gap-4 text-primary font-semibold">
                        {post.upvotes} Likes
                    </div>
                    <div className="pr-2 font-semibold text-sm">
                        {commentCount} Comment{commentCount !== 1 && 's'}
                    </div>
                </section>
            </div>
            </>
        }
    </Link>
}
