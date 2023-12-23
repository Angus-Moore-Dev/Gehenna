'use client';

import { Post, Profile } from "@/utils/global.types";
import { createBrowserClient } from "@/utils/supabase/client";

interface PostCommentsProps
{
    post: Post;
}

export default function PostComments({ post }: PostCommentsProps)
{
    const supabase = createBrowserClient();
    /*
        Here is my general thinking for how comments should load.
        The user should scroll down, loading about 20 comments at a time.
        We should track how many comments there are by fetching the total number of comments for this post
        alongside the data. We should also fetch the total number of likes for each comment.
    */

    return <>
    
    </>
}