import { Loader, Modal } from "@mantine/core";
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
                draftPosts.map((post, index) => <DraftPostBox key={index} user={user} draftPost={post} />)
            }
        </div>
    </Modal>
    <CommonButton onClick={open} className='w-full max-w-[550px] text-white bg-blue-700 hover:bg-blue-500 -mb-2' text='Open Draft Posts' />
    </>
}