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
      churches: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          location: string | null
          location_data: Json | null
          members_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          location?: string | null
          location_data?: Json | null
          members_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          location?: string | null
          location_data?: Json | null
          members_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          church_id: string
          title: string
          starts_at: string
          is_live: boolean
          preacher_name: string | null
          sermon_title: string | null
          sermon_passage: string | null
          attendees_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          church_id: string
          title: string
          starts_at: string
          is_live?: boolean
          preacher_name?: string | null
          sermon_title?: string | null
          sermon_passage?: string | null
          attendees_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          church_id?: string
          title?: string
          starts_at?: string
          is_live?: boolean
          preacher_name?: string | null
          sermon_title?: string | null
          sermon_passage?: string | null
          attendees_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      church_followers: {
        Row: {
          id: string
          user_id: string
          church_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          church_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          church_id?: string
          created_at?: string
        }
      }
      bible_verses: {
        Row: {
          id: string
          version_id: string
          book: number
          chapter: number
          verse: number
          text: string
        }
        Insert: {
          id?: string
          version_id: string
          book: number
          chapter: number
          verse: number
          text: string
        }
        Update: {
          id?: string
          version_id?: string
          book?: number
          chapter?: number
          verse?: number
          text?: string
        }
      }
      bible_versions: {
        Row: {
          id: string
          name: string
          abbreviation: string
          language: string
          license: string | null
        }
        Insert: {
          id?: string
          name: string
          abbreviation: string
          language: string
          license?: string | null
        }
        Update: {
          id?: string
          name?: string
          abbreviation?: string
          language?: string
          license?: string | null
        }
      }
      user_bookmarks: {
        Row: {
          id: string
          user_id: string
          version_id: string
          book: number
          chapter: number
          verse: number
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          version_id: string
          book: number
          chapter: number
          verse: number
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          version_id?: string
          book?: number
          chapter?: number
          verse?: number
          note?: string | null
          created_at?: string
        }
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
  }
}