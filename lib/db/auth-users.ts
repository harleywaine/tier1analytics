import { createServerClient } from '../supabase-server'

/**
 * Helper functions for accessing auth.users
 * 
 * Note: auth.users is in the auth schema, not public schema.
 * You have two options:
 * 
 * 1. Create a PostgreSQL view in Supabase:
 *    CREATE VIEW public.users AS SELECT id, email, created_at, updated_at FROM auth.users;
 * 
 * 2. Use Supabase Admin API (requires @supabase/supabase-js admin methods)
 * 
 * This implementation assumes option 1 (public view exists).
 * If you need to use the admin API, update these functions accordingly.
 */

/**
 * Get all users from auth.users (via public view)
 */
export async function getAuthUsers(limit = 100, offset = 0) {
  const supabase = createServerClient()
  
  // This assumes you have a public.users view that mirrors auth.users
  // If not, you'll need to use Supabase Admin API or create the view
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching users. Make sure you have a public.users view or use Admin API:', error)
    throw error
  }
  
  return data
}

/**
 * Get auth users count
 */
export async function getAuthUsersCount() {
  const supabase = createServerClient()
  
  const { count, error } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Error counting users:', error)
    throw error
  }
  
  return count || 0
}

