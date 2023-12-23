'use client';

import { Profile } from "@/utils/global.types";
import { createBrowserClient } from "@/utils/supabase/client";
import { Loader } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Loader2, UploadIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { v4 } from "uuid";



export default function Avatar({ profile }: { profile: Profile })
{
    const ref = useRef<HTMLInputElement>(null);
    const supabase = createBrowserClient();

    const [oldProfilePicture, setOldProfilePicture] = useState(profile.avatar);
    const [profilePicture, setProfilePicture] = useState(profile.avatar);
    const [newProfilePicture, setNewProfilePicture] = useState<File>();
    const [tmp, setTmp] = useState('');

    const [showEditButton, setShowEditButton] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    async function changeAvatar()
    {
        if (!newProfilePicture || isUploading) return;

        notifications.show({
            title: 'Uploading New Profile Picture',
            message: "This will only take a moment",
        });
        setShowEditButton(true);
        setProfilePicture(tmp);
        const newFilePath = `${profile.id}/${v4()}`;

        const { error } = await supabase.storage.from('profile_pictures')
        .upload(newFilePath, newProfilePicture, { contentType: newProfilePicture.type, });

        if (error)
        {
            setProfilePicture(profile.avatar);
            notifications.show({
                title: 'Error Uploading New Profile Picture',
                message: error.message,
                color: 'red',
                variant: 'filled'
            });
        }
        else
        {
            // Now we make the database changes.
            setProfilePicture(tmp);
            setNewProfilePicture(undefined);
            URL.revokeObjectURL(tmp);
            setTmp('');

            const { error } = await supabase
            .from('profiles')
            .update({ avatar: supabase.storage.from('profile_pictures').getPublicUrl(newFilePath).data.publicUrl })
            .eq('id', profile.id);

            if (error)
            {
                console.error('Failed to update profile picture::', error);
                notifications.show({
                    title: 'Failed to update profile picture',
                    message: error.message,
                    color: 'red',
                    variant: 'filled'
                });
                
                setProfilePicture(profile.avatar);
                setNewProfilePicture(undefined);
                URL.revokeObjectURL(tmp);
                setTmp('');
                setIsUploading(false);
                setShowEditButton(false);

                setOldProfilePicture(supabase.storage.from('profile_pictures').getPublicUrl(newFilePath).data.publicUrl);
                return;
            }
            else
            {
                notifications.show({
                    title: 'Profile picture updated',
                    message: 'Your profile picture has been updated successfully.',
                    color: 'green',
                });
            }
        }

        if (oldProfilePicture)
        {
            console.log('deleting old profile picture');
            // TODO! Find the original file relative path and then delete it.
            const url = 'https://fdiavyxctdwgbvoawijj.supabase.co/storage/v1/object/public/profile_pictures/';
            const relativePath = oldProfilePicture.replace(url, '');
            console.log(relativePath);
            const { error: deleteError } = await supabase.storage.from('profile_pictures')
            .remove([relativePath]);

            if (deleteError)
            {
                console.error('Failed to delete old profile picture::', deleteError);
                notifications.show({
                    title: 'Failed to delete old profile picture',
                    message: deleteError.message,
                    color: 'red',
                    variant: 'filled'
                });
            }
        }

        setShowEditButton(false);
        setIsUploading(false);
    }

    useEffect(() => {
        if (newProfilePicture)
            changeAvatar();
    }, [newProfilePicture]);


    return <div className="min-w-[128px] max-w-[128px] min-h-[128px] max-h-[128px] rounded-full relative"
    onMouseOver={() => setShowEditButton(true)}
    onMouseLeave={() => !isUploading && setShowEditButton(false)}>
        <Image src={profilePicture} quality={100} alt="Profile" width={1500} height={1500} style={{ width: 128, height: 128, objectFit: 'cover' }} className="object-cover max-w-[128px] max-h-[128px] rounded-full" />
        <button className={`absolute w-[128px] h-[128px] flex items-center justify-center top-0 rounded-full bg-white bg-opacity-20 backdrop-blur-[1px] p-2 transition z-50 ${showEditButton ? 'visible' : 'invisible'}`}
        onClick={() => !isUploading && ref.current?.click()}>
            {
                !isUploading &&
                <UploadIcon className="text-primary" />
            }
            {
                isUploading &&
                <Loader2 size={24} className="text-primary animate-spin" />
            }
        </button>
        <input ref={ref} type='file' hidden accept="image/*" onChange={e => {
            if (e.target.files && e.target.files.length > 0)
            {
                if (tmp)
                    URL.revokeObjectURL(tmp);
                const file = e.target.files[0];
                setNewProfilePicture(file);
                setTmp(URL.createObjectURL(file));
            }
        }} />
    </div>
}