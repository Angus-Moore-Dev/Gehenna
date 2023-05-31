import { Post } from "@/models/Post";
import { Comment } from '@/models/Comment';
import { clientDb, serverDb } from "@/lib/db";
import { Profile } from "@/models/Profile";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import Link from "next/link";
import { TypographyStylesProvider, Textarea, Chip } from "@mantine/core";
import CommonButton from "@/components/CommonButton";
import { v4 } from "uuid";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import CommentBox from "@/components/CommentBox";
import { Notification } from "@/models/Notification";
import { useRouter } from "next/router";
import ProfileCard from "@/components/ProfileCard";
import { useClickAway } from "ahooks";
import Head from "next/head";
import { Gehenna } from "@/components/Gehenna";
import PostSettingsModal from "@/components/PostSettingsModal";
import { Reaction } from "@/models/Reaction";
import Reactions from "@/components/Reactions";

interface PostIdPageProps
{
    post: Post;
    poster: Profile;
    me: Profile | null;
    commenters: Profile[];
    comments: Comment[];
    reactions: Reaction[];
}

export default function PostIdPage({ post, poster, me, comments, commenters, reactions }: PostIdPageProps)
{
    const router = useRouter();
    const [postCommentors, setPostCommentors] = useState(commenters);
    const [postComments, setPostComments] = useState(comments);
    const [comment, setComment] = useState('');
    const commentBoxRef = useRef<HTMLDivElement>(null);
    const [postData, setPostData] = useState(post);
    const [reactionsData, setReactionsData] = useState(reactions);

    const [showCard, setShowCard] = useState(false);

    const [showSettings, setShowSettings] = useState(false);

    // setup a useClickAway hook
    const ref = useRef(null);
    useClickAway(() => {
        setShowCard(false);
    }, ref);

    useEffect(() => {
        // CHANNEL SUBSCRIPTIONS ------------------------------------------------------------------------------------------------------------
        clientDb.channel('newComments').on('postgres_changes', { event: '*', schema: 'public', table: 'comments'}, (payload) => {
            if (payload.eventType === 'INSERT')
            {
                if (payload.new.postId === postData.id)
                {
                    const newComment = payload.new as Comment;
                    if (!postCommentors.some(x => x.id === newComment.userId))
                    {
                        // We fetch the new commentor.
                        clientDb.from('profiles').select('*').eq('id', newComment.userId).then(res => {
                            if (!res.error && res.data)
                            {
                                setPostCommentors([...postCommentors, res.data[0] as Profile]);
                            }
                            else if (res.error)
                            {
                                toast.error(res.error.message);
                            }
                        });
                    }
                    setPostComments([...postComments, newComment]);
                    commentBoxRef.current?.scrollIntoView({ behavior: 'smooth' });
                }
            }
            else if (payload.eventType === 'UPDATE')
            {
                if (payload.new.postId === postData.id)
                {
                    const updatedComment = payload.new as Comment;
                    const updatedComments = postComments.map(comment => {
                        if (comment.id === updatedComment.id)
                        {
                            return updatedComment;
                        }
                        else
                        {
                            return comment;
                        }
                    });
                    setPostComments(updatedComments);
                }
            }
            else
            {
                const deletedComment = payload.old as Comment;
                const updatedComments = postComments.filter(comment => comment.id !== deletedComment.id);
                setPostComments(updatedComments);
            }
        }).subscribe();


        clientDb.channel('post-updates').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'post'}, (payload) => {
            if (payload.eventType === 'UPDATE')
            {
                if (payload.new.id === postData.id)
                {
                    const updatedPost = payload.new as Post;
                    setPostData(updatedPost);
                }
            }
        }).subscribe();


        if (me)
        {
            // Listen for new notifications.
            clientDb.channel('notifications').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications'}, (payload) => {
                const newNotification = payload.new as Notification;
                if (newNotification.userId === me.id)
                {
                    toast.info(newNotification.title, {
                        onClick() {
                            router.push(`${window.location.origin}${newNotification.link}`);
                        }
                    });
                }
            }).subscribe();
        }

    }, []);

    return <div className="w-full h-full flex flex-col gap-4 max-w-3xl mx-auto py-16">
        <Head>
            <title>Gehenna - {post.title}</title>
            <meta property="og:title" content={`Gehenna - ${post.title}`} />
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
                <Image ref={ref} src={poster.avatar} alt='me' width={50} height={50} className="object-cover rounded-md w-[50px] h-[50px] transition shadow-md hover:shadow-primary hover:cursor-pointer hover:animate-pulse"
                onClick={async () => {
                    setShowCard(!showCard);
                }} />
                {
                    showCard &&
                    <div className="absolute top-14">
                        <ProfileCard profile={poster} /> 
                    </div>
                }
                <span className="font-semibold text-xl">
                    {poster.username} <i>wrote:</i>
                    <br />
                    <span className="text-sm font-normal text-gray-500">Posted on {new Date(postData.createdAt).toLocaleDateString('en-au', { dateStyle: 'full' })}</span>
                </span>
                {
                    me && post.userId === me.id &&
                    <div className="flex-grow flex flex-row justify-end gap-4">
                        <PostSettingsModal postId={post.id} />
                    </div>
                }
            </div>
            <section className="flex flex-row flex-wrap gap-1.5 mb-4">
            {
                post.tags.map((tag, index) => <Chip checked={false} key={index} color="yellow">{tag}</Chip>)
            }
            </section>
            <h1 className="text-4xl font-bold border-b-2 pb-2 mb-4 border-b-primary-light">
                {postData.title}
            </h1>
            <Image src={post.postImageURL?.url} alt='' quality={100} priority={true} width={1000} height={450} className="w-full h-[450px] object-cover mx-auto rounded-md" />
        </div>
        <TypographyStylesProvider>
            <div dangerouslySetInnerHTML={{ __html: postData.content }} />
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
        <Reactions reactions={reactions} me={me} post={post} />
        <div className="flex-grow flex flex-col gap-4 mt-4">
            <h1 className="text-2xl font-bold">Comments <small className="text-xs text-primary">(Still a bit buggy...)</small></h1>
            <div className="flex-grow h-full flex flex-col">
                <div className="flex-grow flex flex-col gap-2 mb-4 border-t-2 border-t-primary">
                    {
                        postComments.length === 0 &&
                        <div className="flex-grow flex flex-col items-start justify-center h-14">
                            {
                                !me && <span>No comments :(</span>
                            }
                            {
                                me && me.emailVerified && <p className="text-lg">Be the first to comment!</p>
                            }
                        </div>
                    }
                    {
                        postComments.map(comment => <CommentBox key={comment.id} comment={comment} profile={postCommentors.find(x => x.id === comment.userId)!} table={"comments"} />)
                    }
                </div>
                {
                    me && me.emailVerified &&
                    <div className="w-full flex flex-col gap-0">
                        <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment..." className="w-full h-full" />
                        <CommonButton text='Send Comment' className="ml-auto mt-2" onClick={async () => {
                            const newComment = {
                                id: v4(),
                                userId: me.id,
                                postId: postData.id,
                                comment: comment,
                            } as Comment;

                            const res = await clientDb.from('comments').insert(newComment);
                            if (res.error)
                            {
                                toast.error(res.error.message);
                            }
                            else
                            {
                                setComment('');
                            }

                            /*
                                1. If we are the creator, create a notification to all the other posters.
                                2. If we are not the creator, create a notification to the creator and all the other posters.
                            */

                            const listOfPeopleToNotify: string[] = [];
                            if (post.userId === me.id)
                            {
                                const postsCommentorsToNotify = postCommentors.filter(x => x.id !== me.id && x.id !== post.userId).map(x => x.id);
                                for (const notifier of postsCommentorsToNotify)
                                {
                                    listOfPeopleToNotify.push(notifier);
                                }
                            }
                            else
                            {
                                // I am not the creator
                                listOfPeopleToNotify.push(post.userId);
                                const postsCommentorsToNotify = postCommentors.filter(x => x.id !== me.id && x.id !== post.userId).map(x => x.id);
                                for (const notifier of postsCommentorsToNotify)
                                {
                                    listOfPeopleToNotify.push(notifier);
                                }
                            }

                            const insertBatch = listOfPeopleToNotify.map(x => ({
                                id: v4(),
                                created_at: new Date().toISOString(),
                                title: `${me.username} commented on ${post.userId === x ? 'your post' : 'a post you commented on'}.`,
                                text: `Please click this link to view the comment.`,
                                link: `/${post.id}`,
                                userId: x,
                                seen: false // Default, since the intended party has not opened the post yet.
                            }));

                            // Now we insert the notifications for each of these people
                            const notificationRes = await clientDb.from('notifications').insert(insertBatch);

                            if (notificationRes.error)
                            {
                                toast.error(notificationRes.error.message);
                            }
                        }} /> 
                    </div>
                }
            </div>
        </div>
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

    // Now get the comments
    const comments = (await db.from('comments').select('*').eq('postId', postId)).data as Comment[];

    // Now get the commenters
    const commenters = (await db.from('profiles').select('*').in('id', comments.map(c => c.userId))).data as Profile[];

    const reactions = (await db.from('reactions').select('*').eq('postId', postId)).data as Reaction[];

    return {
        props: {
            post: post,
            me: profile,
            poster: poster,
            comments: comments,
            reactions: reactions,
            commenters: commenters,
        }
    }
}