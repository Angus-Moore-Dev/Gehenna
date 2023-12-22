'use client';

import { MediaInfo, Post, PostTopic, Profile } from "@/utils/global.types";
import { Tabs } from "@mantine/core";
import { HeartIcon, MessageCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";


interface HandlePostsProps
{
    postTopics: PostTopic[];
    profile: Profile;
    posts: {
        id: string;
        title: string;
        postImageURL: MediaInfo;
        createdAt: string;
        byline: string;
        topicId: string | null;
    }[];
}

export default function HandlePosts({ posts, profile, postTopics }: HandlePostsProps)
{
    const [activeTab, setActiveTab] = useState('all');

    return <>
    <div className="w-full max-w-4xl">
        <Tabs defaultValue="home" value={activeTab} onChange={e => setActiveTab(e ?? 'home')}>
            <Tabs.List grow justify="start">
                <Tabs.Tab value='all'>All</Tabs.Tab>
                {
                    postTopics.map(topic => <Tabs.Tab key={topic.id} value={topic.id}>{topic.title}</Tabs.Tab>)
                }
            </Tabs.List>
        </Tabs>
    </div>
    <div className="w-full max-w-4xl flex flex-col gap-4">
        {
            posts
            .filter(post => activeTab === post.topicId || activeTab === 'all')
            .map(post =>
            <Link
            href={`p/${post.id}`}
            key={post.id}
            className="bg-secondary transition hover:bg-tertiary border-[1px] border-neutral-600 rounded-md flex flex-row gap-2">
                <Image
                src={(post.postImageURL as MediaInfo).url} alt="" width={250} height={150} style={{ objectFit: 'cover', width: 250, height: 175 }} className="object-cover bg-tertiary min-w-[250px] max-h-[175px] h-full rounded-l-md" />
                <div className="flex-grow flex flex-col gap-2 p-4">
                    <span className="text-2xl font-bold">
                        {post.title}
                    </span>
                    <small>
                        {post.byline}
                    </small>
                    <div className="flex flex-row gap-2 items-center mt-auto">
                        <small>
                            {
                                postTopics.some(x => x.id === post.topicId) ?
                                <>{postTopics.find(x => x.id === post.topicId)?.title}&nbsp;&middot;&nbsp;</> :
                                ''
                            }
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
    </>
}