import HandleNavbar from "@/components/HandleNavbar";
import PostPreviewBox from "@/components/PostPreviewBox";
import { MediaInfo } from "@/utils/global.types";
import { createServerSupabase } from "@/utils/supabase/server";
import { redirect } from "next/navigation";


export default async function AuthorHomePage({ params }: { params: { handle: string }})
{
    const supabase = createServerSupabase();
    const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('handle', params.handle)
    .single();

    if (error && !profile)
        redirect('/404');

    const { data: posts, error: postError } = await supabase
    .from('post')
    .select('id, title, postImageURL, tags, createdAt')
    .eq('public', true)
    .eq('userId', profile.id);

    if (postError && !posts)
        redirect('/500');

    return <div className="w-full flex flex-col items-center gap-10">
        <HandleNavbar handle={profile.username} />
        <div className="w-full flex flex-row justify-center flex-wrap gap-10 px-8">
            {
                posts.map(post => <PostPreviewBox
                    key={post.id}
                    post={post as { id: string, title: string, postImageURL: MediaInfo, tags: string[], createdAt: string }}
                    profile={profile} />
                )
            }
        </div>
    </div>
}