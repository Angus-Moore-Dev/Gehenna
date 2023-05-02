import CommonButton from "@/components/CommonButton";
import { clientDb, serverDb } from "@/lib/db";
import { Profile } from "@/models/Profile";
import { TextInput, Textarea } from "@mantine/core";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";

interface ProfilePageProps
{
    profile: Profile;
}

export default function ProfilePage({ profile }: ProfilePageProps)
{
    const router = useRouter();
    const [username, setUsername] = useState(profile.username);
    const [bio, setBio] = useState(profile.bio);
    const [avatar, setAvatar] = useState(profile.avatar);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    return <div className="w-full h-full flex flex-col gap-4 mx-auto py-16 items-center max-w-3xl">
        <Link href='/' className="flex flex-col items-center justify-center mb-10">
            <Image src='/logo.png' width={500} height={450} alt='Gehenna' />
            <span className="text-sm mr-auto pt-2">Click To Go Back</span>
        </Link>
        <h1 className="text-4xl font-bold">My Profile</h1>
        <div className="flex flex-col gap-2 items-center">
            <Image src={avatar} alt='profile' width='250' height='250' className="rounded-md object-cover" />
            <input hidden type='file' id='avatar' accept="image/*" onChange={async (e) => {
                const newProfilePicture = e.target.files?.[0];
                if (newProfilePicture)
                {
                    const res = await clientDb.storage.from('profile_pictures').upload(`${profile.id}/${newProfilePicture.name}`, newProfilePicture);
                    if (res.error)
                    {
                        toast.error(res.error.message);
                    }
                    else
                    {
                        const url = await clientDb.storage.from('profile_pictures').getPublicUrl(`${profile.id}/${newProfilePicture.name}`).data.publicUrl;
                        const res = await clientDb.from('profiles').update({ avatar: url }).eq('id', profile.id);
                        setAvatar(url);
                    }
                }
                e.target.value = '';
            }} />
            <CommonButton text='Update Avatar' className="m-0 w-[250px]" onClick={async () => {
                document.getElementById('avatar')?.click();
            }} />
        </div>
        <div className="flex flex-col gap-2 items-end">
            <TextInput label='Username' value={username} onChange={(e) => setUsername(e.target.value)} className="w-96" />
            <CommonButton text='Update Username' className="m-0" onClick={async () => {
                const res = await clientDb.from('profiles').update({ username: username }).eq('id', profile.id);
                if (res.error)
                {
                    toast.error(res.error.message);
                }
                else
                {
                    toast.success('Username updated!');
                }
            }} />
        </div>
        <TextInput label='Email' value={profile.email} className="w-96" disabled />
        <div className="flex flex-col gap-2 items-end">
            <Textarea label='Bio (About Yourself)' value={bio} onChange={(e) => setBio(e.target.value)} className="w-96" />
            <CommonButton text='Update Bio' className="m-0" onClick={async () => {
                const res = await clientDb.from('profiles').update({ bio: bio }).eq('id', profile.id);
                if (res.error)
                {
                    toast.error(res.error.message);
                }
                else
                {
                    toast.success('Bio updated!');
                }
            }} />
        </div>
        {/* Password resets */}
        <div className="flex flex-col gap-2">
            <TextInput label='New Password' value={password} onChange={(e) => setPassword(e.target.value)} className="w-96" type='password' />
            <TextInput label='Confirm New Password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-96" type='password' />
            <div className='flex flex-col'>
                <small className={`${password.length > 8 ? 'text-green-500' : 'text-red-500'}`}>Password must be at least 8 characters long.</small>
                <small className={`${password && confirmPassword && password === confirmPassword ? 'text-green-500' : 'text-red-500'}`}>Passwords must match.</small>
            </div>
            {
                password && password.length >= 8 && password === confirmPassword &&
                <CommonButton text='Update Password' className="ml-auto" onClick={async () => {
                    const res = await clientDb.auth.updateUser({
                        password: password
                    });
                    if (res.error)
                    {
                        toast.error(res.error.message);
                    }
                    else
                    {
                        toast.success('Password updated!');
                    }
                }} />
            }
        </div>
        <CommonButton text='Sign Out' className="bg-red-500 hover:bg-red-600 font-semibold mt-10" onClick={async () => {
            await clientDb.auth.signOut();
            router.push('/');
        }} />
    </div>
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => 
{
	const db = serverDb(context);
	const user = (await db.auth.getUser()).data.user;

    if (!user)
    {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
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