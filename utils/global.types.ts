import { Database } from "./database.types";

export type Post = Database['public']['Tables']['post']['Row'];
export type PostTopic = Database['public']['Tables']['postTopics']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Comment = Database['public']['Tables']['postComments']['Row'];

export type MediaInfo = {
    url: string;
    byteSize: number;
    mimeType: string;
}; // Changed this from the database composite type because it claims it may be null, and composite types are hilariously
// hard to modify.

export type ContentSection = {
    content: string;
    contentType: Database["public"]["Enums"]["contentType"];
    mimeType: string;
    byteSize: number;
}; // same goes for this one.

export type NewPostContent = {
    index: number;
    content: string | File;
    type: 'text' | 'image' | 'video' | 'audio' | 'file';
    mediaTempURL: string;
    mimeType: string;
    byteSize: number;
};