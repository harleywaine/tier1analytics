import { createServerClient } from '../supabase-server'
import type { Database } from './types'

type User = Database['public']['Tables']['users']['Row']
type UserPlayHistory = Database['public']['Tables']['user_play_history']['Row']
type UnifiedSession = Database['public']['Tables']['unified_sessions']['Row']
type Favorite = Database['public']['Tables']['favorites']['Row']
type Feedback = Database['public']['Tables']['feedback']['Row']

/**
 * Get all users from auth.users
 */
export async function getUsers(limit = 100, offset = 0) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data as User[]
}

/**
 * Get user count
 * Note: auth.users requires using auth.admin API or a view/function
 * This assumes you have a public view or function that exposes user count
 */
export async function getUserCount() {
  const supabase = createServerClient()
  
  const { count, error } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  if (error) throw error
  return count || 0
}

/**
 * Get user play history
 */
export async function getUserPlayHistory(limit = 100, offset = 0) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('user_play_history')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data as UserPlayHistory[]
}

/**
 * Get play history count
 */
export async function getPlayHistoryCount() {
  const supabase = createServerClient()
  
  const { count, error } = await supabase
    .from('user_play_history')
    .select('*', { count: 'exact', head: true })

  if (error) throw error
  return count || 0
}

/**
 * Get unified sessions
 */
export async function getUnifiedSessions(limit = 100, offset = 0) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('unified_sessions')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data as UnifiedSession[]
}

/**
 * Get unified sessions count
 */
export async function getUnifiedSessionsCount() {
  const supabase = createServerClient()
  
  const { count, error } = await supabase
    .from('unified_sessions')
    .select('*', { count: 'exact', head: true })

  if (error) throw error
  return count || 0
}

/**
 * Get favorites
 */
export async function getFavorites(limit = 100, offset = 0) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data as Favorite[]
}

/**
 * Get favorites count
 */
export async function getFavoritesCount() {
  const supabase = createServerClient()
  
  const { count, error } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })

  if (error) throw error
  return count || 0
}

/**
 * Get feedback
 */
export async function getFeedback(limit = 100, offset = 0) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data as Feedback[]
}

/**
 * Get feedback count
 */
export async function getFeedbackCount() {
  const supabase = createServerClient()
  
  const { count, error } = await supabase
    .from('feedback')
    .select('*', { count: 'exact', head: true })

  if (error) throw error
  return count || 0
}

/**
 * Get analytics summary
 */
export async function getAnalyticsSummary() {
  const [userCount, playHistoryCount, sessionsCount, favoritesCount, feedbackCount] = 
    await Promise.all([
      getUserCount(),
      getPlayHistoryCount(),
      getUnifiedSessionsCount(),
      getFavoritesCount(),
      getFeedbackCount(),
    ])

  return {
    userCount,
    playHistoryCount,
    sessionsCount,
    favoritesCount,
    feedbackCount,
  }
}

