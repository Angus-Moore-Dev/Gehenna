import { clientDb, serverDb } from "@/lib/db";
import { Profile } from "@/models/Profile";
import { User } from "@supabase/supabase-js"
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface ForgotPasswordPageProps
{
    user: User;
    profile: Profile;
}

export default function ForgotPasswordPage()
{
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { token } = router.query as { token: string };
    useEffect(() => {
        if (token)
        {
            // Sign the user in by extracting information from the token.
            // Then instruct them to reset their password
            // Extract the JSON from the token's body.
            const body = JSON.parse(atob(token.split('.')[1]));
            // Sign the user in.
            console.log(body);
            const email = body.email;
            const password = body.password;

            // Sign the user in.
            clientDb.auth.signInWithPassword({ email: email, password: password }).then(res => {
                if (!res.error)
                {
                    setIsLoading(false);
                }
                else
                {
                    alert(res.error.message);
                }
            });
        }
    }, [token]);

    return <div className="w-full h-full flex flex-col gap-4 max-w-6xl mx-auto py-16">
        <Image src='/logo.png' width={500} height={450} alt='Gehenna' />
        <h1 className="text-4xl font-bold">My Profile</h1>
    </div>
}


export const getServerSideProps = async (context: GetServerSidePropsContext) => 
{
	const db = serverDb(context);
	const user = (await db.auth.getUser()).data.user;

    const { token } = context.query as { token: string };

    if (token)
    {
        // We sign the user in with the admin client???
        const body = JSON.parse(atob(token.split('.')[1]));
        const email = body.email;
        const password = body.password;
    }

	if (user)
	{
		// Get the profile.
		const profile = (await db.from('profiles').select('*').eq('id', user.id).single()).data as Profile;
		console.log(profile);
		return {
			props: {
				user: user,
				profile: profile
			}
		}
	}

	return {
		props: {
			user: user
		}
	}
}