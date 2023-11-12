import { Post } from "@/models/Post";
import { Profile } from "@/models/Profile";
import { GetStaticPaths, GetStaticPropsContext } from "next";
import Image from "next/image";
import Link from "next/link";
import { TypographyStylesProvider, Chip, CopyButton, Tooltip, ActionIcon } from "@mantine/core";
import { v4 } from "uuid";
import Head from "next/head";
import { Gehenna } from "@/components/Gehenna";
import PostSettingsModal from "@/components/PostSettingsModal";
import { IconClock, IconLink } from "@tabler/icons-react";
import { createClient } from "@supabase/supabase-js";

interface PostIdPageProps
{
    post: Post;
    poster: Profile;
    me: Profile | null;
}

export default function PostIdPage({ post, poster, me }: PostIdPageProps)
{
    return <div className="w-full flex-grow flex flex-col gap-4 max-w-3xl mx-auto py-8">
        <Head>
            <title>Gehenna - {post.title}</title>
            <meta property="og:title" content={`Gehenna | ${post.title}`} />
            <meta property="og:description" content='Click to read this post on Gehenna now!' />
            <meta property="og:image" content={post.postImageURL.url} />
            <meta property="og:url" content={`https://www.gehenna.dev/${post.id}`} />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={post.title} />
            <meta name="twitter:description" content={"Click here to read this article on Gehenna"} />
            <meta name="twitter:image" content={post.postImageURL.url} />
            <meta name="twitter:url" content={`https://www.gehenna.dev/${post.id}`} />
        </Head>
        {
            me && !me.emailVerified &&
            <div className='w-full h-full flex items-center justify-center flex-col gap-4 -mt-16 mb-4 bg-primary-light'>
                <span className='mx-auto text-white font-semibold py-2'>Please verify your email to post and comment!</span>
            </div>
        }
        <Link href='/' className="flex flex-col items-center justify-center mb-10 group">
            <Gehenna />
        </Link>
        <div className="w-full">
            <div className="flex flex-row gap-4 items-center mb-4 relative">
                <Image src={poster.avatar} alt='me' width={50} height={50} className="object-cover rounded-md w-[50px] h-[50px]" />
                <span className="font-semibold text-xl">
                    <span>{poster.username} <i>wrote:</i></span>
                    <br />
                    <div className="flex flex-row gap-4 items-center mt-2">
                        <span className="text-sm font-normal text-gray-500">Posted on {new Date(post.createdAt).toLocaleDateString('en-au', { dateStyle: 'full' })}</span>
                        <div className="flex flex-row items-center gap-2">
                            <IconClock size={16} className='text-neutral-400' />
                            <small className="text-neutral-400 font-extralight text-xs">
                                {Math.ceil(post.content.split(' ').length / 250)} min read
                            </small>
                        </div>
                    </div>
                </span>
                <div className="flex-grow flex flex-row justify-end gap-4">
                    <CopyButton value={`https://www.gehenna.dev/${post.id}`} timeout={25000}>
                        {({ copied, copy }) => (
                            <>
                            <Tooltip label={copied ? 'Copied!' : 'Copy link to clipboard'} position="bottom">
                                <ActionIcon onClick={copy} size="xl">
                                    {
                                        copied ?
                                        <IconLink size={24} onClick={copy} className="text-green-500"  />
                                        :
                                        <IconLink size={24} onClick={copy} className="text-neutral-400" />
                                    }
                                </ActionIcon>
                            </Tooltip>
                            </>
                        )}
                    </CopyButton>
                    {
                        me && me.id === poster.id &&
                        <PostSettingsModal post={post} />
                    }
                </div>
            </div>
            <section className="flex flex-row flex-wrap gap-1.5 mb-4">
            {
                post.tags.map((tag, index) => <Chip checked={false} key={index} color="yellow">{tag}</Chip>)
            }
            </section>
            <h1 className="text-5xl font-bold border-b-2 pb-2 mb-4 border-b-primary-light text-white">
                {post.title}
            </h1>
            <Image src={post.postImageURL.url} alt='' quality={100} priority={true} width={1000} height={450} className="w-full h-[450px] object-cover mx-auto rounded-md" />
        </div>
        <TypographyStylesProvider>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </TypographyStylesProvider>
        <section className="flex flex-col flex-wrap gap-2 border-t-2 border-t-secondary pt-2">
            {
                post.attachedFileURLs.length > 0 &&
                <span className="text-lg font-semibold">Attached Files</span>
            }
            <section className="w-full flex flex-row flex-wrap gap-2 items-start">
            {
                post.attachedFileURLs.map(file => {
                    if (file.mimeType.includes('image'))
                        return <Image src={file.url} alt={v4()} quality={100} width='1000' height='1000' className={`object-cover min-w-[45%] flex-1 rounded-md ${post.attachedFileURLs.length > 1 && 'h-[350px]'}`} />
                    else if (file.mimeType.includes('audio'))
                        return <audio className="min-w-[45%] flex-1" controls>
                            <source src={file.url} type={file.mimeType} />
                        </audio>
                    else if (file.mimeType.includes('video'))
                        return <video className="min-w-[45%] flex-1 rounded-md" controls>
                            <source src={file.url} type={file.mimeType} />
                        </video>
                })
            }
            </section>
        </section>
    </div>
}


export const getStaticPaths = (async () => 
{
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    // Now get the post
    const posts = (await supabase.from('post').select('id')).data?.map(x => x.id) ?? [] as string[];

    console.log('fetched', posts.length, 'posts to prerender');

    const paths = posts.filter(x => x !== undefined).map((postId) => ({
        params: { postId }
    }));

    return {
        paths,
        fallback: true
    }
}) satisfies GetStaticPaths;



export const getStaticProps = async ({ params }: GetStaticPropsContext) =>
{
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const postId = params?.postId as string;

    if (postId === '[postId]')
    {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        };
    }

    const post = (await supabase.from('post').select('*').eq('id', postId).single()).data as Post;
    const poster = (await supabase.from('profiles').select('*').eq('id', post.userId).single()).data as Profile;

    console.log('generating static page for post', post.title);
    console.log('poster::', poster);

    return {
        props: {
            post: post,
            me: null,
            poster: poster,
        },
        revalidate: 600, // ISR every 10 minutes
    };
};