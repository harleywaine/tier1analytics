-- Migration: Create public.users view for auth.users access
-- Run this in your Supabase SQL editor if you need to access auth.users
-- 
-- This creates a read-only view that exposes auth.users data to the public schema
-- The service role key will allow access to this view

CREATE OR REPLACE VIEW public.users AS
SELECT 
  id,
  email,
  created_at,
  updated_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users;

-- Grant SELECT permission to authenticated users (or service role)
-- The service role key bypasses RLS, so this is mainly for clarity
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.users TO service_role;

-- Optional: Add a comment
COMMENT ON VIEW public.users IS 'Read-only view of auth.users for analytics dashboard';

