import { Modal, TypographyStylesProvider } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import NewPostBox from "./NewPostBox";
import { Startup } from "@/models/Startup";
import { User } from "@supabase/supabase-js";
import { Post } from "@/models/Post";
import CommonButton from "./CommonButton";
import { useEffect, useState } from "react";
import { clientDb } from "@/lib/db";
import { toast } from "react-toastify";

interface DraftPostBoxProps
{
    user: User;
    startup?: Startup;
    draftPost: Post;
    parentClose: () => void;
}

export default function DraftPostBox({ user, startup, draftPost, parentClose }: DraftPostBoxProps)
{
    const [opened, { open, close }] = useDisclosure(false);
    const [post, setPost] = useState(draftPost);

    return <>
    <Modal opened={opened} onClose={close} centered size='xl'>
        <NewPostBox user={user} startup={startup} handleClose={() => close()} draftPost={draftPost} setDraftPost={(newPost) => setPost(newPost)} />
    </Modal>
    <div className="w-full flex flex-col bg-tertiary p-4 transition hover:bg-quaternary hover:cursor-pointer">
        <section className="flex flex-row gap-2 items-end w-full border-b-2 border-b-primary pb-2 mb-2">
            <span className="font-semibold text-xl flex-grow" onClick={open}>{post.title}</span>
            <small onClick={open}>Created {new Date(post.createdAt).toLocaleDateString('en-au', { dateStyle: 'full' })}</small>
            <CommonButton text="Delete Draft" onClick={async () => {
                const res = await clientDb.from('draftPost').delete().eq('id', post.id);
                if (res.error)
                {
                    toast.error(res.error.message);
                }
                else
                {
                    toast.success('Draft post deleted');
                    close();
                    parentClose();
                }
            }} className="ml-auto bg-red-500 hover:bg-red-600 text-sm" />
        </section>
        <TypographyStylesProvider onClick={open}>
            <div dangerouslySetInnerHTML={{ __html: post.content.slice(0, 192) }} />
        </TypographyStylesProvider>
    </div>
    </>
}