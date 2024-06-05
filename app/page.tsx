import Navbar from "@/components/Navbar";
import TotalUsersCount from "@/components/TotalUsersCount";
import { createServerClient } from "@/utils/supabase/server";
import { Button } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import TalosPrinciple from '@/public/talos_principle.jpg';

export default async function HomePage()
{
	const supabase = createServerClient();
	const user = (await supabase.auth.getUser()).data.user;

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
				More will be written here as it gets created. 
				<br />
				<br />
				I am personally hosting all of this. If you have any issues starting your own space, email me at <b>admin@gehenna.app</b> or if it's really urgent (like your space is crashing)
				email me directly at <b>angusmoore.dev@gmail.com</b>.
				<br />
				<br />
				Also, if you can&apos;t tell, this site is based on the Talos Principle: Road To Gehenna DLC. I love the game and the nature of how the community shares things, the overarching concept so I named the site after it.
			</p>
			<Link href='/explore' className="w-fit">
				<Button>
					Explore Authors
				</Button>
			</Link>
			<TotalUsersCount />
		</div>
		{/* {
			latestPost &&
			<>
			<span className="-mb-7 pb-2 border-b-[1px] border-b-neutral-600 w-full max-w-4xl font-semibold">
				Latest Posts on <span className="text-primary font-bold">Gehenna</span>
			</span>
			{
				latestPost.map((latestPost, index) => 
				<Link
				key={index}
				href={`/${latestPost.profiles?.handle}/${latestPost.id}`} 
				className="w-full max-w-4xl grid grid-cols-2 grid-rows-1 -mt-5">
					<Image src={(latestPost.postImageURL as MediaInfo).url} alt="" width={500} height={300} className="max-h-[300px] h-[300px] object-cover rounded-l-md bg-[#0e0e0e]" />
					<div className="flex flex-col gap-4 bg-tertiary rounded-r-md flex-grow p-8 items-center text-center max-h-[300px]">
						<span className="text-2xl font-bold text-center">
							{latestPost.title}
						</span>
						<p className="text-neutral-400">
							{latestPost.byline}
						</p>
						<div className="mt-auto flex flex-col items-center gap-5">
							{
								latestPost.profiles &&
								<div className="flex flex-row items-center gap-2">
									{
										!latestPost.profiles.avatar &&
										<Image src='/gehenna_logo_transparent.png' alt="" width={250} height={250} style={{ width: 32, height: 32, objectFit: 'cover' }} className="object-cover rounded-full" />
									}
									{
										latestPost.profiles.avatar &&
										<Image src={latestPost.profiles.avatar} alt="" width={250} height={250} style={{ width: 32, height: 32, objectFit: 'cover' }} className="object-cover rounded-full" />
									}
									<small>
										{latestPost.profiles.name}
									</small>
								</div>
							}
							<small className="">
								{
									latestPost.postTopics &&
									<>{latestPost.postTopics?.title}&nbsp;&middot;&nbsp;</>
								}{new Date(latestPost.createdAt).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}
							</small>
						</div>
					</div>
				</Link>)
			}
			</>
		} */}
	</div>
	</>
}