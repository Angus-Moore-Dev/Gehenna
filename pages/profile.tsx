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

interface ProfilePageProps
{
    profile: Profile;
}

export default function ProfilePage({ profile }: ProfilePageProps)
{
    const audioRef = useRef<HTMLAudioElement>(null);
    const ref = useRef<AvatarEditor>(null);
    const router = useRouter();
    const [username, setUsername] = useState(profile.username);
    const [bio, setBio] = useState(profile.bio);
    const [avatar, setAvatar] = useState(profile.avatar);
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
            setAvatar(url);
            setNewProfilePicture(newProfilePicture);
        }
        }, [])
    const {getRootProps, getInputProps} = useDropzone({onDrop});

    useEffect(() => {
        // Listen for new notifications.
        clientDb.channel('notifications').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications'}, (payload) => {
            const newNotification = payload.new as Notification;
            if (newNotification.userId === profile.id)
            {
                // Play a sound to notify the user of the new notification.
                if (audioRef.current)
                {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play();
                }
                toast.info(newNotification.title, {
                    onClick() {
                        router.push(`${window.location.origin}${newNotification.link}`);
                    }
                });
            }
        }).subscribe((status) => console.log(status));
    }, []);

    return <div className="w-full h-full flex flex-col gap-4 mx-auto py-16 items-center max-w-3xl">
        <audio ref={audioRef} hidden>
            <source src={'/notification.mp3'} />
        </audio>
        <Link href='/' className="flex flex-col items-center justify-center mb-10">
            <Image src='/logo.png' width={500} height={450} alt='Gehenna' />
            <span className="text-sm mr-auto pt-2">Click To Go Back</span>
        </Link>
        <h1 className="text-4xl font-bold">My Profile</h1>
        <div className="flex flex-col gap-2">
            {
                !newProfilePicture &&
                <div className="flex flex-col gap-2 items-center justify-center transition p-2 rounded-xl hover:text-secondary hover:cursor-pointer hover:bg-primary">
                    <div {...getRootProps()} className="flex flex-col items-center">
                        <input {...getInputProps()} />
                        <Image src={avatar} width={256} height={256} alt='Profile Picture' className="w-[256px] h-[256px] object-cover rounded-md" />
                        <span>Drag a New Image or Click to Upload a New Avatar</span>
                    </div>
                </div>
            }
            {
                newProfilePicture &&
                <>
                <AvatarEditor
                    ref={ref}
                    image={avatar}
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
                    const newProfilePicture = ref.current?.getImage().toBlob(async (blob: Blob | null) => {
                        setIsUploading(true);
                        if (blob)
                        {
                            // Create a new unique name, with the filetype at the end;
                            const blobName = `${v4()}.${blob.type.split('/')[1]}`;

                            // Upload the blob here.
                            const res = await clientDb.storage.from('profile_pictures').upload(`${profile.id}/${blobName}`, blob, 
                            {
                                contentType: blob.type,
                                cacheControl: '3600', 
                                upsert: true
                            });
                            const url = clientDb.storage.from('profile_pictures').getPublicUrl(`${profile.id}/${blobName}`).data.publicUrl;
                            const storageRes = await clientDb.from('profiles').update({ avatar: url }).eq('id', profile.id);
                            setNewProfilePicture(undefined);
                            URL.revokeObjectURL(avatar);
                            setAvatar(url);
                        }
                        setIsUploading(false);
                    });
                }} className="mx-auto" />
            }
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