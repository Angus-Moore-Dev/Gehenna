import { Database } from "./database.types";

export type Post = Database['public']['Tables']['post']['Row'];
export type PostTopic = Database['public']['Tables']['postTopics']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

export type MediaInfo = Database['public']['CompositeTypes']['mediaInfo'];