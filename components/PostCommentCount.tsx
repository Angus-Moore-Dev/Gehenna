'use client';

import { createBrowserClient } from "@/utils/supabase/client";
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
        <Loader2 size={20} className=" text-primary animate-spin" />
    }
    {
        commentCount !== undefined &&
        <small>
            {commentCount}
        </small>
    }
    </>
}