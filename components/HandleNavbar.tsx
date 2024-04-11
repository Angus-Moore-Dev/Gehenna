import { Button } from "@mantine/core";
import { LogIn, PlusIcon, RssIcon, ShareIcon } from 'lucide-react';
import Link from "next/link";
import { Profile } from "@/utils/global.types";
import Image from "next/image";
import { createServerClient } from "@/utils/supabase/server";
import { PersonIcon } from "@radix-ui/react-icons";

export default async function HandleNavbar({ profile }: { profile: Profile })
{
    const supabase = createServerClient();
    const user = (await supabase.auth.getUser()).data.user;

    return <div className="fixed z-50 w-full grid grid-rows-2 md:grid-rows-1 gap-4 
    md:gap-0 md:grid-cols-3 bg-secondary bg-opacity-70 backdrop-blur-md border-b-[1px] border-neutral-600 py-2.5">
        <div className="hidden md:flex md:pl-8 items-center gap-4">
            {
                profile.avatar &&
                <Link href={`/${profile.handle}`} className="w-fit">
                    <Image src={profile.avatar} alt="profile picture" width={250} height={250} style={{ width: 40, height: 40, objectFit: 'cover' }} className="object-cover rounded-full" />
                </Link>
            }
            {
                user && user.id === profile.id &&
                <Link href='/publish' className="w-fit">
                    <Button>
                        <PlusIcon className="mr-2" />
                        Write New Post
                    </Button>
                </Link>
            }
        </div>
        <div className="flex items-center justify-center gap-4">
            <Link href='/' className="w-fit transition hover:drop-shadow-lg">
                <span className="text-3xl font-bold">{profile.name}</span>
            </Link>
        </div>
        <div className="min-w-fit flex flex-col md:flex-row items-center md:justify-end md:pr-8 gap-2">
            <Button color="dark">
                <ShareIcon className="mr-2" />
                Share
            </Button>
            {/* <Button>
                <RssIcon className="mr-2" />
                Subscribe
            </Button> */}
            {
                !user &&
                <Link href='/auth' className="w-fit" target="_blank">
                    <Button>
                        <LogIn className="mr-2" />
                        Sign In
                    </Button>
                </Link>
            }
            {
                user &&
                <Link href={'/auth'} className="w-fit" target="_blank">
                    <Button>
                        <PersonIcon className="mr-2" />
                        My Account
                    </Button>
                </Link>
            }
        </div>
    </div>
}