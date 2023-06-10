import CommonButton from "@/components/CommonButton";
import { Gehenna } from "@/components/Gehenna";
import { ImageDropzone } from "@/components/ImageDropzone";
import TeamMemberAddition from "@/components/startup/TeamMemberAddition";
import { Slider, Stepper, TextInput, Textarea } from "@mantine/core";
import Link from "next/link";
import { useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";

export default function CreateNewStartup()
{
    const [name, setName] = useState('');
    const [industry, setIndustry] = useState('');
    const [mission, setMission] = useState('');
    const [description, setDescription] = useState('');
    const [country, setCountry] = useState('');
    const [stage, setStage] = useState(0);
    const [domain, setDomain] = useState('');
    
    const logoEditorRef = useRef<AvatarEditor>(null);
    const [logo, setLogo] = useState<File>();
    const [logoTmp, setLogoTmp] = useState('');
    const [logoRotate, setLogoRotate] = useState(0);
    const [logoScale, setLogoScale] = useState(1);

    const bannerEditorRef = useRef<AvatarEditor>(null);
    const [banner, setBanner] = useState<File>();
    const [bannerTmp, setBannerTmp] = useState('');
    const [bannerRotate, setBannerRotate] = useState(0);
    const [bannerScale, setBannerScale] = useState(1);

    const [isCreating, setIsCreating] = useState(false);

    return <div className="flex-grow flex flex-col gap-10 mx-auto py-8 items-center max-w-3xl">
        <Link href='/'>
            <Gehenna />
        </Link>
        <h1 className="text-2xl font-bold">
            Add Your Startup / Organisation
        </h1>
        <span>
            Add your startup to Gehenna, so that you can start sharing your journey and experiences
            from your org's perspective.
        </span>
        <div className="w-[768px] mx-auto flex flex-col gap-2 justify-center">
            <span>Your Startup Banner</span>
            {
                !banner &&
                <ImageDropzone onUpload={function (files: File[]): void {
                    const file = files[0];
                    setBanner(file);
                    setBannerTmp(URL.createObjectURL(file));
                }} isUploading={isCreating} height={256} accept={["image/*"]} />
            }
            {
                banner &&
                <>
                <AvatarEditor
                    ref={bannerEditorRef}
                    image={bannerTmp}
                    width={768}
                    height={256}
                    border={0}
                    color={[255, 255, 255, 0.6]} // RGBA
                    scale={bannerScale}
                    rotate={bannerRotate}
                    className="w-full h-[256px] object-cover rounded-md"
                />
                <div className="mb-4 w-full">
                    <span>Scale</span>
                    <Slider value={bannerScale} onChange={(e) => setBannerScale(e)} min={1} max={15} step={0.1} label={bannerScale} />
                    <span>Rotate</span>
                    <Slider value={bannerRotate} onChange={(e) => setBannerRotate(e)} min={0} max={360} step={1} label={bannerRotate} />
                </div>
                <CommonButton text="Remove Image" onClick={() => {
                    URL.revokeObjectURL(bannerTmp);
                    setBanner(undefined);
                    setBannerTmp('');
                }} className="mx-auto" />
                </>
            }
        </div>
        <div className="w-64 mx-auto flex flex-col gap-2 justify-center">
            <span>Startup Logo</span>
            {
                !logo &&
                <ImageDropzone onUpload={function (files: File[]): void {
                    const file = files[0];
                    setLogo(file);
                    setLogoTmp(URL.createObjectURL(file));
                }} isUploading={isCreating} height={256} accept={["image/*"]} />
            }
            {
                logo &&
                <>
                <AvatarEditor
                    ref={logoEditorRef}
                    image={logoTmp}
                    width={256}
                    height={256}
                    border={0}
                    color={[255, 255, 255, 0.6]} // RGBA
                    scale={logoScale}
                    rotate={logoRotate}
                    className="w-full h-[256px] object-cover rounded-md" />
                <div className="mb-4 w-full">
                    <span>Scale</span>
                    <Slider value={logoScale} onChange={(e) => setLogoScale(e)} min={1} max={15} step={0.1} label={logoScale} />
                    <span>Rotate</span>
                    <Slider value={logoRotate} onChange={(e) => setLogoRotate(e)} min={0} max={360} step={1} label={logoRotate} />
                </div>
                <CommonButton text="Remove Image" onClick={() => {
                    URL.revokeObjectURL(logoTmp);
                    setLogo(undefined);
                    setLogoTmp('');
                }} className="mx-auto" />
                </>
            }
        </div>
        <div className="w-96 mx-auto flex flex-col gap-2 justify-center">
            <TextInput label="Startup Name" placeholder="Blindr, Shadr, Hooli etc." value={name} onChange={(e) => setName(e.target.value)} />
            <Textarea label="Description" placeholder="Describe your startup" value={description} onChange={(e) => setDescription(e.target.value)} />
            <TextInput label="Mission" placeholder="What is your startup's mission?" value={mission} onChange={(e) => setMission(e.target.value)} />
            <TextInput label="Industry" placeholder="What industry is your startup in?" value={industry} onChange={(e) => setIndustry(e.target.value)} />
            <TextInput label="Domain" placeholder="yourcompany.domain" value={domain} onChange={(e) => setDomain(e.target.value)} />
            <TextInput label="Country" placeholder="Where is your startup located?" value={country} onChange={(e) => setCountry(e.target.value)} />
        </div>
        <div className="w-full mx-auto flex flex-col gap-4 justify-center">
            <div className="flex flex-row items-center gap-4">
                <span>Team Members</span>
                <CommonButton text='Add Member' onClick={() => {

                }} className="text-xs py-1" />
            </div>
            <div className="w-full flex flex-row gap-4 flex-wrap justify-between">
                <TeamMemberAddition onProfileUpload={function (file: File): void {
                    throw new Error("Function not implemented.");
                }} setName={function (name: string): void {
                    throw new Error("Function not implemented.");
                }} setRole={function (role: string): void {
                    throw new Error("Function not implemented.");
                }} />
                <TeamMemberAddition onProfileUpload={function (file: File): void {
                    throw new Error("Function not implemented.");
                }} setName={function (name: string): void {
                    throw new Error("Function not implemented.");
                }} setRole={function (role: string): void {
                    throw new Error("Function not implemented.");
                }} />
                <TeamMemberAddition onProfileUpload={function (file: File): void {
                    throw new Error("Function not implemented.");
                }} setName={function (name: string): void {
                    throw new Error("Function not implemented.");
                }} setRole={function (role: string): void {
                    throw new Error("Function not implemented.");
                }} />
                <TeamMemberAddition onProfileUpload={function (file: File): void {
                    throw new Error("Function not implemented.");
                }} setName={function (name: string): void {
                    throw new Error("Function not implemented.");
                }} setRole={function (role: string): void {
                    throw new Error("Function not implemented.");
                }} />
                <TeamMemberAddition onProfileUpload={function (file: File): void {
                    throw new Error("Function not implemented.");
                }} setName={function (name: string): void {
                    throw new Error("Function not implemented.");
                }} setRole={function (role: string): void {
                    throw new Error("Function not implemented.");
                }} />
            </div>
        </div>
        <div className="w-96 mx-auto flex flex-col gap-4">
            <span>Whereabouts are you in your startup journey?</span>
            <Stepper active={stage} onStepClick={setStage} orientation="vertical">
                <Stepper.Step label="Idea" />
                <Stepper.Step label="Prototype" />
                <Stepper.Step label="MVP" />
                <Stepper.Step label="Beta" />
                <Stepper.Step label="Launched" />
                <Stepper.Step label="Acquired!" />
            </Stepper>
        </div>
    </div>
}