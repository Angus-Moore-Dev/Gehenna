import { clientDb } from "@/lib/db";
import { Post } from "@/models/Post";
import { Profile } from "@/models/Profile";
import { Reaction } from "@/models/Reaction";
import { ActionIcon, Tooltip } from "@mantine/core";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Reactions({ reactions, me, post }: { reactions: Reaction[], me: Profile | null, post: Post })
{
    const [reactionsData, setReactionsData] = useState(reactions)
    return <section className="flex flex-row gap-4 items-center">
        <div className="flex flex-row gap-4 items-center">
            <Tooltip label="Like" position="top" className="mb-4 font-semibold">
                <ActionIcon size='xl'
                className="transition p-2 rounded-xl w-fit text-green-500 hover:text-white hover:bg-green-500 hover:cursor-pointer aria-checked:bg-green-500 aria-checked:text-white" 
                aria-checked={reactionsData.some(reaction => reaction.userId === me?.id && reaction.upvote)}
                onClick={async () => {
                    // Update the post likes.
                    if (me)
                    {
                        // If I have disliked this post already
                        if (reactionsData.some(reaction => reaction.userId === me.id))
                        {
                            if (reactionsData.some(reaction => reaction.userId === me.id && reaction.upvote))
                            {
                                const res = await clientDb.from('reactions').delete().eq('postId', post.id).eq('userId', me.id);
                                if (res.error)
                                    toast.error('There was an error removing your like :(');
                                else
                                    setReactionsData(reactionsData.filter(reaction => reaction.userId !== me.id));
                            }
                            else
                            {
                                const res = await clientDb.from('reactions').update({
                                    upvote: true,
                                }).eq('postId', post.id).eq('userId', me.id).select('*').single();
                                if (res.error)
                                    toast.error('There was an error updating your like :(');
                                else
                                    setReactionsData(reactionsData.map(reaction => reaction.userId === me.id ? res.data as Reaction : reaction));
                            }
                        }
                        else
                        {
                            const res = await clientDb.from('reactions').insert({
                                postId: post.id,
                                userId: me.id,
                                upvote: true,
                            }).select('*').single();

                            setReactionsData([...reactionsData, res.data as Reaction]);
                        }
                    }
                    else
                    {
                        toast.error('You must be signed in to like a post!');
                    }
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-thumb-up-filled" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M13 3a3 3 0 0 1 2.995 2.824l.005 .176v4h2a3 3 0 0 1 2.98 2.65l.015 .174l.005 .176l-.02 .196l-1.006 5.032c-.381 1.626 -1.502 2.796 -2.81 2.78l-.164 -.008h-8a1 1 0 0 1 -.993 -.883l-.007 -.117l.001 -9.536a1 1 0 0 1 .5 -.865a2.998 2.998 0 0 0 1.492 -2.397l.007 -.202v-1a3 3 0 0 1 3 -3z" strokeWidth="0" fill="currentColor"></path>
                        <path d="M5 10a1 1 0 0 1 .993 .883l.007 .117v9a1 1 0 0 1 -.883 .993l-.117 .007h-1a2 2 0 0 1 -1.995 -1.85l-.005 -.15v-7a2 2 0 0 1 1.85 -1.995l.15 -.005h1z" strokeWidth="0" fill="currentColor"></path>
                    </svg>
                </ActionIcon>
            </Tooltip>
        </div>
        <div className="flex flex-row gap-4 items-center">
            <Tooltip label="Dislike" position="top" className="mb-4 font-semibold">
                <ActionIcon size='xl'
                className="transition p-2 rounded-xl w-fit text-red-500 hover:text-white hover:bg-red-500 hover:cursor-pointer aria-checked:bg-red-500 aria-checked:text-white" 
                aria-checked={reactionsData.some(reaction => reaction.userId === me?.id && !reaction.upvote)}
                onClick={async () => {
                    // Update the post likes.
                    if (me)
                    {
                        // If I have disliked this post already
                        if (reactionsData.some(reaction => reaction.userId === me.id))
                        {
                            if (reactionsData.some(reaction => reaction.userId === me.id && !reaction.upvote))
                            {
                                const res = await clientDb.from('reactions').delete().eq('postId', post.id).eq('userId', me.id);
                                if (res.error)
                                    toast.error('There was an error removing your dislike :(');
                                else
                                    setReactionsData(reactionsData.filter(reaction => reaction.userId !== me.id));
                            }
                            else
                            {
                                const res = await clientDb.from('reactions').update({
                                    upvote: false,
                                }).eq('postId', post.id).eq('userId', me.id).select('*').single();
                                if (res.error)
                                    toast.error('There was an error updating your dislike :(');
                                else
                                    setReactionsData(reactionsData.map(reaction => reaction.userId === me.id ? res.data as Reaction : reaction));
                            }
                        }
                        else
                        {
                            const res = await clientDb.from('reactions').insert({
                                postId: post.id,
                                userId: me.id,
                                upvote: false,
                            }).select('*').single();

                            setReactionsData([...reactionsData, res.data as Reaction]);
                        }
                    }
                    else
                    {
                        toast.error('You must be signed in to dislike a post!');
                    }
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-thumb-down-filled" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M13 21.008a3 3 0 0 0 2.995 -2.823l.005 -.177v-4h2a3 3 0 0 0 2.98 -2.65l.015 -.173l.005 -.177l-.02 -.196l-1.006 -5.032c-.381 -1.625 -1.502 -2.796 -2.81 -2.78l-.164 .008h-8a1 1 0 0 0 -.993 .884l-.007 .116l.001 9.536a1 1 0 0 0 .5 .866a2.998 2.998 0 0 1 1.492 2.396l.007 .202v1a3 3 0 0 0 3 3z" strokeWidth="0" fill="currentColor"></path>
                        <path d="M5 14.008a1 1 0 0 0 .993 -.883l.007 -.117v-9a1 1 0 0 0 -.883 -.993l-.117 -.007h-1a2 2 0 0 0 -1.995 1.852l-.005 .15v7a2 2 0 0 0 1.85 1.994l.15 .005h1z" strokeWidth="0" fill="currentColor"></path>
                    </svg>
                </ActionIcon>
            </Tooltip>
            <span className="text-lg font-semibold">{reactionsData.filter(reaction => reaction.upvote).length - reactionsData.filter(reaction => !reaction.upvote).length}</span>
        </div>
    </section>
}