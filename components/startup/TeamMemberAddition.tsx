import { TextInput } from "@mantine/core";
import { ImageDropzone } from "../ImageDropzone";
import { useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";

interface TeamMemberAdditionProps
{
    onProfileUpload: (file: File) => void;
    setName: (name: string) => void;
    setRole: (role: string) => void;
}

export default function TeamMemberAddition({ onProfileUpload, setName, setRole }: TeamMemberAdditionProps)
{
    const [memberName, setMemberName] = useState('');
    const [memberEmail, setMemberEmail] = useState('');
    const [memberRole, setMemberRole] = useState('');
    const memberProfileRef = useRef<AvatarEditor>(null);
    const [memberProfile, setMemberProfile] = useState<File>();
    const [memberProfileTmp, setMemberProfileTmp] = useState('');

    return <div className="w-[48%] bg-tertiary rounded-md flex flex-col gap-4 p-4">
        {
            !memberProfile &&
            <ImageDropzone onUpload={(files) => {
                setMemberProfile(files[0]);
                setMemberProfileTmp(URL.createObjectURL(files[0]));
            }} isUploading={false} height={220} accept={[]} />
        }
        {
            memberProfile &&
            <AvatarEditor
                ref={memberProfileRef}
                image={memberProfileTmp}
                width={256}
                height={256}
                border={0}
                color={[255, 255, 255, 0.6]} // RGBA
                scale={1}
                rotate={0}
                className="w-full mx-auto"
            />
        }
        <section className="w-full flex flex-col gap-2">
            <TextInput label="Name" placeholder="Member Name" value={memberName} onChange={(e) => setMemberName(e.target.value)} />
            <TextInput label="Email" placeholder="Member Email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} />
            <TextInput label="Role" placeholder="Member Role" value={memberRole} onChange={(e) => setMemberRole(e.target.value)} />
        </section>
    </div>
}