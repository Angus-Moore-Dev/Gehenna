import { Comment } from "@/models/Comment";
import { Profile } from "@/models/Profile";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useUser } from "@supabase/auth-helpers-react";
import { clientDb } from "@/lib/db";
import { Skeleton } from "@mantine/core";

interface CommentBoxProps {
	profile: Profile | undefined;
	comment: Comment;
	table: string;
}

/**
 * The CommentBox is to containerise comments for placements.
 * @param profile profile of the person who made the comment.
 * @param comment the comment itself.
 * @returns
 */
export default function CommentBox({ profile, comment, table }: CommentBoxProps) {
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

	// Uncomment this when we can come back and address the smaller issues.
	// const [currentChannelState, setCurrentChannelState] = useState<'' | 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT'>('');

	useEffect(() => {
		if (!profile) {
			// Get the profile of the person who made the comment.
			clientDb
				.from("profiles")
				.select("*")
				.eq("id", comment.userId)
				.single()
				.then((res) => {
					console.log(res.data);
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
			className="w-full p-2 rounded-md border-b-2 border-b-primary flex flex-row items-start gap-4 overflow-auto min-h-fit"
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
					<Image
						src={profileData.avatar}
						alt="profile_picture"
						width={60}
						height={60}
						className="w-[60px] h-[60px] object-cover rounded-md"
						onClick={() => {
							setShowProfileDialog(profileData);
						}}
					/>
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
												console.log(res.error);
											} else {
												toast.success("Comment deleted successfully.");
											}
										}}
									>
										Delete
									</button>
								</>
							)}
						</div>
						{!editComment && (
							<p className="w-full whitespace-pre" id="commentTextHeight">
								{commentText}
							</p>
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
											console.log(res.error);
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
