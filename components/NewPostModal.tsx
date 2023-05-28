import { useState } from "react";
import CommonButton from "./CommonButton";
import { Modal } from "@mantine/core";
import NewPostBox from "./NewPostBox";
import { User } from "@supabase/supabase-js";
import { useDisclosure } from "@mantine/hooks";

interface NewPostModalProps
{
    user: User;
}

export default function NewPostModal({ user }: NewPostModalProps)
{
    const [createNewPost, setCreateNewPost] = useState(false);
    const [opened, { open, close }] = useDisclosure(false);

    return <>
    <Modal opened={opened} onClose={close} centered size='xl'>
        <NewPostBox user={user} />
    </Modal>
    <CommonButton onClick={open} className='w-full max-w-[550px] py-2 text-xl font-bold text-white' text='Create New Post' />
    </>
}