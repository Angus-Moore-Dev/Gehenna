import Navbar from "@/components/Navbar";
import { appDomain, appHttp } from "@/utils/appURL";
import { createServerClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";


export default async function ExploreAuthors()
{
    const supabase = createServerClient();
    const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('name', { ascending: true });

    if (!profiles && error)
        redirect('/500');

    return <div className="w-full flex flex-col items-center gap-10">
        <Navbar />
        <div className="w-full min-h-screen flex flex-col gap-10 items-center px-8">
            <span className="text-2xl font-bold w-full max-w-[1920px] pb-4 border-b-[1px] border-b-neutral-600">
                Explore Authors on <span className="text-primary">Gehenna</span>
                <br />
                <small className="text-neutral-500 font-light">
                    Check out the different people on Gehenna, each with their own unique views and opinions.
                </small>
            </span>
            <section className="w-full max-w-[1920px] grid grid-cols-4 gap-5 flex-wrap justify-center">
                {
                    profiles.map(profile => 
                    <Link href={`/${profile.handle}`}
                    target="_blank"
                    className='bg-tertiary rounded-md p-4 flex flex-col gap-4'>
                        <div className="w-full flex flex-row gap-5">
                            <Image src={profile.avatar} alt="Profile Picture" width={250} height={250} style={{ width: 96, height: 96, borderRadius: '9999' }} className="rounded-full" />
                            <div className="flex flex-col w-full">
                                <span className="text-2xl font-bold">
                                    {profile.name}
                                </span>
                                <small className="text-neutral-400">
                                    {profile.handle}.gehenna.app
                                </small>
                                <small className="font-light pt-1 my-1 border-t-[1px] border-t-neutral-600 line-clamp-2">
                                    {profile.bio}
                                </small>
                            </div>
                        </div>
                    </Link>)
                }
            </section>
        </div>
    </div>
}