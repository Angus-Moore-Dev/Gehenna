import { Button } from "@mantine/core";

interface CommonButtonProps
{
    text: string;
    onClick: () => void;
    className?: string;
}

export default function CommonButton({ text, onClick, className }: CommonButtonProps)
{
    return <Button onClick={onClick} className={`${className} w-fit text-secondary bg-primary transition hover:bg-amber-400 rounded-md`}>{text}</Button>
}