import Navbar from "@/components/Navbar";
// import TotalUsersCount from "@/components/TotalUsersCount";
import { createServerClient } from "@/utils/supabase/server";
import { Button } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

export default async function HomePage()
{
	const supabase = createServerClient();
	const user = (await supabase.auth.getUser()).data.user;
    const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('createdAt', { ascending: true });


	return <>
	<div className="w-full min-h-screen flex flex-col items-center gap-10">
		<Navbar />
		<div className="w-full max-w-4xl flex flex-col items-center gap-5">
			<p className="text-4xl font-light">
				Where the words end, the world ends.
			</p>
			<p className="text-center">
				Gehenna is a free platform for people to write about whatever they want. It&apos;s a small place.
				<br />
				<br />
				The Internet gets smaller every year and it&apos;s a sad thing to witness. As you scroll down, you will see
				a list of real names from real people, writing real things. Gehenna does not allow slop content that is a cacophony of SEO optimised,
				hilariously perfect "stories" that are half-written using ChatGPT and further contributing to the stench that eminates from the modern Internet.
			</p>
			{
				!user &&
				<Link href='/auth'>
					<Button variant="light">
						Join Gehenna
					</Button>
				</Link>
			}
			{
				user &&
				<span className="text-neutral-400 font-semibold">
					Welcome back, {user.email}
				</span>
			}
			{/* <TotalUsersCount /> */}
		</div>
		{
			profiles &&
			<section className="w-full max-w-4xl grid grid-cols-2 gap-5 flex-wrap justify-center">
				<span className="col-span-2 font-semibold text-lg pb-2 border-b-[1px] border-b-primary">
					Authors on Gehenna
				</span>
                {
                    profiles.map(profile => 
                    <Link href={`/${profile.handle}`}
					key={profile.id}
                    target="_blank"
                    className='bg-tertiary rounded-md p-4 flex flex-col gap-4'>
                        <div className="w-full flex flex-row gap-5">
                            <Image src={profile.avatar} alt="Profile Picture" width={250} height={250} style={{ width: 96, height: 96, borderRadius: '9999' }} className="object-cover rounded-full" />
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
		}
	</div>
	</>
}