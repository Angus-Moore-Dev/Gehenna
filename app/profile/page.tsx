import Navbar from "@/components/Navbar";
import Avatar from "@/components/profile/Avatar";
import BioChange from "@/components/profile/BioChange";
import HandleChange from "@/components/profile/HandleChange";
import NameChange from "@/components/profile/NameChange";
import PasswordReset from "@/components/profile/PasswordReset";
import SignOut from "@/components/profile/SignOut";
import { MediaInfo } from "@/utils/global.types";
import { createServerClient } from "@/utils/supabase/server";
import { Input } from "@mantine/core";
import { Layers3Icon, ThumbsUpIcon } from "lucide-react";
import { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

export async function generateMetadata({ params }: { params: { postId: string }}, parent: ResolvingMetadata): Promise<Metadata>
{
    return {
        title: 'My Account | Gehenna',
        description: 'Manage your account settings here.',
    }
}


export default async function ProfileManagement()
{
    const supabase = createServerClient();
    const user = (await supabase.auth.getUser()).data.user;

    if (!user)
        redirect('/auth');

    const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

    if (!profile && error)
    {
        console.error('Failed to fetch profile::', error);
        redirect('/500');
    }

    const { count: totalPostsCount, error: totalPostCountError } = await supabase
    .from('post')
    .select('*', { count: 'exact', head: true })
    .eq('userId', profile.id);

    if (totalPostCountError)
    {
        console.error('Failed to fetch total post count::', totalPostCountError);
        redirect('/500');
    }

    const { count: totalLikesCount, error: totalLikesCountError } = await supabase
    .from('postLikes')
    .select('*', { count: 'exact', head: true })
    .eq('profiles.id', profile.id);

    return <div className="w-full min-h-screen flex flex-col gap-10 items-center">
        <Navbar />
        <div className="w-full max-w-2xl flex flex-col gap-5 px-8 md:px-0">
            {/* <Image src={(profile.profileBannerURL as MediaInfo).url} alt="Profile Banner" width={1000} height={300} className="max-h-[300px] w-full object-cover rounded-md" /> */}
            <section className="w-full flex flex-row gap-5 pb-5 border-b-[1px] border-b-neutral-600">
                <Avatar profile={profile} />
                <div className="flex flex-col gap-2 w-full">
                    <div className="w-full flex flex-row items-center justify-between">
                        <span className="text-2xl font-bold">
                            {profile.name}
                        </span>
                    </div>
                    <small className="font-light">
                        {profile.handle}.gehenna.app
                    </small>
                    <blockquote className="p-2 text-sm bg-tertiary rounded-sm font-light w-full">
                        {profile.bio || 'No bio provided.'}
                    </blockquote>
                </div>
            </section>
            <section className="flex flex-col pb-5 border-b-[1px] border-b-neutral-600">
                <span>
                    Account Statistics
                </span>
                <section className="w-full grid grid-cols-2 gap-2">
                    <div className="p-4 py-8 bg-tertiary rounded-md flex flex-col md:flex-row gap-2 items-center justify-center">
                        <Layers3Icon />
                        <span className="text-2xl font-bold text-center md:text-left">
                            {totalPostsCount} Posts
                        </span>
                    </div>
                    <div className="p-4 py-8 bg-tertiary rounded-md flex flex-col md:flex-row gap-2 items-center justify-center">
                        <ThumbsUpIcon />
                        <span className="text-2xl font-bold text-center md:text-left">
                            {totalLikesCount} Post Like{totalLikesCount !== 1 ? 's' : ''}
                        </span>
                    </div>
                </section>
            </section>
            <section className="flex flex-col pb-5 border-b-[1px] border-b-neutral-600">
                <span>
                    Account Management
                </span>
                <section className="w-full grid md:grid-cols-2 gap-2">
                    <section className="flex flex-col gap-5">
                        <NameChange profile={profile} />
                        <BioChange profile={profile} />
                    </section>
                    <section className="flex flex-col gap-5">
                        <HandleChange profile={profile} />
                        <PasswordReset />
                    </section>
                </section>
            </section>
            <SignOut />
        </div>
    </div>
}