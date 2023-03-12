import { User } from "@supabase/supabase-js";
import Image from "next/image";

interface AppNavbarProps
{
    user: User | undefined;
}

export default function AppNavbar({ user }: AppNavbarProps)
{
    return (
        <div className="w-full h-14 p-0 md:px-32 bg-neutral-100 flex flex-row items-center justify-center md:justify-start">
            <section>
                <Image src='/logo.png' width='300' height='250' alt='logo' />
            </section>
        </div>
    )
}