import { AttachedFile } from "./Post";

export class Profile
{
    id: string = '';
    username: string = '';
    email: string = '';
    createdAt: string = '';
    description: string = '';
    avatar: string = '';
    bio: string = '';
    emailVerified: boolean = false;
    startups: string[] = [];
    handle: string = '';
    profileBannerURL: AttachedFile = { url: '', mimeType: '', byteSize: 0 };
}

export type UserFollowerInfo = {
    id: number;
    followerId: string; // the user who is following
    followingId: string; // the person who is being followed.
}