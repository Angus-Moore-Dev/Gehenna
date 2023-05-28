import { Loader, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import CommonButton from "./CommonButton";
import { clientDb } from "@/lib/db";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { AttachedFile } from "@/models/Post";

interface DeletePostModalProps
{
    postId: string;
}

export default function DeletePostModal({ postId }: DeletePostModalProps)
{
    const router = useRouter();
    const [ opened, { open, close } ] = useDisclosure(false);
    const [isDeleting, setIsDeleting] = useState(false);

    return <>
    <Modal opened={opened} onClose={close} title='Are You Sure?' centered size='sm'>
        <span>Deleting a post is permanent, and all comments and reactions will be removed.</span>
        {
            !isDeleting &&
            <div className="w-full flex flex-row gap-4">
                <CommonButton text='Cancel' onClick={close} className='w-full mt-4' />
                <CommonButton text='Delete Post' onClick={async () => {
                    setIsDeleting(true);

                    const postFiles = (await clientDb.from('post').select('id, attachedFileURLs, postImageURL').eq('id', postId).single()).data as { id: string, attachedFileURLs: AttachedFile[], postImageURL: AttachedFile };
                    const allFilesInPost: AttachedFile[] = [...postFiles.attachedFileURLs ?? [], postFiles.postImageURL ?? []];

                    const urls: string[] = [];
                    for (const file of allFilesInPost)
                    {
                        const fileName = file.url.split('post_files/')[1];
                        urls.push(fileName);
                    }

                    const deletionRes = await clientDb.storage.from('post_files').remove(urls);
                    const res = await clientDb.from('post').delete().eq('id', postId);

                    if (res.error) toast.error(res.error.message);
                    else
                    {
                        toast.success('Post deleted successfully.');
                        setIsDeleting(false);
                        router.push('/');
                        close();
                    }
                }} className='w-full mt-4 bg-red-500 hover:bg-red-600' />
            </div>
        }
        {
            isDeleting &&
            <Loader className="mx-auto mt-4" />
        }
    </Modal>
    <CommonButton text="Delete Post" onClick={open} className="w-full bg-red-500 hover:bg-red-600" />
    </>;
}