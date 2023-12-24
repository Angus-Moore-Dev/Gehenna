'use client';

import { Comment, Post } from "@/utils/global.types";
import { createBrowserClient } from "@/utils/supabase/client";
import { Loader } from "@mantine/core";
import { useEffect, useState } from "react";

interface PostCommentsProps
{
    post: Post;
}

export default function PostComments({ post }: PostCommentsProps)
{
    const supabase = createBrowserClient();
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorLoading, setErrorLoading] = useState(false);

    useEffect(() => {
        const fetchComments = async () =>
        {
            const { data, error } = await supabase
            .from('postComments')
            .select('*')
            .eq('postId', post.id);

            if (error)
            {
                setErrorLoading(true);
                setIsLoading(false);
            }
            else
            {
                setComments(data);
                setIsLoading(false);
            }
        };
        fetchComments();
    }, [supabase]);

    return <div className="w-full flex flex-col gap-4">
    {
        isLoading &&
        <Loader className="mx-auto my-4" />
    }
    {
        errorLoading &&
        <span className="my-4 text-center text-red-500 font-bold">
            Error loading comments.
        </span>
    }
    </div>
}