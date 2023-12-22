import HandleFooter from "@/components/HandleFooter";
import Navbar from "@/components/Navbar";
import { createServerClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function HomePage()
{
	const cookieSTore = cookies();
	const supabase = createServerClient();
	const user = (await supabase.auth.getUser()).data.user;
	return <>
	<div className="w-full min-h-screen flex flex-col items-center gap-5 break-all">
		<Navbar />
		<p>
			User Session
		</p>
		{
			JSON.stringify(user)
		}
		<br />
		<br />
		<p>
			Cookies
		</p>
		{
			cookieSTore.getAll().find(x => x.name.startsWith('sb-'))?.name
		}
	</div>
	<HandleFooter />
	</>
}