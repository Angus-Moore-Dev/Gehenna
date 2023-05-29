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
    startup: string = '';
    handle: string = '';
    profileBannerURL: AttachedFile = { url: '', mimeType: '', byteSize: 0 };
}