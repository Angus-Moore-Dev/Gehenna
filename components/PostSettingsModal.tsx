import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSettings } from "@tabler/icons-react";
import DeletePostModal from "./DeletePostModal";

interface PostSettingsModalProps
{
    postId: string;
}

export default function PostSettingsModal({ postId }: PostSettingsModalProps)
{

    const [ opened, { open, close } ] = useDisclosure(false);

    return <>
    <Modal opened={opened} onClose={close} title='Post Settings' centered size='lg'>
        <DeletePostModal postId={postId} />
    </Modal>
    <button className='text-primary transition hover:text-primary-light'
    onClick={open}>
        <IconSettings />
    </button>
    </>;
}