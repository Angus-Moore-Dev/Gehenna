export type Comment = {
    id: string;
    createdAt: string;
    postId: string;
    comment: string;
    userId: string;
    upvotes: number;
    downvotes: number;
}