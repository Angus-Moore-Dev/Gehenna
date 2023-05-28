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
import { IconPhoto } from "@tabler/icons-react";

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

    return <Link href={`/${post.id}`} className="w-[400px] h-[666px] group">
        {
            isLoading &&
            <div className="w-full h-full flex flex-col bg-tertiary">
                <Skeleton width='400px' height='450px' className="w-[400px] h-[450px] object-cover" />
                <div className="flex flex-col px-4 py-2">
                    <Skeleton width='400px' height='40px' className="w-full mt-2" />
                    <div className="flex flex-row gap-2">
                        <Skeleton width='40px' height='40px' className="w-[40px] h-[40px] rounded-full mt-2" />
                        <section className="flex-grow flex flex-row">
                            <div className="flex flex-col gap-1 flex-grow">
                                <Skeleton width='100px' height='20px' className="mt-2" />
                                <Skeleton width='75px' height='20px' className="mt-2" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <Skeleton width='100px' height='20px' className="mt-2" />
                                <Skeleton width='75px' height='20px' className="mt-2 ml-auto" />
                            </div>
                        </section>
                    </div>
                </div>
                <div className="flex flex-row flex-wrap gap-2 px-4">
                    <Skeleton width='90px' height='25px' className="mt-2 rounded-xl" />
                    <Skeleton width='150px' height='25px' className="mt-2 rounded-xl" />
                    <Skeleton width='125px' height='25px' className="mt-2 rounded-xl" />
                </div>
            </div>
        }
        {
            !isLoading && profile &&
            <>
            <div className="w-full h-full bg-tertiary rounded-md overflow-hidden transition">
                {
                    post.postImageURL.url &&
                    <Image src={post.postImageURL?.url} alt='' width={400} height={450} className="w-[400px] h-[450px] object-cover" />
                }
                {
                    !post.postImageURL.url &&
                    <IconPhoto className="w-[400px] h-[450px] object-cover transition bg-quaternary" color="#272727" />
                }
                <section className="w-full h-full flex flex-col gap-1 transition group-hover:bg-primary-light">
                    <section className="flex flex-row gap-4 h-16 transition p-2 px-4 rounded">
                        <span className="text-xl font-bold text-white">{post.title.length > 64 ? `${post.title.slice(0, 64)}...` : post.title}</span>
                    </section>
                    <section className="w-full flex flex-row items-center p-2 px-4">
                        <section className="flex-grow flex flex-row items-center gap-2">
                            <Image src={profile.avatar} width={40} height={40} className="rounded-md w-[40px] h-[40px] object-cover" alt='profile' />
                            <div className="flex flex-col gap-1">
                                <span className="text-neutral-200 font-semibold group-hover:text-white">{profile.username}</span>
                                <span className="text-neutral-500 text-sm group-hover:text-white">{new Date(post.createdAt).toLocaleDateString('en-au', { dateStyle: 'full' })}</span>
                            </div>
                        </section>
                        <section className="flex flex-col items-end">
                            <span className="text-primary-light font-semibold group-hover:text-white">{post.upvotes.toLocaleString()} Likes</span>
                            <small className="text-neutral-200 font-semibold group-hover:text-white">{commentCount} Comments</small>
                        </section>
                    </section>
                    <section className="flex flex-row flex-wrap items-center gap-2 px-4">
                        {
                            post.tags.slice(undefined, 3).map(tag => <Chip key={tag} checked={false} className="text-white">{tag}</Chip>)
                        }
                        {
                            post.tags.length > 3 && <small className="text-neutral-500 group-hover:text-white">+{post.tags.length - 3} more</small>
                        }
                    </section>
                    {/* <section className="flex flex-row items-center gap-4 p-2">
                        <span className="text-primary transition group-hover:text-white font-semibold">{post.upvotes.toLocaleString()} Likes</span>
                    </section> */}
                </section>
            </div>
            </>
        }
    </Link>
}
