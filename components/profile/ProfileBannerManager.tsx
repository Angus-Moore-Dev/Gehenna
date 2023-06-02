import { Profile } from "@/models/Profile";
import { ImageDropzone } from "../ImageDropzone";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import AvatarEditor from "react-avatar-editor";
import { Loader, Slider } from "@mantine/core";
import CommonButton from "../CommonButton";
import { v4 } from "uuid";
import { clientDb } from "@/lib/db";

export default function ProfileBannerManager({ profileData }: { profileData: Profile })
{
    const ref = useRef<AvatarEditor>(null);

    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [banner, setBanner] = useState(profileData.profileBannerURL);
    const [tempBanner, setTempBanner] = useState(profileData.profileBannerURL);
    const [newProfileBanner, setNewProfileBanner] = useState<File>();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const newBannerPicture = acceptedFiles[0];
        if (!newBannerPicture.type.startsWith('image/'))
        {
            toast.error('You can only upload images.');
        }
        
        // if the byte size is greater than 4mb, turn em away as well.
        if (newBannerPicture.size > 4 * 1024 * 1024)
        {
            toast.error('Your banner must be less than 4mb.');
        }

        if (newBannerPicture)
        {
            setRotate(0);
            setScale(1);
            const url = URL.createObjectURL(newBannerPicture);
            setTempBanner({
                url,
                mimeType: newBannerPicture.type,
                byteSize: newBannerPicture.size,
            });
            setNewProfileBanner(newBannerPicture);
        }
        }, [])
    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    return <div className="w-full mx-auto group transition aria-checked:hover:bg-primary hover:text-white p-2 rounded-md"
    aria-checked={!newProfileBanner}>
        {
            !isUploading &&
            <span className="text-2xl font-semibold">Profile Banner</span>
        }
        {
            !isUploading &&
            banner.url && !newProfileBanner &&
            <div {...getRootProps()}>
                <input {...getInputProps()} type='file' accept='image/*' />
                <Image src={banner.url} quality={100} width={1024} height={256} alt='Profile Banner' className="w-full h-[256px] object-cover rounded-md hover:cursor-pointer" />
                <span className="mt-2 group-hover:text-white">Drag a New Image or Click to Upload a New Banner</span>
            </div>
        }
        {
            !isUploading &&
            !profileData.profileBannerURL.url && !newProfileBanner && // First Time Setup
            <ImageDropzone onUpload={function (files: File[]) {
                // Set the temp profile
                const newBannerPicture = files[0];
                if (!newBannerPicture.type.startsWith('image/'))
                {
                    toast.error('You can only upload images.');
                }

                // if the byte size is greater than 4mb, turn em away as well.
                if (newBannerPicture.size > 4 * 1024 * 1024)
                {
                    toast.error('Your banner must be less than 4mb.');
                }

                if (newBannerPicture)
                {
                    setRotate(0);
                    setScale(1);
                    const url = URL.createObjectURL(newBannerPicture);
                    setTempBanner({
                        url,
                        mimeType: newBannerPicture.type,
                        byteSize: newBannerPicture.size,
                    });
                    setNewProfileBanner(newBannerPicture);
                }
            }} isUploading={false} height={200} accept={["image/*"]} />
        }
        {
            !isUploading &&
            newProfileBanner &&
            <div className="w-full flex flex-col gap-2 mb-10">
                <AvatarEditor
                    ref={ref}
                    image={tempBanner?.url}
                    width={768}
                    height={256}
                    border={0}
                    color={[255, 255, 255, 0.6]} // RGBA
                    scale={scale}
                    rotate={rotate}
                    className="w-full h-[256px] object-cover rounded-md"
                />
                <div className="flex flex-row gap-2 mx-auto">
                <button {...getRootProps()} className="">
                    <input {...getInputProps()} type="file" accept="image/*" />
                    <CommonButton text='Upload New Image' className="mx-auto" onClick={() => {}} />
                </button>
                <CommonButton text='Remove Image' onClick={() => {
                    setNewProfileBanner(undefined);
                    URL.revokeObjectURL(tempBanner?.url);
                }} className="bg-red-500 hover:bg-red-600"/>
                </div>
                <div className="mb-4 w-full">
                    <span>Scale</span>
                    <Slider value={scale} onChange={(e) => setScale(e)} min={1} max={15} step={0.1} label={scale} />
                    <span>Rotate</span>
                    <Slider value={rotate} onChange={(e) => setRotate(e)} min={0} max={360} step={1} label={rotate} />
                </div>
                <CommonButton text='Save New Banner' onClick={async () => {
                    ref.current?.getImage().toBlob(async (blob: Blob | null) => {
                        setIsUploading(true);
                        if (blob)
                        {
                            if (profileData.profileBannerURL.url)
                            {
                                const oldAvatarURL = profileData.profileBannerURL.url.split('profile_pictures/')[1];
                                await clientDb.storage.from('profile_pictures').remove([oldAvatarURL]);
                            }
                            
                            // Now we add the new one in.
                            const blobName = `${v4()}.${blob.type.split('/')[1]}`;
                            await clientDb.storage.from('profile_pictures').upload(`${profileData.id}/${blobName}`, blob,
                            {
                                contentType: blob.type,
                                cacheControl: '3600',
                                upsert: true
                            });

                            const url = clientDb.storage.from('profile_pictures').getPublicUrl(`${profileData.id}/${blobName}`).data.publicUrl;
                            await clientDb.from('profiles').update({
                                profileBannerURL: {
                                    url,
                                    mimeType: blob.type,
                                    byteSize: blob.size,
                                }
                            }).eq('id', profileData.id);

                            setNewProfileBanner(undefined);
                            URL.revokeObjectURL(tempBanner?.url);
                            setTempBanner({ url: '', mimeType: '', byteSize: 0 });
                            setBanner({
                                url,
                                mimeType: blob.type,
                                byteSize: blob.size,
                            });
                        }
                        else
                        {
                            toast.error('There was an error uploading, please try again!');
                        }
                        setIsUploading(false);
                    });
                }} className="bg-green-600 hover:bg-green-500 px-16 mx-auto" />
            </div>
        }
        {
            isUploading &&
            <Loader className="mx-auto my-24" size={64} />
        }
    </div>
}