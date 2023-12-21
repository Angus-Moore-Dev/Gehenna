import { Button } from "@mantine/core";
import { Gehenna } from "./Navbar";
import { LogIn, RssIcon, ShareIcon } from 'lucide-react';
import Link from "next/link";
import { Profile } from "@/utils/global.types";
import Image from "next/image";

export default async function HandleNavbar({ profile }: { profile: Profile })
{

    return <div className="w-full grid grid-rows-2 md:grid-rows-1 gap-4 md:gap-0 md:grid-cols-3 bg-secondary border-b-[1px] border-neutral-600 py-5">
        <div className="hidden md:flex md:pl-8 items-center">
            {
                profile.avatar &&
                <Link href='/' className="w-fit">
                    <Image src={profile.avatar} alt="profile picture" width={40} height={40} className="object-cover rounded-lg" />
                </Link>
            }
        </div>
        <div className="flex items-center justify-center gap-4">
            <Link href='/' className="w-fit transition hover:drop-shadow-lg">
                <span className="text-3xl font-bold">{profile.username}</span>
            </Link>
        </div>
        <div className="min-w-fit flex flex-col md:flex-row items-center md:justify-end md:pr-8 gap-2">
            <Button color="dark">
                <ShareIcon className="mr-2" />
                Share
            </Button>
            <Button>
                <RssIcon className="mr-2" />
                Subscribe
            </Button>
            <Link href={process.env.NODE_ENV === 'development' ? 'http://localhost:3000/auth' : 'https://gehenna.dev/auth'} className="w-fit">
                <Button>
                    <LogIn className="mr-2" />
                    Sign In
                </Button>
            </Link>
        </div>
    </div>
}