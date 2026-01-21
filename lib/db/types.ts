/**
 * Database types
 * These match the Supabase schema for Tier1 analytics
 */

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email?: string
          created_at: string
          updated_at?: string
        }
        Insert: never // Read-only
        Update: never // Read-only
      }
      user_play_history: {
        Row: {
          id: string
          user_id: string
          session_id: string
          status: string | null
          progress_percentage: number | null
          created_at: string
          updated_at: string
        }
        Insert: never
        Update: never
      }
      unified_sessions: {
        Row: {
          id: string
          title: string | null
          audio_url: string | null
          position: number | null
          session_type: string | null
          parent_id: string | null
          created_at: string
          updated_at: string
          length: number | null
          tag: string | null
        }
        Insert: never
        Update: never
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          session_id: string
          created_at: string
        }
        Insert: never
        Update: never
      }
      feedback: {
        Row: {
          id: string
          user_id: string | null
          message: string | null
          created_at: string
          app_version: string | null
          device_info: string | null
        }
        Insert: never
        Update: never
      }
    }
  }
}

// Metrics API response types
export type KpisResponse = {
  newUsers: {
    today: number
    last7d: number
    last30d: number
  }
  activeUsers: {
    dau: number
    wau: number
    mau: number
  }
  plays: {
    today: number
    last7d: number
    last30d: number
  }
  minutesListened: {
    today: number
    last7d: number
    last30d: number
  }
  completionRate: number
  favorites: {
    last7d: number
    last30d: number
  }
  feedback: {
    last7d: number
    last30d: number
  }
}

export type TrendsResponse = {
  data: Array<{
    date: string
    dau: number
  }>
}

export type TopSession = {
  sessionId: string
  title: string | null
  plays: number
  minutesListened: number
  avgProgress: number
}

export type TopSessionsResponse = {
  sessions: TopSession[]
}

