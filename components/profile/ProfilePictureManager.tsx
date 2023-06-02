import { clientDb } from "@/lib/db";
import { Slider, Loader } from "@mantine/core";
import { useState, useCallback, useRef } from "react";
import AvatarEditor from "react-avatar-editor";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import CommonButton from "../CommonButton";
import { Profile } from "@/models/Profile";
import Image from "next/image";

export default function ProfilePictureManager({ profileData }: { profileData: Profile })
{
    const ref = useRef<AvatarEditor>(null);

    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [avatar, setAvatar] = useState(profileData.avatar);
    const [tempAvatar, setTempAvatar] = useState(profileData.avatar);
    const [newProfilePicture, setNewProfilePicture] = useState<File>();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const newProfilePicture = acceptedFiles[0];
        if (!newProfilePicture.type.startsWith('image/'))
        {
            toast.error('You can only upload images.');
        }
        
        // if the byte size is greater than 4mb, turn em away as well.
        if (newProfilePicture.size > 3 * 1024 * 1024)
        {
            toast.error('Your image must be less than 3mb.');
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
    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    return <div className="flex flex-col gap-2">
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
}