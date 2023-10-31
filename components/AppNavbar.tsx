import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";



export default function AppNavbar()
{
    return <nav className="w-full flex flex-row items-center py-3 px-32 bg-[#121212] border-b-2">
        <Link href='/'>
            <Image src='/gehenna_logo.png' alt="Gehenna" width={250} height={64} quality={100} />
        </Link>
    </nav>
}