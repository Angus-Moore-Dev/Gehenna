'use client';

import { Post } from "@/utils/global.types";
import { createBrowserClient } from "@/utils/supabase/client";
import { notifications } from "@mantine/notifications";
import { HeartIcon } from "lucide-react";
import { useState } from "react";




export default function PostLikes({ 
    post, 
    userId, 
    postLikes, 
    isAlreadyLiked,
}: { 
    post: Post, 
    userId: string, 
    postLikes: number, 
    isAlreadyLiked: boolean,
})
{
    const supabase = createBrowserClient();
    const [likes, setLikes] = useState(postLikes);
    const [isLiked, setIsLiked] = useState(isAlreadyLiked);

    const likePost = async () =>
    {
        const { error } = await supabase
        .from('postLikes')
        .insert({
            postId: post.id,
            userId,
            authorId: post.userId
        });

        if (error)
        {
            notifications.show({
                title: 'Error',
                message: error.message,
                color: 'red',
            });
            return;
        }

        setLikes(likes + 1);
        setIsLiked(true);
    };

    const unlikePost = async () =>
    {
        const { error } = await supabase
        .from('postLikes')
        .delete()
        .match({
            postId: post.id,
            userId
        });

        setLikes(likes - 1);
        setIsLiked(false);
    };

    return <button className={`flex flex-row items-center px-4 py-2 rounded-full border-[1px] ${isLiked ? 'border-red-500 bg-red-400 bg-opacity-10' : 'border-neutral-600'}`}
    onClick={() => !isLiked ? likePost() : unlikePost()}>
        <HeartIcon size={20} className={`mr-2 ${isLiked && 'text-red-500'}`} />
        <small className={`${isLiked && 'text-red-500'} font-bold`}>
            {likes}
        </small>
    </button>
}

