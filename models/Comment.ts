export type Comment = {
    id: string;
    createdAt: string;
    postId: string;
    comment: string;
    userId: string;
}

export type CommentReaction = {
    id: number;
    createdAt: string; // timestamptz
    upvote: boolean;
    userId: string;
    postId: string;
    commentId: string;
}