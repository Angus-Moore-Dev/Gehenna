export type Reaction = {
    id: number;
    upvote: boolean;
    userId: string; // uuid
    createdAt: string; // timestamptz
    postId: string; // uuid
}