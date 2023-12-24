'use client';

import { Comment, Post } from "@/utils/global.types";
import { createBrowserClient } from "@/utils/supabase/client";
import { Button, Loader, Textarea } from "@mantine/core";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

interface PostCommentsProps
{
    post: Post;
    user: User | null
}

export default function PostComments({ post, user }: PostCommentsProps)
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
    {
        !isLoading &&
        <>
        {
            comments.length === 0 &&
            <span className="my-4 text-center text-neutral-500 font-light">
                No comments yet.
            </span>
        }
        {
            user &&
            <>
                <span>
                    Leave a comment
                </span>
                <Textarea placeholder="Here's what I think..." className="-mt-2" />
                <Button className="ml-auto -mt-2">
                    Post Comment
                </Button>
            </>
        }
        </>
    }
    </div>
}