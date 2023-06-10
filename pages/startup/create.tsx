import CommonButton from "@/components/CommonButton";
import { Gehenna } from "@/components/Gehenna";
import { ImageDropzone } from "@/components/ImageDropzone";
import TeamMemberAddition from "@/components/startup/TeamMemberAddition";
import { clientDb, serverDb } from "@/lib/db";
import { Profile } from "@/models/Profile";
import { Startup, TeamRole } from "@/models/Startup";
import { Accordion, Autocomplete, Checkbox, Select, Slider, Stepper, TextInput, Textarea } from "@mantine/core";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";
import countryList from 'react-select-country-list';
import { toast } from "react-toastify";
import { v4 } from "uuid";

interface CreateNewStartupProps
{
    me: Profile;
}

export default function CreateNewStartup({ me }: CreateNewStartupProps)
{
    const router = useRouter();
    const [name, setName] = useState('');
    const [industry, setIndustry] = useState('');
    const [mission, setMission] = useState('');
    const [description, setDescription] = useState('');
    const [country, setCountry] = useState('');
    const countries = useMemo(() => countryList().getLabels(), []);
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

    const [theme, setTheme] = useState<"Light" | "Dark">("Dark");

    const [teamMembers, setTeamMembers] = useState<{ profilePicture: File | undefined, profilePictureTmp: string, name: string, email: string, role: string, }[]>([
        {
            profilePicture: undefined,
            profilePictureTmp: me.avatar,
            name: me.username,
            email: me.email,
            role: '',
        }
    ]);

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
            from your org's perspective. You will also be able to add your team members to your startup and allow
            others to follow you!
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
            <TextInput required label="Startup Name" placeholder="Blindr, Shadr, Hooli etc." value={name} onChange={(e) => setName(e.target.value)} />
            <Textarea required label="Description" placeholder="Describe your startup" value={description} onChange={(e) => setDescription(e.target.value)} />
            <TextInput label="Mission" placeholder="What is your startup's mission?" value={mission} onChange={(e) => setMission(e.target.value)} />
            <TextInput label="Industry" placeholder="What industry is your startup in?" value={industry} onChange={(e) => setIndustry(e.target.value)} />
            <TextInput label="Domain" placeholder="yourcompany.domain" value={domain} onChange={(e) => setDomain(e.target.value)} />
            <Autocomplete value={country} label="Country" placeholder="Select Your Startup's Country" data={countries} onChange={setCountry} />
            <section className="w-full mt-4 flex flex-col gap-2">
                <span>Select Your Page Theme</span>
                <Checkbox value="Light" label="Light" checked={theme === 'Light'} onChange={(e) => setTheme('Light')} />
                <Checkbox value="Dark" label="Dark" checked={theme === 'Dark'} onChange={(e) => setTheme('Dark')} />
            </section>
        </div>
        {/* <div className="w-96 mx-auto flex flex-col gap-4">
            <span>Whereabouts are you in your startup journey?</span>
            <Stepper active={stage} onStepClick={setStage} orientation="vertical">
                <Stepper.Step label="Idea" />
                <Stepper.Step label="Prototype" />
                <Stepper.Step label="MVP" />
                <Stepper.Step label="Beta" />
                <Stepper.Step label="Launched" />
            </Stepper>
        </div> */}
        <div className="w-full mx-auto flex flex-col gap-4 justify-center">
            <div className="flex flex-row items-center gap-4">
                <span>Team Members</span>
                <CommonButton text='Add Member' onClick={() => {
                    setTeamMembers([...teamMembers, { profilePicture: undefined, profilePictureTmp: '', name: '', email: '', role: ''}])
                }} className="text-xs py-1" />
            </div>
            <div className="w-full flex flex-row gap-4 flex-wrap justify-between">
                {
                    teamMembers.map((member, index) => (
                        <TeamMemberAddition 
                        index={index}
                        key={index}
                        name={member.name}
                        email={member.email}
                        role={member.role}
                        profilePicture={member.profilePicture}
                        profilePictureTmp={member.profilePictureTmp}
                        setName={(name) => {
                            const newTeamMembers = [...teamMembers];
                            newTeamMembers[index].name = name;
                            setTeamMembers(newTeamMembers);
                        }}
                        setEmail={(email) => {
                            const newTeamMembers = [...teamMembers];
                            newTeamMembers[index].email = email;
                            setTeamMembers(newTeamMembers);
                        }}
                        setRole={(role) => {
                            const newTeamMembers = [...teamMembers];
                            newTeamMembers[index].role = role;
                            setTeamMembers(newTeamMembers);
                        }}
                        setProfilePicture={(file) => {
                            const newTeamMembers = [...teamMembers];
                            newTeamMembers[index].profilePicture = file;
                            newTeamMembers[index].profilePictureTmp = URL.createObjectURL(file);
                            setTeamMembers(newTeamMembers);
                        }}
                        removeTeamMember={() => {
                            const teamMember = {...teamMembers[index]};
                            URL.revokeObjectURL(teamMember.profilePictureTmp);
                            setTeamMembers(teamMembers.filter((_, i) => i !== index));
                        }}
                        />
                    ))
                }
            </div>
        </div>
        <div className="w-full mx-auto flex flex-col gap-4">
            <span>
                If you have filled out everything, then you are ready to create your startup page!
                <br />
                <br />
                <small>Don't worry, you can change your startup details at any time.</small>
            </span>
            {
                name && description && logo && banner &&
                <CommonButton text="Create Startup" onClick={async () => {
                    setIsCreating(true);
                    const id: string = v4();
                    logoEditorRef.current?.getImageScaledToCanvas().toBlob(async (logoBlob) => {
                        bannerEditorRef.current?.getImageScaledToCanvas().toBlob(async (bannerBlob) => {
                            const logoRes = await clientDb.storage.from('startup_pictures').upload(`${id}/avatar.${logoBlob?.type.split('/')[1]}`, logoBlob as File,
                            {
                                contentType: logoBlob?.type,
                                cacheControl: '3600',
                            });
                            if (logoRes.error)
                            {
                                toast.error('logo:' + logoRes.error.message);
                                setIsCreating(false);
                                return;
                            }

                            const logoUrl = clientDb.storage.from('startup_pictures').getPublicUrl(`${id}/avatar.${logoBlob?.type.split('/')[1]}`).data.publicUrl;
                            
                            const bannerRes = await clientDb.storage.from('startup_pictures').upload(`${id}/banner.${bannerBlob?.type.split('/')[1]}`, bannerBlob as File,
                            {
                                contentType: bannerBlob?.type,
                                cacheControl: '3600',
                            });

                            if (bannerRes.error)
                            {
                                toast.error('banner:' + bannerRes.error.message);
                                setIsCreating(false);
                                return;
                            }

                            const bannerUrl = clientDb.storage.from('startup_pictures').getPublicUrl(`${id}/banner.${bannerBlob?.type.split('/')[1]}`).data.publicUrl;

                            // All team member avatars
                            const teamMemberAvatars: { email: string, url: string }[] = [];
                            for (const member of teamMembers)
                            {
                                if (member.profilePicture)
                                {
                                    const memberId = v4();
                                    const res = await clientDb.storage.from('startup_pictures').upload(
                                        `${id}/team_avatars/${memberId}.${member.profilePicture?.type.split('/')[1]}`,
                                        member.profilePicture,
                                        {
                                            contentType: member.profilePicture?.type,
                                            cacheControl: '3600',
                                        }
                                    );

                                    if (!res.error)
                                    {
                                        URL.revokeObjectURL(member.profilePictureTmp);
                                        const url = clientDb.storage.from('startup_pictures').getPublicUrl(`${id}/team_avatars/${memberId}.${member.profilePicture?.type.split('/')[1]}`).data.publicUrl;
                                        teamMemberAvatars.push({
                                            email: member.email,
                                            url: url
                                        });
                                    }
                                }
                                
                                // Now we add the base url which is me
                                teamMemberAvatars.push({
                                    email: me.email,
                                    url: me.avatar
                                });
                            }

                            const teamMemberData: TeamRole[] = teamMembers.map((member) => ({
                                name: member.name,
                                email: member.email,
                                role: member.role,
                                avatar: teamMemberAvatars.find((avatar) => avatar.email === member.email)?.url ?? ''
                            }));

                            // Update me to the startup
                            const startup: Startup = {
                                id: id,
                                name: name,
                                bio: description,
                                country: country,
                                mission: mission,
                                domain: domain,
                                industry: industry,
                                avatar: logoUrl,
                                bannerURL: bannerUrl,
                                team: teamMemberData,
                                theme: theme,
                            };

                            const res = await clientDb.from('startups').insert([startup]);
                            if (res.error)
                            {
                                toast.error(res.error.message);
                                setIsCreating(false);
                                return;
                            }
                            else
                            {
                                const res = await clientDb.from('profiles').update({
                                    startups: [...me.startups, id]
                                }).eq('id', me.id);

                                if (res.error)
                                {
                                    toast.error(res.error.message);
                                    setIsCreating(false);
                                    return;
                                }
                                else
                                {
                                    toast.success('Startup created!');
                                    await router.push(`/startups/${id}`);
                                }
                            }
                        });
                    });
                }} className="ml-auto mt-4" />
            }
        </div>
    </div>
}


export const getServerSideProps = async (context: GetServerSidePropsContext) =>
{
    const supabase = serverDb(context);
    const user = (await supabase.auth.getUser()).data.user;

    if (!user)
    {
        return {
            redirect: {
                destination: '/403',
                permanent: false
            }
        }
    }
    else
    {
        const me = (await supabase.from('profiles').select('*').eq('id', user.id).single()).data as Profile;
        return {
            props: {
                me
            }
        }
    }
}