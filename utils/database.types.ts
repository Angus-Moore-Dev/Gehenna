export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      post: {
        Row: {
          attachedFileURLs: Database["public"]["CompositeTypes"]["mediaInfo"][]
          byline: string
          content: string
          createdAt: string
          id: string
          postImageURL: Json
          public: boolean
          title: string
          topicId: string | null
          userId: string
        }
        Insert: {
          attachedFileURLs?: Database["public"]["CompositeTypes"]["mediaInfo"][]
          byline?: string
          content?: string
          createdAt?: string
          id: string
          postImageURL?: Json
          public?: boolean
          title?: string
          topicId?: string | null
          userId: string
        }
        Update: {
          attachedFileURLs?: Database["public"]["CompositeTypes"]["mediaInfo"][]
          byline?: string
          content?: string
          createdAt?: string
          id?: string
          postImageURL?: Json
          public?: boolean
          title?: string
          topicId?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_topicId_fkey"
            columns: ["topicId"]
            isOneToOne: false
            referencedRelation: "postTopics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      postComments: {
        Row: {
          createdAt: string
          id: number
          isEdited: boolean
          message: string
          postId: string
          userId: string
        }
        Insert: {
          createdAt?: string
          id?: number
          isEdited: boolean
          message: string
          postId: string
          userId: string
        }
        Update: {
          createdAt?: string
          id?: number
          isEdited?: boolean
          message?: string
          postId?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "postComments_postId_fkey"
            columns: ["postId"]
            isOneToOne: false
            referencedRelation: "post"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postComments_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      postLikes: {
        Row: {
          authorId: string
          createdAt: string
          id: string
          postId: string
          userId: string
        }
        Insert: {
          authorId: string
          createdAt?: string
          id?: string
          postId: string
          userId: string
        }
        Update: {
          authorId?: string
          createdAt?: string
          id?: string
          postId?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "postLikes_authorId_fkey"
            columns: ["authorId"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postLikes_postId_fkey"
            columns: ["postId"]
            isOneToOne: false
            referencedRelation: "post"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postLikes_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      postTopics: {
        Row: {
          createdAt: string
          id: string
          title: string
          userId: string
        }
        Insert: {
          createdAt?: string
          id?: string
          title: string
          userId: string
        }
        Update: {
          createdAt?: string
          id?: string
          title?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "postTopics_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar: string
          bio: string
          createdAt: string
          handle: string
          id: string
          name: string
          profileBannerURL: Json
        }
        Insert: {
          avatar?: string
          bio?: string
          createdAt?: string
          handle?: string
          id: string
          name: string
          profileBannerURL?: Json
        }
        Update: {
          avatar?: string
          bio?: string
          createdAt?: string
          handle?: string
          id?: string
          name?: string
          profileBannerURL?: Json
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      mediaInfo: {
        url: string
        byteSize: number
        mimeType: string
      }
      teamRole: {
        name: string
        email: string
        role: string
        avatar: string
      }
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
