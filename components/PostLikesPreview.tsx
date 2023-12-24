'use client';
import { Post } from "@/utils/global.types";
import { createBrowserClient } from "@/utils/supabase/client";
import { createServerClient } from "@/utils/supabase/server";
import { Loader } from "@mantine/core";
import { HeartIcon } from "lucide-react";
import { useEffect, useState } from "react";


export default function PostLikesPreview({ post }: { post: Post })
{
    const supabase = createBrowserClient();
    const [count, setCount] = useState<number>();
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        const fetchLikes = async () =>
        {
            const { data, count, error } = await supabase
            .from('postLikes')
            .select('*', { count: 'exact' })
            .eq('postId', post.id);

            if (error)
            {
                return;
            }

            const user = (await supabase.auth.getUser()).data.user;
            setLiked(data && data.some(like => user && user.id === like.userId));
            setCount(count ? count : 0);
        };

        fetchLikes();
    }, [supabase]);

    return <button className={`flex flex-row items-center px-3 py-1 rounded-full border-[1px] ${liked ? 'border-red-500 bg-red-400 bg-opacity-10' : 'border-neutral-600'} ml-auto`}>
        <HeartIcon size={12} className={`mr-2 ${liked && 'text-red-500'}`} />
        {
            count === undefined &&
            <Loader size={14} className="my-[2px]" />
        }
        {
            count !== undefined &&
            <small className={`${liked && 'text-red-500'} font-bold`}>
                {count ? count : 0}
            </small>
        }
    </button>
}