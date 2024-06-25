import Navbar from "@/components/Navbar";
// import TotalUsersCount from "@/components/TotalUsersCount";
import { createServerClient } from "@/utils/supabase/server";
import { Button } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import TalosPrinciple from '@/public/talos_principle.jpg';

export default async function HomePage()
{
	const supabase = createServerClient();
	const user = (await supabase.auth.getUser()).data.user;
    const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('createdAt', { ascending: true });

	// const { data: latestPost } = await supabase
	// .from('post')
	// .select('id, title, byline, topicId, postImageURL, createdAt, profiles!inner(id, name, handle, avatar), postTopics(title)')
	// .eq('public', true)
	// .order('createdAt', { ascending: false })
	// .limit(5);

	// let profile: Profile | null = null;
	// if (user)
	// {
	// 	const { data } = await supabase
	// 	.from('profiles')
	// 	.select('*')
	// 	.eq('id', user.id)
	// 	.single();

	// 	if (data)
	// 		profile = data;
	// }


	return <>
	<div className="w-full min-h-screen flex flex-col items-center gap-10">
		<Navbar />
		<div className="w-full max-w-4xl flex flex-col items-center gap-5">
			<p className="text-4xl font-light">
				Where the words end, the world ends.
			</p>
			<Image src={TalosPrinciple} alt="Talos Principle" quality={100} priority width={500} height={400} className="w-full h-[400px] object-cover rounded-md" />
			<p className="text-center">
				Here in Gehenna, you can share your thoughts and opinions on anything you want. It's like Medium and Substack without the chaos,
				premium subscription waving, ads, monetisation and all that shit.
				
				You can write public monologues, private schizo ramblings, insights / observations,
				or anything you want, just so long as it doesn't violate the <Link href='/tos' target="_blank" className="text-blue-500 underline">Terms of Service</Link>.
				<br />
				<br />
				The app is currently being developed to support a bunch of new things, like <b>customising your own space, having your own domain and stuff like that.</b>
				&nbsp;More will be written here as it gets created. 
				<br />
				<br />
				I am personally hosting all of this. It is a free service because I believe every man should have his own space to share.
				<br />
				<br />
				Also, if you can&apos;t tell, this site is based on the Talos Principle: Road To Gehenna DLC. I love the game and the nature of how the community shares things, the overarching concept so I named the site after it.
			</p>
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