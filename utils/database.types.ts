export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      personal_tasks: {
        Row: {
          category: string
          createdAt: string
          description: string
          dueAt: string
          id: number
          importance: string
          profileId: string
          title: string
        }
        Insert: {
          category: string
          createdAt?: string
          description?: string
          dueAt: string
          id?: number
          importance: string
          profileId: string
          title: string
        }
        Update: {
          category?: string
          createdAt?: string
          description?: string
          dueAt?: string
          id?: number
          importance?: string
          profileId?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_tasks_profileId_fkey"
            columns: ["profileId"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post: {
        Row: {
          attachedFileURLs: Database["public"]["CompositeTypes"]["mediaInfo"][]
          byline: string
          content: string
          contentSections: Database["public"]["CompositeTypes"]["contentSection"][]
          createdAt: string
          id: string
          isDraft: boolean
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
          contentSections?: Database["public"]["CompositeTypes"]["contentSection"][]
          createdAt?: string
          id: string
          isDraft?: boolean
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
          contentSections?: Database["public"]["CompositeTypes"]["contentSection"][]
          createdAt?: string
          id?: string
          isDraft?: boolean
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
          },
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
        Relationships: []
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
        Relationships: []
      }
    }
    Views: {
      total_posts_per_profile: {
        Row: {
          postCount: number | null
          profileId: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_userId_fkey"
            columns: ["profileId"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      contentType: "text" | "video" | "audio" | "image" | "file"
    }
    CompositeTypes: {
      contentSection: {
        content: string | null
        contentType: Database["public"]["Enums"]["contentType"] | null
        mimeType: string | null
        byteSize: number | null
      }
      mediaInfo: {
        url: string | null
        byteSize: number | null
        mimeType: string | null
      }
      teamRole: {
        name: string | null
        email: string | null
        role: string | null
        avatar: string | null
      }
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
