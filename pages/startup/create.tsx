import CommonButton from "@/components/CommonButton";
import { Gehenna } from "@/components/Gehenna";
import { ImageDropzone } from "@/components/ImageDropzone";
import { Slider, Stepper, TextInput, Textarea } from "@mantine/core";
import Link from "next/link";
import { useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";

export default function CreateNewStartup()
{
    const [name, setName] = useState('');
    const [industry, setIndustry] = useState('');
    const [goal, setGoal] = useState('');
    const [description, setDescription] = useState('');
    const [country, setCountry] = useState('');
    const [stage, setStage] = useState(0);
    
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

    return <div className="flex-grow flex flex-col gap-4 mx-auto py-8 items-center max-w-3xl">
        <Link href='/'>
            <Gehenna />
        </Link>
        <h1 className="text-2xl font-bold">
            Create a New Startup
        </h1>
        <span>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. In unde id natus sapiente nihil voluptatibus architecto ea cupiditate, dolorum veritatis!
        </span>
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
        <div className="w-full mx-auto flex flex-col gap-2 justify-center mb-10">
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
        <div className="w-96 mx-auto flex flex-col gap-2 justify-center">
            <TextInput label="Startup Name" placeholder="Blindr, Shadr, Hooli etc." value={name} onChange={(e) => setName(e.target.value)} />
            <Textarea label="Description" placeholder="Describe your startup" value={description} onChange={(e) => setDescription(e.target.value)} />
            <TextInput label="Industry" placeholder="What industry is your startup in?" value={industry} onChange={(e) => setIndustry(e.target.value)} />
            <TextInput label="Goal" placeholder="What is your startup's goal?" value={goal} onChange={(e) => setGoal(e.target.value)} />
            <TextInput label="Country" placeholder="Where is your startup located?" value={country} onChange={(e) => setCountry(e.target.value)} />
        </div>
        <div className="w-96 mx-auto flex flex-col gap-2 justify-center">
            <span>Team Members</span>
            <div className="w-full flex flex-row gap-4 flex-wrap">
                
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