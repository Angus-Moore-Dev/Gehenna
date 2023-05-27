import { Post } from "@/models/Post";
import { Comment } from '@/models/Comment';
import { clientDb, serverDb } from "@/lib/db";
import { Profile } from "@/models/Profile";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import Link from "next/link";
import { TypographyStylesProvider, Highlight, Textarea, Chip } from "@mantine/core";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { generateHTML } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CommonButton from "@/components/CommonButton";
import { v4 } from "uuid";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import CommentBox from "@/components/CommentBox";
import { Notification } from "@/models/Notification";
import { useRouter } from "next/router";
import ProfileCard from "@/components/ProfileCard";
import { useClickAway } from "ahooks";
import Head from "next/head";

interface PostIdPageProps
{
    post: Post;
    poster: Profile;
    me: Profile;
    commenters: Profile[];
    comments: Comment[];
}

export default function PostIdPage({ post, poster, me, comments, commenters }: PostIdPageProps)
{
	const audioRef = useRef<HTMLAudioElement>(null);
    const router = useRouter();
    const [postCommentors, setPostCommentors] = useState(commenters);
    const [postComments, setPostComments] = useState(comments);
    const [comment, setComment] = useState('');
    const commentBoxRef = useRef<HTMLDivElement>(null);
    const [postData, setPostData] = useState(post);

    const [showCard, setShowCard] = useState(false);

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
        }).subscribe((status) => console.log(status));


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


        // Listen for new notifications.
		clientDb.channel('notifications').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications'}, (payload) => {
			const newNotification = payload.new as Notification;
			if (newNotification.userId === me.id)
			{
                // Play a sound to notify the user of the new notification.
				if (audioRef.current)
                {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play();
                }
				toast.info(newNotification.title, {
					onClick() {
						router.push(`${window.location.origin}${newNotification.link}`);
					}
				});
			}
		}).subscribe((status) => console.log(status));

    }, []);

    return <div className="w-full h-full flex flex-col gap-4 max-w-3xl mx-auto py-16">
        <Head>
            <title>Gehenna - {post.title}</title>
        </Head>
        <audio ref={audioRef} hidden>
            <source src={'/notification.mp3'} />
        </audio>
        <Link href='/' className="flex flex-col items-center justify-center mb-10 group">
            <Image src='/logo.png' width={500} height={450} alt='Gehenna' />
            <span className="text-sm mr-auto pt-2 transition group-hover:text-primary">Click To Go Back</span>
        </Link>
        <div className="w-full">
            <div className="flex flex-row gap-4 items-center border-b-4 border-b-primary mb-2 pb-2 relative">
                <Image ref={ref} src={poster.avatar} alt='me' width={50} height={50} className="object-cover rounded-md w-[50px] h-[50px] transition shadow-md hover:shadow-primary hover:cursor-pointer hover:animate-pulse"
                onClick={async () => {
                    setShowCard(true);
                }} />
                {
                    showCard &&
                    <div className="absolute top-14">
                        <ProfileCard profile={poster} /> 
                    </div>
                }
                <span className="font-semibold text-xl">
                    {poster.username} <i>asked:</i>
                    <br />
                    <span className="text-sm font-normal text-gray-500">Posted on {new Date(postData.createdAt).toLocaleDateString('en-au', { dateStyle: 'full' })}</span>
                </span>
            </div>
            <h1 className="text-4xl font-bold">{postData.title}</h1>
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
                        return <audio className="w-[45%]" controls>
                            <source src={file.url} type={file.mimeType} />
                        </audio>
                    else if (file.mimeType.includes('video'))
                        return <video className="w-[45%] rounded-md" controls>
                            <source src={file.url} type={file.mimeType} />
                        </video>
                })
            }
            </section>
        </section>
        <section className="flex flex-row flex-wrap gap-1">
            {
                post.tags.map((tag, index) => <Chip checked={false} key={index} color="yellow">{tag}</Chip>)
            }
        </section>
        <section className="flex flex-row gap-4 items-center">
            <div className="flex flex-row gap-4 items-center">
                <div className="transition p-2 rounded-xl w-fit hover:text-secondary hover:bg-primary hover:cursor-pointer aria-checked:bg-primary aria-checked:text-secondary" 
                onClick={async () => {
                    // Update the post likes.
                    const res = await clientDb.from('post').update({ upvotes: postData.upvotes + 1 }).eq('id', postData.id);
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-thumb-up-filled" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M13 3a3 3 0 0 1 2.995 2.824l.005 .176v4h2a3 3 0 0 1 2.98 2.65l.015 .174l.005 .176l-.02 .196l-1.006 5.032c-.381 1.626 -1.502 2.796 -2.81 2.78l-.164 -.008h-8a1 1 0 0 1 -.993 -.883l-.007 -.117l.001 -9.536a1 1 0 0 1 .5 -.865a2.998 2.998 0 0 0 1.492 -2.397l.007 -.202v-1a3 3 0 0 1 3 -3z" strokeWidth="0" fill="currentColor"></path>
                        <path d="M5 10a1 1 0 0 1 .993 .883l.007 .117v9a1 1 0 0 1 -.883 .993l-.117 .007h-1a2 2 0 0 1 -1.995 -1.85l-.005 -.15v-7a2 2 0 0 1 1.85 -1.995l.15 -.005h1z" strokeWidth="0" fill="currentColor"></path>
                    </svg>
                </div>
                <span className="text-2xl font-bold">{postData.upvotes}</span>
            </div>
            <div className="flex flex-row gap-4 items-center">
                <div className="transition p-2 rounded-xl w-fit hover:text-secondary hover:bg-red-500 hover:cursor-pointer aria-checked:bg-red-500 aria-checked:text-secondary" 
                onClick={async () => {
                    // Update the post likes.
                    const res = await clientDb.from('post').update({ downvotes: postData.downvotes + 1 }).eq('id', postData.id);
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-thumb-down-filled" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M13 21.008a3 3 0 0 0 2.995 -2.823l.005 -.177v-4h2a3 3 0 0 0 2.98 -2.65l.015 -.173l.005 -.177l-.02 -.196l-1.006 -5.032c-.381 -1.625 -1.502 -2.796 -2.81 -2.78l-.164 .008h-8a1 1 0 0 0 -.993 .884l-.007 .116l.001 9.536a1 1 0 0 0 .5 .866a2.998 2.998 0 0 1 1.492 2.396l.007 .202v1a3 3 0 0 0 3 3z" strokeWidth="0" fill="currentColor"></path>
                        <path d="M5 14.008a1 1 0 0 0 .993 -.883l.007 -.117v-9a1 1 0 0 0 -.883 -.993l-.117 -.007h-1a2 2 0 0 0 -1.995 1.852l-.005 .15v7a2 2 0 0 0 1.85 1.994l.15 .005h1z" strokeWidth="0" fill="currentColor"></path>
                    </svg>
                </div>
                <span className="text-2xl font-bold">{postData.downvotes}</span>
            </div>
        </section>
        <div className="flex-grow flex flex-col gap-4 mt-4">
            <h1 className="text-2xl font-bold">Comments <small className="text-xs text-primary">(Still a bit buggy...)</small></h1>
            <div className="flex-grow h-full flex flex-col">
                <div className="flex-grow flex flex-col gap-2 mb-4 border-t-2 border-t-primary">
                    {
                        postComments.map(comment => <CommentBox key={comment.id} comment={comment} profile={postCommentors.find(x => x.id === comment.userId)!} table={"comments"} />)
                    }
                </div>
                <div className="w-full flex flex-col gap-0">
                    <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment..." className="w-full h-full" />
                    <CommonButton text='Send Comment' className="ml-auto h-14 -mt-2" onClick={async () => {
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
                            console.log(post.userId);
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

                        console.log(insertBatch);
                        // Now we insert the notifications for each of these people
                        const notificationRes = await clientDb.from('notifications').insert(insertBatch);

                        console.log(notificationRes);

                        if (notificationRes.error)
                        {
                            toast.error(notificationRes.error.message);
                        }
                    }} /> 
                </div>
            </div>
        </div>
    </div>
}


export const getServerSideProps = async (context: GetServerSidePropsContext) => 
{
	const db = serverDb(context);
	const user = (await db.auth.getUser()).data.user;

    if (!user)
    {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }

	// Get the profile.
    const profile = (await db.from('profiles').select('*').eq('id', user.id).single()).data as Profile;

    // Now get the post
    const { postId } = context.query as { postId: string };
    const post = (await db.from('post').select('*').eq('id', postId).single()).data as Post;

    // Now get the poster
    const poster = (await db.from('profiles').select('*').eq('id', post.userId).single()).data as Profile;

    console.log(poster);

    // Now get the comments
    const comments = (await db.from('comments').select('*').eq('postId', postId)).data as Comment[];

    console.log('COMMENTS COMMENTS::, ', comments);

    // Now get the commenters
    const commenters = (await db.from('profiles').select('*').in('id', comments.map(c => c.userId))).data as Profile[];

    return {
        props: {
            user: user,
            me: profile,
            post: post,
            poster: poster,
            comments: comments,
            commenters: commenters
        }
    }
}