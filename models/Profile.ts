import { AttachedFile } from "./Post";

export class Profile
{
    id: string = '';
    username: string = '';
    email: string = '';
    created_at: string = '';
    description: string = '';
    avatar: string = '';
    bio: string = '';
    emailVerified: boolean = false;
    profileBannerURL: AttachedFile = { url: '', mimeType: '', byteSize: 0 };
}