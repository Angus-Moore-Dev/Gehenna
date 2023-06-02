import CommonButton from "@/components/CommonButton";
import { clientDb, serverDb } from "@/lib/db";
import { Profile } from "@/models/Profile";
import { Loader, Slider, TextInput, Textarea } from "@mantine/core";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Dropzone, { useDropzone } from 'react-dropzone';
import AvatarEditor from 'react-avatar-editor';
import { v4 } from "uuid";
import { Notification } from "@/models/Notification";
import Head from "next/head";
import { Gehenna } from "@/components/Gehenna";
import { ImageDropzone } from "@/components/ImageDropzone";
import ProfilePictureManager from "@/components/profile/ProfilePictureManager";
import ProfileBannerManager from "@/components/profile/ProfileBannerManager";

interface ProfilePageProps
{
    profileData: Profile;
}

export default function ProfilePage({ profileData }: ProfilePageProps)
{
    const router = useRouter();
    const [username, setUsername] = useState(profileData.username);
    const [bio, setBio] = useState(profileData.bio);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        // Listen for new notifications.
        clientDb.channel('notifications').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications'}, (payload) => {
            const newNotification = payload.new as Notification;
            if (newNotification.userId === profileData.id)
            {
                toast.info(newNotification.title, {
                    onClick() {
                        router.push(`${window.location.origin}${newNotification.link}`);
                    }
                });
            }
        }).subscribe();
    }, []);

    return <div className="w-full h-full flex flex-col gap-4 mx-auto py-16 items-center max-w-3xl">
        <Head>
            <title>Gehenna - My Profile</title>
        </Head>
        {
            profileData && !profileData.emailVerified &&
            <div className='w-full h-full flex items-center justify-center flex-col gap-4 -mt-16 mb-4 bg-primary-light'>
                <span className='mx-auto text-white font-semibold'>Please verify your email to post and comment!</span>
            </div>
        }
        <Link href='/' className="flex flex-col items-center justify-center mb-10">
            <Gehenna />
        </Link>
        <h1 className="text-4xl font-bold">My Profile</h1>
        <ProfileBannerManager profileData={profileData} />
        <ProfilePictureManager profileData={profileData} />
        <div className="flex flex-col gap-2 items-end">
            <TextInput label='Username' value={username} onChange={(e) => setUsername(e.target.value)} className="w-96" maxLength={48} />
            <small className="mr-auto">{48 - username.length} characters left</small>
            <CommonButton text='Update Username' className="m-0" onClick={async () => {
                const res = await clientDb.from('profiles').update({ username: username }).eq('id', profileData.id);
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
        <TextInput label='Email' value={profileData.email} className="w-96" disabled />
        <TextInput label='Handle (coming soon)' value={profileData.handle} className="w-96" disabled />
        <div className="flex flex-col gap-2 items-end">
            <Textarea label='Bio (About Yourself)' value={bio} onChange={(e) => setBio(e.target.value)} className="w-96" maxLength={64} />
            <small className="mr-auto">{64 - bio.length} characters left</small>
            <CommonButton text='Update Bio' className="m-0" onClick={async () => {
                const res = await clientDb.from('profiles').update({ bio: bio }).eq('id', profileData.id);
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
            {
                password &&
                <div className='flex flex-col'>
                    <small className={`${password.length > 8 ? 'text-green-500' : 'text-red-500'}`}>Password must be at least 8 characters long.</small>
                    <small className={`${password && confirmPassword && password === confirmPassword ? 'text-green-500' : 'text-red-500'}`}>Passwords must match.</small>
                </div>
            }
            {
                password && password.length >= 8 && password === confirmPassword &&
                <CommonButton text='Update Password' className="ml-auto" onClick={async () => {
                    const res = await fetch('/api/reset-password', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            newPassword: password
                        })
                    });

                    if (res.status !== 200)
                    {
                        toast.error((await res.json()).message);
                    }
                    else
                    {
                        toast.success('Password updated!');
                        setPassword('');
                        setConfirmPassword('');
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
		return {
			props: {
				user: user,
				profileData: profile
			}
		}
	}

	return {
		props: {
			user: user
		}
	}
}