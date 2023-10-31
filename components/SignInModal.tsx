import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import CommonButton from "./CommonButton";
import SignInForm from "./SignInForm";

export default function SignInModal()
{
    const [opened, { open, close }] = useDisclosure(false);

    return <>
    <Modal opened={opened} onClose={close} centered size='lg'>
        <SignInForm />
    </Modal>
    <CommonButton text='Angus Sign In' onClick={open} className="w-full max-w-[550px] py-1.5 text-lg text-black" />
    </>
}