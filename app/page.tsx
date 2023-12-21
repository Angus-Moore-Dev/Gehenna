import HandleFooter from "@/components/HandleFooter";
import Navbar from "@/components/Navbar";
import { createServerClient } from "@/utils/supabase/server";

export default async function HomePage()
{
	const supabase = createServerClient();
	const user = (await supabase.auth.getUser()).data.user;
	return <>
	<div className="w-full min-h-screen flex flex-col items-center gap-5">
		<Navbar />
		{
			JSON.stringify(user)
		}
		
	</div>
	<HandleFooter />
	</>
}