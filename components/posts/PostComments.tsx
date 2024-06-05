'use client';

import { appDomain, appHttp } from "@/utils/appURL";
import { Comment, Post, Profile } from "@/utils/global.types";
import { createBrowserClient } from "@/utils/supabase/client";
import { Button, Loader, Menu, ScrollArea, Text, Textarea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { User } from "@supabase/supabase-js";
import { ExternalLinkIcon, MoreHorizontal, PencilIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface PostCommentsProps
{
    post: Post;
    user: User | null
}

export default function PostComments({ post, user }: PostCommentsProps)
{
    const supabase = createBrowserClient();
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorLoading, setErrorLoading] = useState(false);

    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [commenterProfiles, setCommenterProfiles] = useState<Profile[]>([]);

    const submitComment = async () =>
    {
        if (!user || !newComment || isSubmitting) return;
        setIsSubmitting(true);

        const { data: comment, error } = await supabase
        .from('postComments')
        .insert({
            userId: user.id,
            postId: post.id,
            message: newComment,
            isEdited: false
        })
        .select('*')
        .single();

        if (!comment && error)
        {
            notifications.show({
                title: 'Error Submitting Comment!',
                message: error.message,
                color: 'red',
            });
            setIsSubmitting(false);
        }
        else
        {
            if (!commenterProfiles.some(x => x.id === user.id))
            {
                const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

                if (!profile && error)
                {
                    notifications.show({
                        title: 'Error Submitting Comment!',
                        message: error.message,
                        color: 'red',
                    });
                    setIsSubmitting(false);
                    return;
                }

                setCommenterProfiles([profile, ...commenterProfiles]);
            }

            setComments([...comments, comment]);
            setNewComment('');
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const fetchComments = async () =>
        {
            const { data, error } = await supabase
            .from('postComments')
            .select('*')
            .eq('postId', post.id);

            if (error)
            {
                setErrorLoading(true);
                setIsLoading(false);
            }
            else
            {
                const { data: profiles, error } = await supabase
                .from('profiles')
                .select('*')
                .in('id', data.map(x => x.userId));

                if (!profiles && error)
                {
                    setErrorLoading(true);
                    setIsLoading(false);
                    return;
                }

                setCommenterProfiles(profiles);
                setComments(data);
                setIsLoading(false);
            }
        };
        fetchComments();
    }, [supabase]);

    return <div className="w-full flex flex-col gap-4">
    {
        isLoading &&
        <Loader className="mx-auto my-4" />
    }
    {
        errorLoading &&
        <span className="my-4 text-center text-red-500 font-bold">
            Error loading comments.
        </span>
    }
    {
        !isLoading &&
        <>
        {
            comments.length === 0 &&
            <span className="my-4 text-center text-neutral-500 font-light">
                No comments yet !
            </span>
        }
        {
            comments.length > 0 &&
            <div className="flex flex-col gap-3">
                {
                comments.map(comment => {
                    const commenter = commenterProfiles.find(x => x.id === comment.userId)!;
                    return <CommentBox
                    key={comment.id}
                    comment={comment}
                    profile={commenter}
                    user={user}
                    onDelete={() => setComments(comments.filter(x => x.id !== comment.id))}
                    />
                })
                }
            </div>
        }
        {
            user &&
            <>
                <span className="mt-4">
                    Comment on this post:
                </span>
                <Textarea
                disabled={isSubmitting}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Here's what I think..."
                className="-mt-2"
                autosize
                minRows={3}
                resize="vertical"
                />
                <Button className="ml-auto -mt-2" onClick={submitComment} loading={isSubmitting}>
                    Post Comment
                </Button>
            </>
        }
        </>
    }
    </div>
}


function CommentBox({ comment, profile, user, onDelete }: { comment: Comment, profile: Profile, user: User | null, onDelete: () => void })
{
    const supabase = createBrowserClient();
    const [showDeleteButton, setShowDeleteButton] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [message, setMessage] = useState(comment.message);
    const [editingMessage, setEditingMessage] = useState(message);
    const [isLoading, setIsLoading] = useState(false);

    const deleteComment = async () =>
    {
        const { error } = await supabase
        .from('postComments')
        .delete()
        .eq('id', comment.id);

        if (error)
        {
            notifications.show({
                title: 'Error Deleting Comment!',
                message: error.message,
                color: 'red',
            });
        }
        else
        {
            notifications.show({
                title: 'Comment Deleted!',
                message: 'Your comment has been deleted.',
                color: 'green',
            });
            onDelete();
        }
    };


    function OptionsMenu()
    {
        return <Menu width={200}>
            <Menu.Target>
                <button className="ml-2">
                    <MoreHorizontal className="text-primary" />
                </button>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Label>
                    Options
                </Menu.Label>
                <Menu.Item onClick={() => setIsEditing(true)}>
                    <div className="flex flex-row items-center">
                        <Text c='green'><PencilIcon className="mr-2" /></Text>
                        Edit Comment
                    </div>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item className="flex flex-row text-sm" onClick={deleteComment}>
                    <div className="flex flex-row items-center text-red-500">
                        <TrashIcon className="mr-2 text-red-500" />
                        Delete Comment
                    </div>
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    }


    async function updateComment()
    {
        if (isLoading) return;
        setIsLoading(true);

        const { error } = await supabase
        .from('postComments')
        .update({
            message: editingMessage,
            isEdited: true
        })
        .eq('id', comment.id);

        if (error)
        {
            notifications.show({
                title: 'Error Updating Comment!',
                message: error.message,
                color: 'red',
            });
        }
        else
        {
            notifications.show({
                title: 'Comment Updated!',
                message: 'Your comment has been updated.',
                color: 'green',
            });
            setIsEditing(false);
            setMessage(editingMessage);
        }

        setIsLoading(false);
    }


    return <div className="w-full flex flex-col gap-2 py-4 px-8 rounded-md bg-secondary"
    onMouseOver={() => setShowDeleteButton(user ? user.id === profile.id : false)}
    onMouseLeave={() => setShowDeleteButton(false)}>
        <section className="w-full flex flex-row gap-4">
            <Image src={profile.avatar ?? '/gehenna_logo_transparent.png'} alt="Profile Picture" width={250} height={250} style={{ width: 50, height: 50, objectFit: 'cover' }} className="rounded-full" />
            <div className="flex flex-col w-full">
                <div className="w-full flex flex-row items-center gap-1">
                    <span className="font-semibold">
                        {profile.name}
                    </span>
                    <Link href={`${appHttp}://${profile.handle}.${appDomain}/`} target="_blank" className="w-fit flex flex-row gap-1 items-center group">
                        <ExternalLinkIcon size={18} className="transition group-hover:text-primary" />
                    </Link>
                    <small className="ml-auto text-neutral-400">
                        {new Date(comment.createdAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: '2-digit' })}
                    </small>
                    {
                        showDeleteButton && !isEditing &&
                        <OptionsMenu />
                    }
                </div>
                {
                    !isEditing &&
                    <section className="w-full whitespace-pre-wrap text-sm mt-1">
                        {message}
                    </section>
                }
                {
                    isEditing &&
                    <div className="w-full flex flex-col gap-2">
                        <Textarea value={editingMessage} onChange={e => setEditingMessage(e.target.value)} autosize minRows={3} resize="vertical" placeholder="Edit your comment here." />
                        <section className="w-full flex flex-row justify-end gap-2">
                            <Button size="sm" color='dark' onClick={() => {
                                setIsEditing(false);
                                setEditingMessage(message);
                            }} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button size="sm" onClick={updateComment} loading={isLoading}>
                                Save
                            </Button>
                        </section>
                    </div>
                }
            </div>
        </section>
    </div>
}