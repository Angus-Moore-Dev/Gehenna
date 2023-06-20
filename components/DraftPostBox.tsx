import { Modal, TypographyStylesProvider } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import NewPostBox from "./NewPostBox";
import { Startup } from "@/models/Startup";
import { User } from "@supabase/supabase-js";
import { Post } from "@/models/Post";
import CommonButton from "./CommonButton";
import { useEffect, useState } from "react";

interface DraftPostBoxProps
{
    user: User;
    startup?: Startup;
    draftPost: Post;
}

export default function DraftPostBox({ user, startup, draftPost }: DraftPostBoxProps)
{
    const [opened, { open, close }] = useDisclosure(false);
    const [post, setPost] = useState(draftPost);

    return <>
    <Modal opened={opened} onClose={close} centered size='xl'>
        <NewPostBox user={user} startup={startup} handleClose={() => close()} draftPost={draftPost} setDraftPost={(newPost) => setPost(newPost)} />
    </Modal>
    <div className="w-full flex flex-col bg-tertiary p-4 transition hover:bg-quaternary hover:cursor-pointer" onClick={open}>
        <section className="flex flex-row gap-2 items-end w-full border-b-2 border-b-primary pb-2 mb-2">
            <span className="font-semibold text-xl">{post.title}</span>
            <small>Created {new Date(post.createdAt).toLocaleDateString('en-au', { dateStyle: 'full' })}</small>
        </section>
        <TypographyStylesProvider>
            <div dangerouslySetInnerHTML={{ __html: post.content.slice(0, 192) }} />
        </TypographyStylesProvider>
    </div>
    </>
}