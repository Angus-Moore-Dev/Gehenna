'use client';

import { MediaInfo, Post } from "@/utils/global.types";
import { createBrowserClient } from "@/utils/supabase/client";
import { Button, Loader, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import Image from "next/image";
import { useEffect, useState } from "react";

interface DraftPostsProps
{
    profileId: string;
    onSelectPost: (post: Post) => void;
}


export default function DraftPosts({ profileId, onSelectPost }: DraftPostsProps)
{
    const supabase = createBrowserClient();
    const [loading, setLoading] = useState(true);
    const [opened, { open, close }] = useDisclosure();
    const [postMetadata, setPostMetadata] = useState<{ 
        id: string, 
        title: string, 
        byline: string, 
        postImageURL: MediaInfo;
        createdAt: string 
    }[]>([]);


    async function fetchDraftPost(id: string)
    {
        const { data, error } = await supabase
        .from('post')
        .select('*')
        .eq('id', id)
        .single();

        if (error)
        {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to fetch draft', color: 'red' });
            return;
        }

        onSelectPost(data as Post);
    }


    useEffect(() => {
        async function fetchPosts()
        {
            setLoading(true);
            const { data, error } = await supabase
            .from('post')
            .select('id, title, byline, postImageURL, createdAt')
            .eq('userId', profileId)
            // .eq('isDraft', true) // Re-enable this when you're ready to support storing drafts.
            .order('createdAt', { ascending: true });

            if (error)
            {
                console.error(error);
                notifications.show({ title: 'Error', message: 'Failed to fetch drafts', color: 'red' });
                setLoading(false);
                return;
            }

            setPostMetadata(data.map(x => ({...x, postImageURL: x.postImageURL as MediaInfo })));
            setLoading(false);
        }

        if (opened)
            fetchPosts();
    }, [opened]);


    return <>
        <Button onClick={open} className="w-fit" variant="light">
            Select Draft Posts
        </Button>
        <Modal size={'lg'} padding={'lg'} title='Draft Posts' centered lockScroll opened={opened} onClose={close}>
            {
                loading &&
                <div className="p-4 w-full flex flex-col gap-5 items-center justify-center">
                    <Loader />
                    <p>Loading Drafts</p>
                </div>
            }
            {
                !loading &&
                <p className="pb-5">
                    Click on one of your drafts to get back to editing it. Drafts are saved automatically as you write them.
                </p>
            }
            {
                !loading && postMetadata.length === 0 &&
                <div className="p-4 w-full flex flex-col gap-5 items-center justify-center">
                    <p>No drafts found</p>
                </div>
            }
            <div className="flex flex-col gap-10">
                {
                    !loading &&
                    postMetadata.map(post => 
                        <div key={post.id} className="relative w-full bg-tertiary border-b-[1px] border-b-neutral-600 transition hover:bg-quaternary hover:cursor-pointer"
                            onClick={() => fetchDraftPost(post.id)}
                        >
                            {
                                !post.postImageURL.url &&
                                <div className="w-full h-[250px] bg-quaternary flex items-center justify-center">
                                    <p className="text-white text-3xl font-semibold">
                                        No Image
                                    </p>
                                </div>
                            }
                            {
                                post.postImageURL.url &&
                                <Image src={post.postImageURL.url} alt="" width={1000} height={450} quality={100} className="w-full h-[250px] object-center object-cover"  />
                            }
                            <div className="p-4 px-8 text-white z-20 flex flex-col gap-3">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="font-semibold">
                                        {post.title}
                                    </span>
                                    <small className="text-xs text-neutral-400">
                                        Started On {new Date(post.createdAt).toLocaleDateString()}
                                    </small>
                                </div>
                                <small>
                                    {post.byline}
                                </small>
                            </div>
                        </div>)
                }
            </div>
        </Modal>
    </>
}