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
      draftPost: {
        Row: {
          attachedFileURLs: Json[]
          content: string
          createdAt: string
          id: string
          postImageURL: Json
          startupId: string | null
          tags: string[]
          title: string
          userId: string
        }
        Insert: {
          attachedFileURLs?: Json[]
          content?: string
          createdAt?: string
          id: string
          postImageURL?: Json
          startupId?: string | null
          tags?: string[]
          title?: string
          userId: string
        }
        Update: {
          attachedFileURLs?: Json[]
          content?: string
          createdAt?: string
          id?: string
          postImageURL?: Json
          startupId?: string | null
          tags?: string[]
          title?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "draftPost_startupId_fkey"
            columns: ["startupId"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draftPost_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      post: {
        Row: {
          attachedFileURLs: Json[]
          content: string
          createdAt: string
          id: string
          postImageURL: Json
          public: boolean
          startupId: string | null
          tags: string[]
          title: string
          userId: string
        }
        Insert: {
          attachedFileURLs?: Json[]
          content?: string
          createdAt?: string
          id: string
          postImageURL?: Json
          public?: boolean
          startupId?: string | null
          tags?: string[]
          title?: string
          userId: string
        }
        Update: {
          attachedFileURLs?: Json[]
          content?: string
          createdAt?: string
          id?: string
          postImageURL?: Json
          public?: boolean
          startupId?: string | null
          tags?: string[]
          title?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_startupId_fkey"
            columns: ["startupId"]
            isOneToOne: false
            referencedRelation: "startups"
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
      profiles: {
        Row: {
          avatar: string
          bio: string
          createdAt: string
          email: string
          handle: string
          id: string
          profileBannerURL: Json
          startups: string[]
          username: string
        }
        Insert: {
          avatar?: string
          bio?: string
          createdAt?: string
          email?: string
          handle?: string
          id: string
          profileBannerURL?: Json
          startups?: string[]
          username?: string
        }
        Update: {
          avatar?: string
          bio?: string
          createdAt?: string
          email?: string
          handle?: string
          id?: string
          profileBannerURL?: Json
          startups?: string[]
          username?: string
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
      startups: {
        Row: {
          avatar: string
          bannerURL: string
          bio: string
          country: string
          createdAt: string | null
          domain: string
          id: string
          industry: string
          mission: string
          name: string
          team: Database["public"]["CompositeTypes"]["teamRole"][]
          theme: string
        }
        Insert: {
          avatar?: string
          bannerURL?: string
          bio?: string
          country?: string
          createdAt?: string | null
          domain?: string
          id?: string
          industry?: string
          mission?: string
          name?: string
          team?: Database["public"]["CompositeTypes"]["teamRole"][]
          theme?: string
        }
        Update: {
          avatar?: string
          bannerURL?: string
          bio?: string
          country?: string
          createdAt?: string | null
          domain?: string
          id?: string
          industry?: string
          mission?: string
          name?: string
          team?: Database["public"]["CompositeTypes"]["teamRole"][]
          theme?: string
        }
        Relationships: []
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
