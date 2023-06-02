import { Comment, CommentReaction } from "@/models/Comment";
import { Profile } from "@/models/Profile";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { User, useUser } from "@supabase/auth-helpers-react";
import { clientDb } from "@/lib/db";
import { Skeleton, Tooltip } from "@mantine/core";
import { IconThumbDown, IconThumbUp } from "@tabler/icons-react";
import Link from "next/link";

interface CommentBoxProps {
	profile: Profile | undefined;
	comment: Comment;
	table: string;
	me: Profile | null;
	removeComment: (id: string) => void;
}

/**
 * The CommentBox is to containerise comments for placements.
 * @param profile profile of the person who made the comment.
 * @param comment the comment itself.
 * @returns
 */
export default function CommentBox({ profile, comment, table, me, removeComment }: CommentBoxProps) {
	/**
	 * profileData is the profile of the person who made the comment.
	 * We use this because an educator / supervisor may no longer be with the project,
	 * but we still want to reference them in the comments, without null/default values.
	 */
	const [profileData, setProfileData] = useState(profile);
	const user = useUser();
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const [showOptions, setShowOptions] = useState(false);
	const [editComment, setEditComment] = useState(false);
	const [commentText, setCommentText] = useState(comment.comment);
	const [showProfileDialog, setShowProfileDialog] = useState<Profile>();
	const [upvotes, setUpvotes] = useState<number>();
	const [reaction, setReaction] = useState<CommentReaction>();

	// Uncomment this when we can come back and address the smaller issues.
	// const [currentChannelState, setCurrentChannelState] = useState<'' | 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT'>('');

	useEffect(() => {
		// Get the total number of upvotes for this comment
		clientDb.from('commentReactions').select('*', { count: 'exact', head: true }).eq('commentId', comment.id).then(async res => {
			if (res.count)
			{
				setUpvotes(res.count);
			}
			else
			{
				setUpvotes(0);
			}
		});

		// Check if I have liked / disliked this comment
		if (me)
		{
			clientDb.from('commentReactions').select('*').eq('commentId', comment.id).eq('userId', me?.id).single().then(async res => {
				if (res.data)
				{
					const reaction = res.data as CommentReaction;
					setReaction(reaction);
				}
			});
		}

	}, []);

	useEffect(() => {
		if (!profile) {
			// Get the profile of the person who made the comment.
			clientDb
				.from("profiles")
				.select("*")
				.eq("id", comment.userId)
				.single()
				.then((res) => {
					if (res.error && !res.data) {
						toast.error("An error occurred while fetching the profile of the person who made this comment.");
					} else if (res.data) {
						setProfileData(res.data as Profile);
					}
				});
		}
	}, [profile]);

	useEffect(() => {
		if (editComment) {
			inputRef.current?.focus();
			// set the height of the textarea to the height of the text.
			inputRef.current!.style.height = "auto";
			inputRef.current!.style.height = inputRef.current!.scrollHeight + "px";
		}
	}, [editComment]);

	return (
		<div
			className="w-full p-2 rounded-md flex flex-row items-start gap-4 overflow-auto min-h-fit"
			onMouseOver={() => setShowOptions(true)}
			onMouseLeave={() => setShowOptions(false)}
		>
			{!profileData && (
				<div className="w-full gap-2 flex flex-row items-center">
					<Skeleton variant="circular" width={60} height={60} />
					<div className="flex flex-col gap-2 w-full">
						<div className="flex flex-row items-center gap-2 w-full">
							<Skeleton variant="text" width={100} />
						</div>
						<Skeleton variant="text" width={400} className="w-full" />
					</div>
				</div>
			)}
			{profileData && (
				<>
					<Link href={`/profile/${profileData.id}`}>
						<Image
							src={profileData.avatar}
							alt="profile_picture"
							width={60}
							height={60}
							className="w-[60px] h-[60px] object-cover rounded-md shadow-sm hover:shadow-primary-light"
							onClick={() => {
								setShowProfileDialog(profileData);
							}}
						/>
					</Link>
					<div className="flex flex-col gap-2 w-full">
						<div className="flex flex-row items-center gap-2 w-full">
							<span className="font-semibold">
								{profileData.username}
							</span>
							<span className="text-neutral-400">
								{new Date(Date.parse(comment.createdAt)).toLocaleDateString('en-au', { dateStyle: 'full' })}
							</span>
							{showOptions && !editComment && comment.userId === profileData.id && user?.id === profileData.id && (
								<>
									<button
										className="text-neutral-500 transition hover:bg-primary hover:text-zinc-100 rounded-md px-2"
										onClick={() => {
											setEditComment(true);
										}}
									>
										Edit
									</button>
									<button
										className="text-red-500 transition hover:bg-red-500 hover:text-zinc-100 rounded-md px-2"
										onClick={async () => {
											const res = await clientDb.from(table).delete().eq("id", comment.id);
											if (res.error) {
												toast.error(res.error.message);
											} else {
												toast.success("Comment deleted successfully.");
												removeComment(comment.id);
											}
										}}
									>
										Delete
									</button>
								</>
							)}
						</div>
						{!editComment && (
							<div className="w-full max-w-3xl flex flex-col gap-2">
								<p className="w-full whitespace-pre-line" id="commentTextHeight">
									{commentText}
								</p>
								{
									upvotes !== undefined &&
									<div className="flex flex-row gap-2 items-center">
										<span className="text-neutral-400">{upvotes}</span>
										<Tooltip label="Like Comment" position="bottom">
											<IconThumbUp size={16} className="text-green-500 hover:fill-green-500 rounded-md hover:cursor-pointer aria-checked:fill-green-500"
											aria-checked={reaction && reaction.upvote === true}
											onClick={async () => {
												if (me)
												{
													if (reaction) // I have reacted to this before.
													{
														// If I have liked the comment already
														if (reaction.upvote === true)
														{
															// Remove the like
															const res = await clientDb.from('commentReactions').delete().eq('id', reaction.id);
															if (res.error)
																toast.error(res.error.message);
															else
															{
																setUpvotes(upvotes - 1);
																setReaction(undefined);
															}
														}
														else if (reaction.upvote === false)
														{
															// Change the dislike to a like
															const res = await clientDb.from('commentReactions').update({ upvote: true }).eq('id', reaction.id);
															if (res.error)
																toast.error(res.error.message);
															else
															{
																setUpvotes(upvotes + 2);
																setReaction({ ...reaction, upvote: true });
															}
														}
													}
													else
													{
														const res = await clientDb.from('commentReactions').insert({
															commentId: comment.id,
															userId: me.id,
															upvote: true,
															postId: comment.postId, // This is redundant lol
														}).select('*').single();

														if (res.error)
															toast.error(res.error.message);
														else
														{
															setUpvotes(upvotes + 1);
															setReaction(res.data as CommentReaction);
														}
													}
												}
												else
													toast.error('You must be signed in to like comments');
											}} />
										</Tooltip>
										<Tooltip label="Dislike Comment" position="bottom">
											<IconThumbDown size={16} className="text-red-500 hover:fill-red-500 rounded-md hover:cursor-pointer aria-checked:fill-red-500"
											aria-checked={reaction && reaction.upvote === false}
											onClick={async () => {
												if (me)
												{
													if (reaction) // I have reacted to this before.
													{
														// If I have disliked the comment already
														if (reaction.upvote === true)
														{
															// Change the like to a dislike
															const res = await clientDb.from('commentReactions').update({ upvote: false }).eq('id', reaction.id);
															if (res.error)
																toast.error(res.error.message);
															else
															{
																setUpvotes(upvotes - 2);
																setReaction({ ...reaction, upvote: false });
															}
															
														}
														else if (reaction.upvote === false)
														{
															// Remove the dislike
															const res = await clientDb.from('commentReactions').delete().eq('id', reaction.id);
															if (res.error)
																toast.error(res.error.message);
															else
															{
																setUpvotes(upvotes + 1);
																setReaction(undefined);
															}
														}
													}
													else
													{
														const res = await clientDb.from('commentReactions').insert({
															commentId: comment.id,
															userId: me.id,
															upvote: false,
															postId: comment.postId, // This is redundant lol
														}).select('*').single();

														if (res.error)
															toast.error(res.error.message);
														else
														{
															setUpvotes(upvotes - 1);
															setReaction(res.data as CommentReaction);
														}
													}
												}
												else
													toast.error('You must be signed in to dislike comments');
											}} />
										</Tooltip>
									</div>
								}
							</div>
						)}
						{editComment && (
							<textarea
								ref={inputRef}
								disabled={!editComment}
								value={commentText}
								onChange={(e) => {
									setCommentText(e.target.value);
								}}
								className="w-full border-0 focus:outline-none bg-tertiary px-2 py-1 rounded-md max-h-[150px] min-h-[50px]"
							/>
						)}
						{editComment && (
							<div className="flex flex-row gap-2 ml-auto font-semibold">
								<button
									className="text-neutral-500 transition hover:bg-neutral-500 hover:text-zinc-100 rounded-md px-2"
									onClick={() => setEditComment(false)}
								>
									Cancel
								</button>
								<button
									className="text-primary transition hover:bg-primary hover:text-zinc-100 rounded-md px-2"
									onClick={async () => {
										let newCommentText = commentText;
										// After the last character, remove all the whitespace and newlines.
										newCommentText = newCommentText.replace(/\s*$/, "");
										// If the comment is empty, don't update it.
										if (newCommentText === "") {
											toast.error("Comment cannot be empty.");
											return;
										}

										const res = await clientDb.from(table).update({ comment: newCommentText }).eq("id", comment.id);

										if (res.error) {
											toast.error(res.error.message);
										} else {
											setEditComment(false);
											setCommentText(newCommentText);
										}
									}}
								>
									Save
								</button>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
}
