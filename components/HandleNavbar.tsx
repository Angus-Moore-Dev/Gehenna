import { Button } from "@mantine/core";
import { LogIn, PlusIcon, User } from 'lucide-react';
import Link from "next/link";
import { Profile } from "@/utils/global.types";
import Image from "next/image";
import { createServerClient } from "@/utils/supabase/server";
import ShareButton from "./ShareButton";

export default async function HandleNavbar({ profile }: { profile: Profile })
{
    const supabase = createServerClient();
    const user = (await supabase.auth.getUser()).data.user;
    const profileName = (await supabase.from('profiles').select('name').eq('id', user?.id ?? '').single()).data;

    return <div className="fixed z-50 w-full grid grid-rows-2 md:grid-rows-1 gap-4 
    md:gap-0 md:grid-cols-3 bg-tertiary bg-opacity-70 backdrop-blur-md border-b-[1px] border-neutral-600 py-2.5">
        <div className="hidden md:flex md:pl-8 items-center gap-4">
            {
                profile.avatar &&
                <Link href={`/${profile.handle}`} className="w-fit">
                    <Image src={profile.avatar} alt="profile picture" width={250} height={250} style={{ width: 40, height: 40, objectFit: 'cover' }} className="object-cover rounded-full" />
                </Link>
            }
            {
                user && user.id === profile.id &&
                <Link href={`/${profile.handle}/publish`} className="w-fit">
                    <Button>
                        <PlusIcon className="mr-2" />
                        Write New Post
                    </Button>
                </Link>
            }
        </div>
        <div className="flex items-center justify-center gap-4">
            <Link href={`/${profile.handle}`} className="w-fit transition hover:drop-shadow-lg">
                <span className="text-3xl font-bold">{profile.name}</span>
            </Link>
        </div>
        <div className="min-w-fit flex flex-col md:flex-row items-center md:justify-end md:pr-8 gap-2">
            <ShareButton />
            {
                !user &&
                <Link href='/auth' className="w-fit" target="_blank">
                    <Button variant="subtle">
                        <LogIn className="mr-2" />
                        Sign In
                    </Button>
                </Link>
            }
            {
                user && profileName &&
                <Link href={'/profile'} className="w-fit" target="_blank">
                    <Button variant="subtle" leftSection={<User />}>
                        {profileName.name}
                    </Button>
                </Link>
            }
        </div>
    </div>
}