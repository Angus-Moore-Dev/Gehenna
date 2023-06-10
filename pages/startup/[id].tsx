import { Gehenna } from "@/components/Gehenna";
import { serverDb } from "@/lib/db";
import { Profile } from "@/models/Profile";
import { Startup } from "@/models/Startup";
import { ScrollArea, Tabs } from "@mantine/core";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

export default function StartupPage({ startup, me }: { startup: Startup, me: Profile | null })
{
    return <div className="w-full flex-grow flex flex-col gap-4 max-w-4xl mx-auto py-8">
        <Head>
            <title>Gehenna - {startup.name}</title>
            <meta property="og:title" content={`Gehenna | ${startup.name}`} />
            <meta property="og:description" content='Click to read this post on Gehenna now!' />
            <meta property="og:image" content={startup.avatar} />
            <meta property="og:url" content={`https://www.gehenna.dev/startup/${startup.id}`} />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={startup.name} />
            <meta name="twitter:description" content={"Click here to read this article on Gehenna"} />
            <meta name="twitter:image" content={startup.avatar} />
            <meta name="twitter:url" content={`https://www.gehenna.dev/startup/${startup.id}`} />
        </Head>
        <Link href='/' className="flex flex-col items-center justify-center mb-10 group">
            <Gehenna />
        </Link>
        <section className="w-full flex flex-col">
            <Image src={startup.bannerURL} width={1000} height={256} quality={100} alt="Profile Banner" className="object-cover rounded-t-md w-full h-[256px]" />
            <section className="w-full flex flex-row gap-4 items-start bg-tertiary p-4 rounded-b-md">
                <Image src={startup.avatar} width={100} height={100} alt="Profile Picture" className="object-cover rounded-md" />
                <section className="flex flex-col">
                    <h1 className="text-2xl font-semibold">{startup.name}</h1>
                    <p className="font-light text-sm">{startup.industry}</p>
                    <small>{startup.country}</small>
                    <Link href={`https://${startup.domain}`} target="_blank" rel="noopener noreferrer">
                        <span className="text-sm text-blue-500 hover:underline">{startup.domain}</span>
                    </Link>
                </section>
                <section className="ml-auto">
                    <ScrollArea h={100} className="text-sm" color="yellow" type="auto" offsetScrollbars scrollbarSize={4}>
                        {startup.bio}
                    </ScrollArea>
                </section>
            </section>
        </section>
        <section className="w-full">
            <Tabs defaultValue="Posts" className="w-full" orientation="horizontal">
                <Tabs.List>
                    <Tabs.Tab value="Posts" className={`${me && 'w-1/3'} ${!me && 'w-1/2'}`}>Posts</Tabs.Tab>
                    <Tabs.Tab value="Team" className={`${me && 'w-1/3'} ${!me && 'w-1/2'}`}>Team</Tabs.Tab>
                    {
                        me &&
                        me.startups.some(s => s === startup.id) && <Tabs.Tab value="Settings" className="w-1/3">Settings</Tabs.Tab>
                    }
                </Tabs.List>
            </Tabs>
        </section>
    </div>
}

export const getServerSideProps = async (context: GetServerSidePropsContext) =>
{
    const supabase = serverDb(context);
    const user = (await supabase.auth.getUser()).data?.user;
    const startup = (await supabase.from('startups').select('*').eq('id', context.params?.id).single()).data as Startup;
    if (user)
    {
        const me = (await supabase.from('profiles').select('*').eq('id', user.id).single()).data as Profile;
        return {
            props: {
                startup,
                me
            }
        }
    }
    else
    {
        return {
            props: {
                startup,
                me: null
            }
        }
    }
}