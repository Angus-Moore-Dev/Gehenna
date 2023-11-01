import { useState } from "react";
import CommonButton from "./CommonButton";
import { Button, Modal } from "@mantine/core";
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
    const [isChanged, setIsChanged] = useState(false);

    const [alertOpened, { open: alertOpen, close: alertClose }] = useDisclosure(false);

    return <>
    <Modal opened={opened} onClose={() => {
        if (!isChanged)
            close();
        else
            alertOpen();
    }} centered size='xl'>
        <NewPostBox user={user} startup={startup} handleClose={() => {
            setIsChanged(false);
            close();
        }} setIsChanged={setIsChanged} />
    </Modal>
    <Modal opened={alertOpened} onClose={alertClose} centered size='sm' className="background-opacity-60">
        <div className="p-2">
            <h1 className="text-xl font-bold">
                Are You Sure?
            </h1>
            <p>
                You have unsaved changes that you will lose if you continue.
            </p>
            <Button onClick={() => alertClose()} className="mt-2 mr-2" variant="light">
                Cancel
            </Button>
            <Button onClick={() => {
                setIsChanged(false);
                close();
                alertClose();
            }} className="mt-2" variant='outline'>
                Continue
            </Button>
        </div>
    </Modal>
    <CommonButton onClick={open} className='w-full max-w-[550px] py-2 text-lg font-bold text-white' text='Create New Post' />
    </>
}