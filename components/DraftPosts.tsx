import { Button, Loader, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import CommonButton from "./CommonButton";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Post } from "@/models/Post";
import { clientDb } from "@/lib/db";
import { toast } from "react-toastify";
import DraftPostBox from "./DraftPostBox";

export default function DraftPosts({ user }: { user: User })
{
    const [opened, { open, close }] = useDisclosure(false);
    const [draftPosts, setDraftPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => 
    {
        if (opened)
        {
            setIsLoading(true);
            clientDb.from('draftPost').select('*').order('createdAt', { ascending: true }).then(async ({ data, error }) => {
                if (!error && data)
                {
                    setDraftPosts(data as Post[]);
                    setIsLoading(false);
                }
                else
                {
                    toast.error(error?.message ?? 'Failed to load draft posts');
                }
            });
        }
    }, [opened]);

    return <>
    <Modal opened={opened} onClose={close} centered size='xl' title="Draft Posts">
        <div className='w-full flex flex-col gap-4 items-center scrollbar'>
            {
                isLoading && <Loader />
            }
            {
                !isLoading &&
                draftPosts.map((post, index) => <DraftPostBox key={index} user={user} draftPost={post} parentClose={() => close()} />)
            }
            {
                draftPosts.length === 0 && !isLoading &&
                <div className='text-center text-gray-500'>
                    <h1 className='text-2xl font-bold'>No draft posts</h1>
                </div>
            }
        </div>
    </Modal>
    <Button color="blue" onClick={open}>
        Open Draft Posts
    </Button>
    </>
}