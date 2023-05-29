import { Profile } from "@/models/Profile";
import Image from "next/image";

interface ProfileCardProps
{
    profile: Profile;
}

export default function ProfileCard({ profile }: ProfileCardProps)
{
    // formatted date of when the created_at timestamp
    // was created.
    const formattedDate = new Date(profile.createdAt).toLocaleDateString('en-au', { dateStyle: 'long' });

    return <div className="w-96 h-60 bg-gradient-to-b from-black to-primary rounded-2xl p-1 flex items-center justify-center">
        <div className="flex-grow h-full bg-[#111111] rounded-2xl p-4 flex flex-col gap-4">
            <section className="w-full flex flex-row gap-2 items-start">
                <Image src={profile.avatar} width={100} height={100} alt="Profile Picture" className="object-cover rounded-md w-[100px] h-[100px]" />
                <div className="flex flex-col gap-1">
                    <span className="text-2xl font-semibold">{profile.username}</span>
                    <span className="text-sm font-semibold text-neutral-100"><span className="text-neutral-400 text-xs">Joined on&nbsp;<br /></span>{formattedDate}</span>
                </div>
            </section>
            <section className="w-full flex flex-row gap-2">
                {
                    profile.bio
                }
            </section>
        </div>
    </div>
}