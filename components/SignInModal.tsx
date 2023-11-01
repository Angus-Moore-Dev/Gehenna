import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import SignInForm from "./SignInForm";
import { Gehenna } from "./Gehenna";

export default function SignInModal()
{
    const [opened, { open, close }] = useDisclosure(false);

    return <>
    <Modal opened={opened} onClose={close} centered size='lg'>
        <SignInForm />
    </Modal>
    <button onClick={open}>
        <Gehenna />
    </button>
    </>
}