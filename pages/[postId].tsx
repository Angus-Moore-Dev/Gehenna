import { Post } from "@/models/Post";
import { serverDb } from "@/lib/db";
import { Profile } from "@/models/Profile";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import Link from "next/link";
import { TypographyStylesProvider, Chip, CopyButton, Tooltip, ActionIcon } from "@mantine/core";
import { v4 } from "uuid";
import { useRef, useState } from "react";
import { useClickAway } from "ahooks";
import Head from "next/head";
import { Gehenna } from "@/components/Gehenna";
import PostSettingsModal from "@/components/PostSettingsModal";
import { IconClock, IconLink } from "@tabler/icons-react";

interface PostIdPageProps
{
    post: Post;
    poster: Profile;
    me: Profile | null;
}

export default function PostIdPage({ post, poster, me }: PostIdPageProps)
{
    const commentRef = useRef<HTMLDivElement>(null);
    const [comment, setComment] = useState('');
    const [postData, setPostData] = useState(post);
    const [showCard, setShowCard] = useState(false);

    // setup a useClickAway hook
    const ref = useRef(null);
    useClickAway(() => {
        setShowCard(false);
    }, ref);

    return <div className="w-full flex-grow flex flex-col gap-4 max-w-3xl mx-auto py-8">
        <Head>
            <title>Gehenna - {postData.title}</title>
            <meta property="og:title" content={`Gehenna | ${postData.title}`} />
            <meta property="og:description" content='Click to read this post on Gehenna now!' />
            <meta property="og:image" content={postData.postImageURL.url} />
            <meta property="og:url" content={`https://www.gehenna.dev/${postData.id}`} />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={postData.title} />
            <meta name="twitter:description" content={"Click here to read this article on Gehenna"} />
            <meta name="twitter:image" content={postData.postImageURL.url} />
            <meta name="twitter:url" content={`https://www.gehenna.dev/${postData.id}`} />
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
                <Image ref={ref} src={poster.avatar} alt='me' width={50} height={50} className="object-cover rounded-md w-[50px] h-[50px]" />
                <span className="font-semibold text-xl">
                    <span>{poster.username} <i>wrote:</i></span>
                    <br />
                    <div className="flex flex-row gap-4 items-center mt-2">
                        <span className="text-sm font-normal text-gray-500">Posted on {new Date(postData.createdAt).toLocaleDateString('en-au', { dateStyle: 'full' })}</span>
                        <div className="flex flex-row items-center gap-2">
                            <IconClock size={16} className='text-neutral-400' />
                            <small className="text-neutral-400 font-extralight text-xs">
                                {Math.ceil(postData.content.split(' ').length / 250)} min read
                            </small>
                        </div>
                    </div>
                </span>
                <div className="flex-grow flex flex-row justify-end gap-4">
                    <CopyButton value={`https://www.gehenna.dev/${postData.id}`} timeout={25000}>
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
                        <PostSettingsModal post={postData} setPost={setPostData} />
                    }
                </div>
            </div>
            <section className="flex flex-row flex-wrap gap-1.5 mb-4">
            {
                postData.tags.map((tag, index) => <Chip checked={false} key={index} color="yellow">{tag}</Chip>)
            }
            </section>
            <h1 className="text-5xl font-bold border-b-2 pb-2 mb-4 border-b-primary-light text-white">
                {postData.title}
            </h1>
            <Image src={postData.postImageURL.url} alt='' quality={100} priority={true} width={1000} height={450} className="w-full h-[450px] object-cover mx-auto rounded-md" />
        </div>
        <TypographyStylesProvider>
            <div dangerouslySetInnerHTML={{ __html: postData.content }} />
        </TypographyStylesProvider>
        <section className="flex flex-col flex-wrap gap-2 border-t-2 border-t-secondary pt-2">
            {
                postData.attachedFileURLs.length > 0 &&
                <span className="text-lg font-semibold">Attached Files</span>
            }
            <section className="w-full flex flex-row flex-wrap gap-2 items-start">
            {
                postData.attachedFileURLs.map(file => {
                    if (file.mimeType.includes('image'))
                        return <Image src={file.url} alt={v4()} quality={100} width='1000' height='1000' className={`object-cover min-w-[45%] flex-1 rounded-md ${postData.attachedFileURLs.length > 1 && 'h-[350px]'}`} />
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


export const getServerSideProps = async (context: GetServerSidePropsContext) => 
{
	const db = serverDb(context);
	const user = (await db.auth.getUser()).data.user;

	// Get the profile.
    const profile = user ? (await db.from('profiles').select('*').eq('id', user.id).single()).data as Profile : null;

    // Now get the post
    const { postId } = context.query as { postId: string };
    const post = (await db.from('post').select('*').eq('id', postId).single()).data as Post;

    // Now get the poster
    const poster = (await db.from('profiles').select('*').eq('id', post.userId).single()).data as Profile;

    return {
        props: {
            post: post,
            me: profile,
            poster: poster,
        }
    }
}