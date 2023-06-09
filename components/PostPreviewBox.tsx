import { clientDb } from "@/lib/db";
import { Post } from "@/models/Post";
import { Profile } from "@/models/Profile";
import { Chip, Loader, Skeleton } from "@mantine/core";
import { RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Image from "next/image";
import { IconPhoto } from "@tabler/icons-react";
import { Startup } from "@/models/Startup";

interface PostPreviewBoxProps
{
    post: Post;
}

export default function PostPreviewBox({ post }: PostPreviewBoxProps)
{
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<Profile>();
    const [commentCount, setCommentCount] = useState<number>();
    const [upvotes, setUpvotes] = useState<number>();
    const [startup, setStartup] = useState<Startup | null>();

    useEffect(() => {
        if (post)
        {
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
            });

            clientDb.from('reactions').select('upvote').eq('postId', post.id).then(async res => {
                
                if (res.data)
                {
                    const reactions = res.data as { upvote: boolean }[];

                    const totalLikes = reactions.filter(reaction => reaction.upvote).length;
                    const totalDislikes = reactions.filter(reaction => !reaction.upvote).length;
                    setUpvotes(totalLikes - totalDislikes);
                }
                else
                {
                    setUpvotes(0);
                }
            });

            if (post.startupId)
            {
                clientDb.from('startups').select('id, name, avatar').eq('id', post.startupId).single().then(async ({ data, error }) => {
                    if (error)
                    {
                        toast.error(error.message);
                    }
                    else if (data)
                    {
                        setStartup(data as Startup);
                    }
                });
            }
        }
    }, [post]);

    useEffect(() => {
        if (profile && commentCount !== undefined && upvotes !== undefined)
        {
            if (post.startupId)
            {
                if (startup)
                {
                    setIsLoading(false);
                }
            }
            else
            {
                setIsLoading(false);
            }
        }
    }, [profile, commentCount, upvotes, startup]);

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
            !isLoading && profile && upvotes !== undefined && commentCount !== undefined &&
            <>
            <div className="w-full h-full bg-tertiary rounded-md overflow-hidden transition relative">
                {
                    post.postImageURL.url &&
                    <Suspense fallback={<Skeleton width={400} height={666} className="w-[400px] h-[666px] absolute z-0" />}>
                        <Image src={post.postImageURL?.url} alt='' width={400} height={666} className="w-[400px] h-[666px] object-cover absolute z-0" />
                    </Suspense>
                }
                {
                    !post.postImageURL.url &&
                    <IconPhoto className="w-[400px] h-[450px] object-cover transition bg-quaternary" color="#272727" />
                }
                <section className="w-full h-full flex flex-col gap-1 transition bg-secondary bg-opacity-50 backdrop-blur-md group-hover:bg-tertiary group-hover:bg-opacity-40 z-10 mt-auto absolute top-[450px]">
                    <section className="flex flex-row gap-4 h-16 transition p-2 px-4 rounded">
                        <span className="text-xl font-bold text-white">{post.title.length > 64 ? `${post.title.slice(0, 64)}...` : post.title}</span>
                    </section>
                    <section className="w-full flex flex-row items-center p-2 px-4">
                        <section className="flex-grow flex flex-row items-center gap-2">
                            <Suspense fallback={<Skeleton width={40} height={40} className="rounded-full w-[40px] h-[40px]" />}>
                                {
                                    !startup &&
                                    <Image src={profile.avatar} width={40} height={40} className="rounded-md w-[40px] h-[40px] object-cover" alt='profile' />
                                }
                                {
                                    startup &&
                                    <Image src={startup.avatar} width={40} height={40} className="rounded-md w-[40px] h-[40px] object-cover" alt='profile' />
                                }
                            </Suspense>
                            <div className="flex flex-col gap-1">
                                {
                                    !startup &&
                                    <span className="text-neutral-200 font-semibold group-hover:text-white">{profile.username}</span>
                                }
                                {
                                    startup &&
                                    <span className="text-neutral-200 font-semibold group-hover:text-white">{startup.name}</span>
                                }
                                <span className="text-neutral-300 text-sm group-hover:text-white">{new Date(post.createdAt).toLocaleDateString('en-au', { dateStyle: 'full' })}</span>
                            </div>
                        </section>
                        <section className="flex flex-col items-end">
                            <span className="text-primary-light font-semibold group-hover:text-white">{upvotes} Like{upvotes === 0 || upvotes > 1 || upvotes < 0 ? 's' : ''}</span>
                            <small className="text-neutral-200 font-semibold group-hover:text-white">{commentCount} Comment{commentCount === 0 || commentCount > 1 ? 's' : ''}</small>
                        </section>
                    </section>
                    <section className="flex flex-row flex-wrap items-center gap-1.5 px-4">
                        {
                            post.tags.slice(undefined, 3).map(tag => <Chip key={tag} checked={false} className="text-white">{tag}</Chip>)
                        }
                        {
                            post.tags.length > 3 && <small className="text-neutral-500 group-hover:text-white">+{post.tags.length - 3} more</small>
                        }
                    </section>
                </section>
            </div>
            </>
        }
    </Link>
}
