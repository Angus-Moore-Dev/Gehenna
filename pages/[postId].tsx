import { Post } from "@/models/Post";
import { Comment } from '@/models/Comment';
import { clientDb, serverDb } from "@/lib/db";
import { Profile } from "@/models/Profile";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import Link from "next/link";
import { TypographyStylesProvider, Highlight, Textarea } from "@mantine/core";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { generateHTML } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CommonButton from "@/components/CommonButton";
import { v4 } from "uuid";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import CommentBox from "@/components/CommentBox";

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
    const [postCommentors, setPostCommentors] = useState(commenters);
    const [postComments, setPostComments] = useState(comments);
    const [comment, setComment] = useState('');
    const commentBoxRef = useRef<HTMLDivElement>(null);

    const [postData, setPostData] = useState(post);

    useEffect(() => {
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
                if (postComments.some(x => x.id === payload.old.id))
                {
                    const deletedComment = payload.old as Comment;
                    const updatedComments = postComments.filter(comment => comment.id !== deletedComment.id);
                    setPostComments(updatedComments);
                }
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
    }, []);

    return <div className="w-full h-full flex flex-col gap-4 max-w-3xl mx-auto py-16">
        <Link href='/' className="flex flex-col items-center justify-center mb-10">
            <Image src='/logo.png' width={500} height={450} alt='Gehenna' />
            <span className="text-sm mr-auto pt-2">Click To Go Back</span>
        </Link>
        <div className="w-full">
            <div className="flex flex-row gap-4 items-center border-b-2 border-b-primary mb-2 pb-2">
                <Image src={poster.avatar} alt='me' width={50} height={50} className="object-cover rounded-full w-[50px] h-[50px]" />
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
        <section className="flex flex-row gap-4 items-center">
            <div className="flex flex-row gap-4 items-center">
                <div className="transition p-2 rounded-xl w-fit hover:text-secondary hover:bg-primary hover:cursor-pointer aria-checked:bg-primary aria-checked:text-secondary" 
                onClick={async () => {
                    // Update the post likes.
                    const res = await clientDb.from('post').update({ upvotes: postData.upvotes + 1 }).eq('id', postData.id);
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-thumb-up-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M13 3a3 3 0 0 1 2.995 2.824l.005 .176v4h2a3 3 0 0 1 2.98 2.65l.015 .174l.005 .176l-.02 .196l-1.006 5.032c-.381 1.626 -1.502 2.796 -2.81 2.78l-.164 -.008h-8a1 1 0 0 1 -.993 -.883l-.007 -.117l.001 -9.536a1 1 0 0 1 .5 -.865a2.998 2.998 0 0 0 1.492 -2.397l.007 -.202v-1a3 3 0 0 1 3 -3z" stroke-width="0" fill="currentColor"></path>
                        <path d="M5 10a1 1 0 0 1 .993 .883l.007 .117v9a1 1 0 0 1 -.883 .993l-.117 .007h-1a2 2 0 0 1 -1.995 -1.85l-.005 -.15v-7a2 2 0 0 1 1.85 -1.995l.15 -.005h1z" stroke-width="0" fill="currentColor"></path>
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-thumb-down-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M13 21.008a3 3 0 0 0 2.995 -2.823l.005 -.177v-4h2a3 3 0 0 0 2.98 -2.65l.015 -.173l.005 -.177l-.02 -.196l-1.006 -5.032c-.381 -1.625 -1.502 -2.796 -2.81 -2.78l-.164 .008h-8a1 1 0 0 0 -.993 .884l-.007 .116l.001 9.536a1 1 0 0 0 .5 .866a2.998 2.998 0 0 1 1.492 2.396l.007 .202v1a3 3 0 0 0 3 3z" stroke-width="0" fill="currentColor"></path>
                        <path d="M5 14.008a1 1 0 0 0 .993 -.883l.007 -.117v-9a1 1 0 0 0 -.883 -.993l-.117 -.007h-1a2 2 0 0 0 -1.995 1.852l-.005 .15v7a2 2 0 0 0 1.85 1.994l.15 .005h1z" stroke-width="0" fill="currentColor"></path>
                    </svg>
                </div>
                <span className="text-2xl font-bold">{postData.downvotes}</span>
            </div>
        </section>
        <div className="flex-grow flex flex-col gap-4 mt-4">
            <h1 className="text-2xl font-bold">Comments</h1>
            <div className="flex-grow h-full bg-secondary rounded-md flex flex-col">
                <div className="flex-grow flex flex-col gap-2 mb-4">
                    {
                        postComments.map(comment => <CommentBox comment={comment} profile={postCommentors.find(x => x.id === comment.userId)!} table={"comments"} />)
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