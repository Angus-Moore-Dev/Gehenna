import HandleFooter from "@/components/HandleFooter";
import HandleNavbar from "@/components/HandleNavbar";
import CreateNewPost from "@/components/publish/CreateNewPost";
import { createServerClient } from "@/utils/supabase/server";
import { Metadata, ResolvingMetadata } from "next";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata>
{
    return {
        title: 'Create New Post | Gehenna',
        description: 'Write a new post on Gehenna.',
        icons: {
            icon: '/favicon.ico'
        },
        openGraph: {
            images: ['/favicon.ico'],
            description: 'Write a new post on Gehenna.',
            title: 'Create New Post | Gehenna',
        }
    }
}


export default async function PublishNewPost({ params }: { params: { handle: string }})
{
    const supabase = createServerClient();
    const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('handle', params.handle)
    .single();

    const user = (await supabase.auth.getUser()).data.user;

    if (error || !profile)
        redirect('/404');

    if (!user || user.id !== profile.id)
        redirect('/404');

    const { data: topics, error: topicsError } = await supabase
    .from('postTopics')
    .select('*')
    .eq('userId', profile.id);

    if (topicsError)
        redirect('/500');
    
    return <div className="w-full flex flex-col items-center gap-5">
        <div className="w-full max-w-4xl mt-32 flex-grow min-h-screen flex flex-col items-center gap-10">
            <CreateNewPost profile={profile} topics={topics} />
        </div>
        {/* <HandleFooter profile={profile} /> */}
    </div>
}