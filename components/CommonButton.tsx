import { Button } from "@mantine/core";

interface CommonButtonProps
{
    text: string;
    onClick: () => void;
    className?: string;
}

export default function CommonButton({ text, onClick, className }: CommonButtonProps)
{
    return <Button onClick={onClick} className={`${className} w-fit bg-primary transition hover:bg-primary-light rounded-md text-white`}>{text}</Button>
}