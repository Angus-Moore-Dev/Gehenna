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

    useEffect(() => {
        clientDb.channel('newComments').on('postgres_changes', { event: '*', schema: 'public', table: 'comments'}, (payload) => {
            if (payload.eventType === 'INSERT')
            {
                if (payload.new.postId === post.id)
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
                if (payload.new.postId === post.id)
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
                    <span className="text-sm font-normal text-gray-500">Posted on {new Date(post.createdAt).toLocaleDateString('en-au', { dateStyle: 'full' })}</span>
                </span>
            </div>
            <h1 className="text-4xl font-bold">{post.title}</h1>
        </div>
        <TypographyStylesProvider>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </TypographyStylesProvider>
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
                            postId: post.id,
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