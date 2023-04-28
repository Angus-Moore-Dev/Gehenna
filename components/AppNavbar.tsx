import { Profile } from "@/models/Profile";
import { User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";

interface AppNavbarProps
{
    user: User | undefined;
    profile: Profile | null;
}

export default function AppNavbar({ user, profile }: AppNavbarProps)
{
    return (
        <div className="w-full h-16 p-0 md:px-32 bg-secondary flex flex-row items-center justify-center md:justify-start py-4">
            <Link href='/' className="w-1/4">
                <Image src='/logo.png' width='200' height='200' alt='logo' />
            </Link>
            <section className="w-1/2 flex items-center justify-center">
                <input type='search' className="w-96 p-2 bg-tertiary text-center rounded" placeholder="Search Questions" />
            </section>
            <div className="w-1/4 flex flex-row items-center justify-end">
                {
                    profile &&
                    <span className="font-semibold">{profile.username}</span>
                }
            </div>
        </div>
    )
}