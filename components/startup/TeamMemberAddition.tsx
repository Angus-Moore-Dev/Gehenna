interface TeamMemberAdditionProps
{
    onProfileUpload: (file: File) => void;
    setName: (name: string) => void;
    setRole: (role: string) => void;
    setBio: (bio: string) => void;
}

export default function TeamMemberAddition({ onProfileUpload, setName, setRole, setBio }: TeamMemberAdditionProps)
{
    return <div className="w-[31.63%] h-72 bg-primary rounded-md">

    </div>
}