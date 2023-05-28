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

interface ProfilePageProps
{
    profileData: Profile;
}

export default function ProfilePage({ profileData }: ProfilePageProps)
{
    const ref = useRef<AvatarEditor>(null);
    const router = useRouter();
    const [username, setUsername] = useState(profileData.username);
    const [bio, setBio] = useState(profileData.bio);
    const [avatar, setAvatar] = useState(profileData.avatar);
    const [tempAvatar, setTempAvatar] = useState(profileData.avatar);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const [newProfilePicture, setNewProfilePicture] = useState<File>();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const newProfilePicture = acceptedFiles[0];
        if (!newProfilePicture.type.startsWith('image/'))
        {
            toast.error('You can only upload images.');
        }
        
        // if the byte size is greater than 4mb, turn em away as well.
        if (newProfilePicture.size > 4 * 1024 * 1024)
        {
            toast.error('Your image must be less than 4mb.');
        }

        if (newProfilePicture)
        {
            setRotate(0);
            setScale(1);
            const url = URL.createObjectURL(newProfilePicture);
            setTempAvatar(url);
            setNewProfilePicture(newProfilePicture);
        }
        }, [])
    const {getRootProps, getInputProps} = useDropzone({onDrop});

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
        <div className="flex flex-col gap-2">
            {
                !newProfilePicture &&
                <div className="flex flex-col gap-2 items-center justify-center transition p-2 rounded-xl hover:cursor-pointer hover:bg-primary group">
                    <div {...getRootProps()} className="flex flex-col items-center">
                        <input {...getInputProps()} type='file' accept='image/*' />
                        <Image src={avatar} width={256} height={256} alt='Profile Picture' className="w-[256px] h-[256px] object-cover rounded-md" />
                        <span className="mt-2 group-hover:text-white">Drag a New Image or Click to Upload a New Avatar</span>
                    </div>
                </div>
            }
            {
                newProfilePicture &&
                <>
                <AvatarEditor
                    ref={ref}
                    image={tempAvatar}
                    width={256}
                    height={256}
                    border={0}
                    color={[255, 255, 255, 0.6]} // RGBA
                    scale={scale}
                    rotate={rotate}
                    className="rounded-md"
                />
                <button {...getRootProps()} className="">
                    <input {...getInputProps()} />
                    <CommonButton text='Upload New Image' className="mx-auto" onClick={() => {}} />
                </button>
                </>
            }
            {
                newProfilePicture &&
                <div className="mb-4">
                    <span>Scale</span>
                    <Slider value={scale} onChange={(e) => setScale(e)} min={1} max={15} step={0.1} label={scale} />
                    <span>Rotate</span>
                    <Slider value={rotate} onChange={(e) => setRotate(e)} min={0} max={360} step={1} label={rotate} />
                </div>
            }
            {
                isUploading &&
                <Loader className="mx-auto" color="yellow" />
            }
            {
                newProfilePicture && !isUploading &&
                <CommonButton text='Update Profile Picture' onClick={async () => {
                    ref.current?.getImage().toBlob(async (blob: Blob | null) => {
                        setIsUploading(true);
                        if (blob)
                        {
                            // Default value for a profile.
                            if (avatar !== 'https://fdiavyxctdwgbvoawijj.supabase.co/storage/v1/object/public/profile_pictures/sneaky_joel.PNG')
                            {
                                const oldAvatarURL = avatar.split('profile_pictures/')[1];
                                await clientDb.storage.from('profile_pictures').remove([oldAvatarURL]);
                            }

                            // Create a new unique name, with the filetype at the end;
                            const blobName = `${v4()}.${blob.type.split('/')[1]}`;

                            // Upload the blob here.
                            await clientDb.storage.from('profile_pictures').upload(`${profileData.id}/${blobName}`, blob, 
                            {
                                contentType: blob.type,
                                cacheControl: '3600', 
                                upsert: true
                            });

                            const url = clientDb.storage.from('profile_pictures').getPublicUrl(`${profileData.id}/${blobName}`).data.publicUrl;
                            const storageRes = await clientDb.from('profiles').update({ avatar: url }).eq('id', profileData.id);
                            setNewProfilePicture(undefined);
                            URL.revokeObjectURL(avatar);
                            setTempAvatar('');
                            setAvatar(url);
                        }
                        setIsUploading(false);
                    });
                }} className="mx-auto" />
            }
        </div>
        
        <div className="flex flex-col gap-2 items-end">
            <TextInput label='Username' value={username} onChange={(e) => setUsername(e.target.value)} className="w-96" maxLength={64} />
            <small className="mr-auto">{64 - username.length} characters left</small>
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
        <div className="flex flex-col gap-2 items-end">
            <Textarea label='Bio (About Yourself)' value={bio} onChange={(e) => setBio(e.target.value)} className="w-96" maxLength={128} />
            <small className="mr-auto">{128 - bio.length} characters left</small>
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