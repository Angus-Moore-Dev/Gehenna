import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSettings } from "@tabler/icons-react";
import DeletePostModal from "./DeletePostModal";
import EditPostModal from "./EditPostModal";
import { Post } from "@/models/Post";
import { Dispatch, SetStateAction } from "react";

interface PostSettingsModalProps
{
    post: Post;
}

export default function PostSettingsModal({ post }: PostSettingsModalProps)
{

    const [ opened, { open, close } ] = useDisclosure(false);

    return <>
    <Modal opened={opened} onClose={close} title='Post Settings' centered size='lg'>
        <div className="w-full flex flex-col gap-4">
            <EditPostModal post={post} parentOnClose={() => close()} />
            <DeletePostModal postId={post.id} />
        </div>
    </Modal>
    <button className='text-primary transition hover:text-primary-light'
    onClick={open}>
        <IconSettings />
    </button>
    </>;
}