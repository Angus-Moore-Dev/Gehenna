import { Gehenna } from "@/components/Gehenna";
import Link from "next/link";

export default function NotFound()
{
    return <div className="w-full flex-grow flex flex-col gap-4 max-w-3xl mx-auto py-8 items-center">
        <Link href='/'>
            <Gehenna />
        </Link>
        <div className="flex-grow flex flex-col items-center justify-center gap-2">
            <p className="text-4xl">Page Not Found</p>
            <p>This page does not exist.</p>
        </div>
    </div>
}