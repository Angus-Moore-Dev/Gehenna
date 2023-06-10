import { TextInput } from "@mantine/core";
import { ImageDropzone } from "../ImageDropzone";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";
import CommonButton from "../CommonButton";
import Image from "next/image";

interface TeamMemberAdditionProps
{
    index: number;
    name: string;
    setName: (name: string) => void;
    email: string;
    setEmail: (email: string) => void;
    role: string;
    setRole: (role: string) => void;

    profilePicture: File | undefined;
    profilePictureTmp: string;
    setProfilePicture: (file: File) => void;
    removeTeamMember: () => void;
}

export default function TeamMemberAddition({ index, name, setName, email, setEmail, role, setRole, profilePicture, profilePictureTmp, setProfilePicture, removeTeamMember }: TeamMemberAdditionProps)
{
    const ref = useRef<AvatarEditor>(null);
    return <div className="w-[48%] bg-tertiary rounded-md flex flex-col gap-4 p-4">
        {
            index === 0 &&
            <span className="ml-auto text-sm mb-4 pt-2">You can't remove yourself :(</span>
        }
        {
            index !== 0 &&
            <CommonButton text="Remove" className="ml-auto text-xs p-1 bg-red-500 hover:bg-red-600"
            onClick={removeTeamMember} />
        }
        {
            !profilePictureTmp &&
            <ImageDropzone onUpload={(files) => {
                setProfilePicture(files[0]);
            }} isUploading={false} height={220} accept={["image/*"]} />
        }
        {
            profilePictureTmp && index === 0 &&
            <Image src={profilePictureTmp} alt='Me' width={256} height={256} className="w-[256px] h-[256px] object-cover mx-auto rounded-md" />
        }
        {
            profilePictureTmp && index !== 0 &&
            <AvatarEditor
                ref={ref}
                image={profilePictureTmp}
                width={256}
                height={256}
                border={0}
                color={[255, 255, 255, 0.6]} // RGBA
                scale={1}
                rotate={0}
                className="w-full mx-auto rounded-md"
            />
        }
        <section className="w-full flex flex-col gap-2 mt-auto">
            <TextInput label="Name" placeholder="Member Name" value={name} onChange={(e) => setName(e.target.value)} disabled={!index} />
            <TextInput label="Email" placeholder="Member Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!index} />
            <TextInput label="Role" placeholder="Member Role" value={role} onChange={(e) => setRole(e.target.value)} />
        </section>
    </div>
}