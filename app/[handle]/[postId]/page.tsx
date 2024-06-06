import HandleNavbar from "@/components/HandleNavbar";
import PostContent from "@/components/posts/PostContent";
import { appDomain, appHttp } from "@/utils/appURL";
import { MediaInfo } from "@/utils/global.types";
import { createServerClient } from "@/utils/supabase/server";
import { Metadata, ResolvingMetadata } from "next";
import { redirect } from "next/navigation";

let favicon = '/favicon.ico';

export async function generateMetadata({ params }: { params: { postId: string }}, parent: ResolvingMetadata): Promise<Metadata>
{
    const postId = params.postId;
    const supabase = createServerClient();

    const { data: post, error: postError } = await supabase
    .from('post')
    .select('id, title, byline, userId, postImageURL')
    .eq('id', postId)
    .single();

    if (!post && postError)
    {
        return {
            title: 'Gehenna',
            openGraph: {
                images: ['/favicon.ico']
            }
        }
    }

    const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', post.userId)
    .single();

    if (!profile && error)
    {
        return {
            title: 'Gehenna',
            openGraph: {
                images: ['/favicon.ico']
            }
        }
    }

    return {
        title: `${post.title}`,
        description: post.byline,
        icons: {
            icon: profile.avatar || favicon
        },
        openGraph: { images: [(post.postImageURL as MediaInfo).url || favicon] }
    }
}

export default async function PostPage({ params }: { params: { postId: string, handle: string } })
{
    const supabase = createServerClient();
    const user = (await supabase.auth.getUser()).data.user;

    const { data: post, error: postError } = await supabase
    .from('post')
    .select(`
        *,
        postTopics (
            title
        )
    `)
    .eq('id', params.postId)
    .single();

    if (!post && postError)
    {
        console.error(postError);
        redirect('/404');
    }

    const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', post.userId)
    .single();

    if (error && !profile)
        redirect('/404');

    const { data, count } = await supabase
    .from('postLikes')
    .select('*', { count: 'exact', head: false })
    .eq('postId', post.id);

    if (profile.handle !== params.handle)
    {
        // It means the user is on another handle looking at a post from another person.
        // We want to redirect them to that user's handle instead.
        const newURL = `${appHttp}://${profile.handle}.${appDomain}/${post.id}`;
        redirect(newURL);
    }
    return <div className="w-full min-h-screen flex flex-col gap-10 items-center">
        <PostContent
        post={post}
        postTopicTitle={post.postTopics?.title ?? ''}
        profile={profile}
        user={user}
        postLikes={count !== null ? count : 0}
        isAlreadyLiked={data ? data.some(x => x.userId === user?.id) : false}
        />
        {/* <HandleFooter profile={profile} /> */}
    </div>
}