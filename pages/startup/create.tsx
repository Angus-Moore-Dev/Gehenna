import { Gehenna } from "@/components/Gehenna";
import Link from "next/link";

export default function CreateNewStartup()
{
    return <div className="flex-grow flex flex-col gap-4 mx-auto py-16 items-center max-w-3xl">
        <Link href='/'>
            <Gehenna />
        </Link>
    </div>
}