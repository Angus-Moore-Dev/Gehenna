'use client';

import { createBrowserClient } from "@/utils/supabase/client";
import { Loader } from "@mantine/core";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function PostCommentCount({ postId }: { postId: string })
{
    const supabase = createBrowserClient();
    const [commentCount, setCommentCount] = useState<number>();

    useEffect(() => {
        supabase
        .from('postComments')
        .select('*', { head: true, count: 'exact' })
        .eq('postId', postId)
        .single()
        .then(({ count }) => {
            if (count !== null)
                setCommentCount(count);
            else
                setCommentCount(0);
        });
    }, [supabase]);

    return <>
    {
        commentCount === undefined &&
        <Loader size={14} className="my-[2px]" />
    }
    {
        commentCount !== undefined &&
        <small>
            {commentCount}
        </small>
    }
    </>
}