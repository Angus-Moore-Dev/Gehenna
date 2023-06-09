import { Gehenna } from "@/components/Gehenna";
import { Post } from "@/models/Post";
import { Profile } from "@/models/Profile";
import { Loader } from "@mantine/core";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type SearchFound = {
    title: boolean;
    content: boolean;
    tags: boolean;
}


export default function GlobalSearchResults()
{
    const router = useRouter();
    const { keywords } = router.query as { keywords: string };
    const [isLoading, setIsLoading] = useState(true);
    const [posts, setPosts] = useState<Post[]>([]);
    const [users, setUsers] = useState<Profile[]>([]);

    // So that it is known how the post was found, text highlighting for the relevant content.
    const [postSearchType, setPostSearchType] = useState<{ id: string, reason: SearchFound }[]>([]);

    useEffect(() => {
        /*
            There is a checklist system, where people can select different categories. By default it's posts.
            1. Look for posts that have this keyword
            2. Look for descriptions that have this keyword
            3. Look for users that have this keyword
            4. Look for tags that have this keyword
        */
    }, []);

    return <div className="flex-grow w-full h-full flex flex-col gap-4 mx-auto py-8 items-center max-w-3xl">
        <Head>
            <title>Gehenna - Search Results</title>
        </Head>
        <Link href='/'>
            <Gehenna />
        </Link>
        <span className="text-4xl font-bold w-full">Search Results</span>
        {
            isLoading &&
            <div className="flex-grow flex items-start justify-center pt-24">
                <Loader />
            </div>
        }
        {
            !isLoading &&
            <div className="flex-grow flex flex-col pt-24">

            </div>
        }
    </div>
}