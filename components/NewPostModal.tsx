import { useState } from "react";
import CommonButton from "./CommonButton";
import { Modal } from "@mantine/core";
import NewPostBox from "./NewPostBox";
import { User } from "@supabase/supabase-js";
import { useDisclosure } from "@mantine/hooks";
import { Startup } from "@/models/Startup";

interface NewPostModalProps
{
    user: User;
    startup?: Startup;
}

export default function NewPostModal({ user, startup }: NewPostModalProps)
{
    const [opened, { open, close }] = useDisclosure(false);

    return <>
    <Modal opened={opened} onClose={close} centered size='xl'>
        <NewPostBox user={user} startup={startup} handleClose={() => close()} />
    </Modal>
    <CommonButton onClick={open} className='w-full max-w-[550px] py-2 text-lg font-bold text-white' text='Create New Post' />
    </>
}