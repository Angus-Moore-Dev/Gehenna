import { Database } from "./database.types";

export type Post = Database['public']['Tables']['post']['Row'];
export type PostTopic = Database['public']['Tables']['postTopics']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Comment = Database['public']['Tables']['postComments']['Row'];

export type MediaInfo = Database['public']['CompositeTypes']['mediaInfo'];
export type ContentSection = Database['public']['CompositeTypes']['contentSection'];

export type NewPostContent = {
    index: number;
    content: string | File;
    type: 'text' | 'image' | 'video' | 'audio' | 'file';
    mediaTempURL: string;
    mimeType: string;
    byteSize: number;
};