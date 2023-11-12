import { Gehenna } from "@/components/Gehenna";
import Link from "next/link";

export default function NotFound()
{
    return <div className="flex-grow w-full flex flex-col gap-4 items-center justify-center ">
        <Link href='/'>
            <Gehenna />
        </Link>
        <p className="text-4xl">Page Not Found</p>
        <p>This page does not exist.</p>
    </div>
}