'use client';

import { Chip, Skeleton } from "@mantine/core";
import Link from "next/link";
import { Suspense } from "react";
import Image from "next/image";
import { IconPhoto } from "@tabler/icons-react";
import { MediaInfo, Post, Profile } from "@/utils/global.types";

interface PostPreviewBoxProps
{
    post: { id: string, title: string, postImageURL: MediaInfo, tags: string[], createdAt: string };
    profile: Profile;
}

export default function PostPreviewBox({ post, profile }: PostPreviewBoxProps)
{

    return <Link href={`p/${post.id}`} className="w-[400px] h-[666px] group">
        {/* {
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
                        </section>
                    </div>
                </div>
                <div className="flex flex-row flex-wrap gap-2 px-4">
                    <Skeleton width='90px' height='25px' className="mt-2 rounded-xl" />
                    <Skeleton width='150px' height='25px' className="mt-2 rounded-xl" />
                    <Skeleton width='125px' height='25px' className="mt-2 rounded-xl" />
                </div>
            </div>
        } */}
        <div className="w-full h-full bg-tertiary rounded-md overflow-hidden transition relative">
            {
                post.postImageURL.url &&
                <Suspense fallback={<Skeleton width={400} height={666} className="w-[400px] h-[666px] absolute z-0" />}>
                    <Image src={post.postImageURL.url} alt='' width={400} height={666} className="w-[400px] h-[666px] object-cover absolute z-0" />
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
                            <Image src={profile.avatar} width={40} height={40} className="rounded-md w-[40px] h-[40px] object-cover" alt='profile' />
                        </Suspense>
                        <div className="flex flex-col gap-1">
                            <span className="text-neutral-200 font-semibold group-hover:text-white">{profile.username}</span>
                            <span className="text-neutral-300 text-sm group-hover:text-white">{new Date(post.createdAt).toLocaleDateString('en-au', { dateStyle: 'full' })}</span>
                        </div>
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
    </Link>
}
