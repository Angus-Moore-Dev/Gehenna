import HandleFooter from "@/components/HandleFooter";
import Navbar from "@/components/Navbar";
import TotalUsersCount from "@/components/TotalUsersCount";
import { appHttp } from "@/utils/appURL";
import { MediaInfo, Profile } from "@/utils/global.types";
import { createServerClient } from "@/utils/supabase/server";
import { Button } from "@mantine/core";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";

export default async function HomePage()
{
	const supabase = createServerClient();
	const user = (await supabase.auth.getUser()).data.user;

	const { data: latestPost } = await supabase
	.from('post')
	.select('id, title, byline, topicId, postImageURL, createdAt, profiles!inner(id, name, handle, avatar), postTopics!inner(title)')
	.order('createdAt', { ascending: false })
	.limit(5);

	let profile: Profile | null = null;
	if (user)
	{
		const { data, error } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', user.id)
		.single();

		if (data)
			profile = data;
	}


	return <>
	<div className="w-full min-h-screen flex flex-col items-center gap-10">
		<Navbar />
		<div className="w-full max-w-4xl flex flex-col items-center gap-2">
			<p className="text-4xl font-light">
				Voices of the Damned.
			</p>
			<p className="text-neutral-600 max-w-lg text-center">
				Here in Gehenna, you can share your thoughts and opinions on anything you want. It's like Medium and Substack without the chaos,
				premium subscription waving, ads, monetisation and all that shit.
				<br />
				<br />
				{
					!user && 'Sign up now and start writing.'
				}
			</p>
			{
				!user &&
				<Link href='/auth' className="w-fit">
					<Button>
						Join Gehenna Now
					</Button>
				</Link>
			}
			{
				user && profile &&
				<span className="text-neutral-500 font-bold mb-5">
					Welcome back {profile.name}!
				</span>
			}
			<Link href='/explore' className="w-fit">
				<Button>
					Explore Authors
				</Button>
			</Link>
			<TotalUsersCount />
		</div>
		{
			latestPost &&
			<>
			<span className="-mb-7 pb-2 border-b-[1px] border-b-neutral-600 w-full max-w-4xl font-semibold">
				Latest Posts on <span className="text-primary font-bold">Gehenna</span>
			</span>
			{
				latestPost.map((latestPost, index) => 
				<Link
				key={index}
				href={`${appHttp}://${latestPost?.profiles?.handle}${process.env.NODE_ENV === 'development' ? '.dev.local' : '.gehenna.app'}/${latestPost.id}`} 
				className="w-full max-w-4xl grid grid-cols-2 -mt-5">
					<Image src={(latestPost.postImageURL as MediaInfo).url} alt="" width={500} height={250} className="max-h-[250px] object-cover rounded-l-md bg-[#0e0e0e]" />
					<div className="flex flex-col gap-4 bg-tertiary rounded-r-md flex-grow p-8 items-center text-center">
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
									<>{latestPost.postTopics?.title}&nbsp;&middot;&nbsp;</>
								}{new Date(latestPost.createdAt).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}
							</small>
						</div>
					</div>
				</Link>)
			}
			</>
		}
	</div>
	</>
}