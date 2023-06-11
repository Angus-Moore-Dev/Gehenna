import { Profile } from "@/models/Profile";
import Image from "next/image";
import Link from "next/link";

interface ProfileCardProps
{
    profile: Profile;
}

export default function ProfileCard({ profile }: ProfileCardProps)
{
    // formatted date of when the created_at timestamp
    // was created.
    const formattedDate = new Date(profile.createdAt).toLocaleDateString('en-au', { dateStyle: 'long' });

    return <div className="w-96 max-h-[450px] bg-gradient-to-b from-black to-primary rounded-2xl p-1 flex items-center justify-center shadow-md shadow-secondary">
        <div className="flex-grow h-full bg-[#111111] rounded-2xl flex flex-col gap-4">
            <section className="w-full flex flex-row gap-2 items-start flex-wrap relative p-2">
                {
                    !profile.profileBannerURL.url &&
                    <section className="w-full h-full absolute top-0 left-0 rounded-md bg-gradient-to-b from-black to-secondary z-10" />
                }
                {
                    profile.profileBannerURL.url &&
                    <Image id='profileCardBanner' src={profile.profileBannerURL.url} width={400} height={100} alt="Profile Banner" className="object-cover rounded-md w-full h-full absolute top-0 left-0" />
                }
                <section className="w-full flex flex-row gap-2 items-start flex-wrap z-20">
                    <Image src={profile.avatar} width={100} height={100} alt="Profile Picture" className="object-cover rounded-md w-[100px] h-[100px]" />
                    <div className="flex flex-col gap-1">
                        <span className="text-2xl font-semibold">{profile.username}</span>
                        <span className="text-sm font-semibold text-neutral-100"><span className="text-neutral-400 text-xs">Joined on&nbsp;<br /></span>{formattedDate}</span>
                    </div>
                </section>
            </section>
            <Link href={`/profile/${profile.handle}`} className="p-1 w-fit px-2 ml-4 bg-primary text-white hover:bg-primary-light rounded-md text-center text-xs">
                View Profile
            </Link>
            <section className="w-full flex flex-row gap-2 p-4">
                {
                    profile.bio
                }
            </section>
        </div>
    </div>
}