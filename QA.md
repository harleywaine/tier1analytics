# QA: SQL Validation Queries

This document contains SQL snippets you can run directly in the Supabase SQL editor to validate each KPI and spot-check trends/top sessions.

## New Users

### Today
```sql
SELECT COUNT(*) AS new_users_today
FROM auth.users
WHERE DATE(created_at) = CURRENT_DATE;
```

### Last 7 Days
```sql
SELECT COUNT(*) AS new_users_7d
FROM auth.users
WHERE created_at >= NOW() - INTERVAL '7 days'
  AND created_at < NOW();
```

### Last 30 Days
```sql
SELECT COUNT(*) AS new_users_30d
FROM auth.users
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND created_at < NOW();
```

**Note**: If you're using a `public.users` view instead of direct `auth.users` access, replace `auth.users` with `public.users` in the queries above.

## Active Users (DAU/WAU/MAU)

### DAU (Daily Active Users)
```sql
SELECT COUNT(DISTINCT user_id) AS dau
FROM user_play_history
WHERE DATE(created_at) = CURRENT_DATE;
```

### WAU (Weekly Active Users)
```sql
SELECT COUNT(DISTINCT user_id) AS wau
FROM user_play_history
WHERE created_at >= NOW() - INTERVAL '7 days';
```

### MAU (Monthly Active Users)
```sql
SELECT COUNT(DISTINCT user_id) AS mau
FROM user_play_history
WHERE created_at >= NOW() - INTERVAL '30 days';
```

## Plays

### Today
```sql
SELECT COUNT(*) AS plays_today
FROM user_play_history
WHERE DATE(created_at) = CURRENT_DATE;
```

### Last 7 Days
```sql
SELECT COUNT(*) AS plays_7d
FROM user_play_history
WHERE created_at >= NOW() - INTERVAL '7 days'
  AND created_at < NOW();
```

### Last 30 Days
```sql
SELECT COUNT(*) AS plays_30d
FROM user_play_history
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND created_at < NOW();
```

## Minutes Listened

### Today
```sql
SELECT 
  SUM(
    (LEAST(GREATEST(COALESCE(progress_percentage, 0), 0), 100) / 100.0) * 
    COALESCE(us.length, 0)
  ) / 60.0 AS minutes_today
FROM user_play_history uph
LEFT JOIN unified_sessions us ON uph.session_id = us.id
WHERE DATE(uph.created_at) = CURRENT_DATE;
```

### Last 7 Days
```sql
SELECT 
  SUM(
    (LEAST(GREATEST(COALESCE(progress_percentage, 0), 0), 100) / 100.0) * 
    COALESCE(us.length, 0)
  ) / 60.0 AS minutes_7d
FROM user_play_history uph
LEFT JOIN unified_sessions us ON uph.session_id = us.id
WHERE uph.created_at >= NOW() - INTERVAL '7 days'
  AND uph.created_at < NOW();
```

### Last 30 Days
```sql
SELECT 
  SUM(
    (LEAST(GREATEST(COALESCE(progress_percentage, 0), 0), 100) / 100.0) * 
    COALESCE(us.length, 0)
  ) / 60.0 AS minutes_30d
FROM user_play_history uph
LEFT JOIN unified_sessions us ON uph.session_id = us.id
WHERE uph.created_at >= NOW() - INTERVAL '30 days'
  AND uph.created_at < NOW();
```

**Note**: Assumes `unified_sessions.length` is in seconds. If your data suggests it's in minutes, remove the `/ 60.0` division.

## Completion Rate

### Last 30 Days
```sql
SELECT 
  COUNT(CASE 
    WHEN status = 'completed' OR progress_percentage >= 95 
    THEN 1 
  END) * 100.0 / 
  NULLIF(COUNT(*), 0) AS completion_rate_percent
FROM user_play_history
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND created_at < NOW();
```

## Favorites

### Last 7 Days
```sql
SELECT COUNT(*) AS favorites_7d
FROM favorites
WHERE created_at >= NOW() - INTERVAL '7 days'
  AND created_at < NOW();
```

### Last 30 Days
```sql
SELECT COUNT(*) AS favorites_30d
FROM favorites
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND created_at < NOW();
```

## Feedback

### Last 7 Days
```sql
SELECT COUNT(*) AS feedback_7d
FROM feedback
WHERE created_at >= NOW() - INTERVAL '7 days'
  AND created_at < NOW();
```

### Last 30 Days
```sql
SELECT COUNT(*) AS feedback_30d
FROM feedback
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND created_at < NOW();
```

## Trends: DAU Last 30 Days

```sql
SELECT 
  DATE(created_at) AS date,
  COUNT(DISTINCT user_id) AS dau
FROM user_play_history
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date ASC;
```

## Top Sessions (Last 7 Days)

```sql
SELECT 
  uph.session_id,
  us.title,
  COUNT(*) AS plays,
  SUM(
    (LEAST(GREATEST(COALESCE(uph.progress_percentage, 0), 0), 100) / 100.0) * 
    COALESCE(us.length, 0)
  ) / 60.0 AS minutes_listened,
  AVG(LEAST(GREATEST(COALESCE(uph.progress_percentage, 0), 0), 100)) AS avg_progress
FROM user_play_history uph
LEFT JOIN unified_sessions us ON uph.session_id = us.id
WHERE uph.created_at >= NOW() - INTERVAL '7 days'
GROUP BY uph.session_id, us.title
ORDER BY plays DESC
LIMIT 10;
```

## Spot-Check Queries

### Verify null handling
```sql
-- Check for null progress_percentage values
SELECT 
  COUNT(*) AS total_records,
  COUNT(progress_percentage) AS non_null_progress,
  COUNT(*) - COUNT(progress_percentage) AS null_progress_count
FROM user_play_history
WHERE created_at >= NOW() - INTERVAL '7 days';
```

### Verify session length distribution
```sql
-- Check session length values to determine if they're in seconds or minutes
SELECT 
  MIN(length) AS min_length,
  MAX(length) AS max_length,
  AVG(length) AS avg_length,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY length) AS median_length
FROM unified_sessions
WHERE length IS NOT NULL;
```

### Verify status values
```sql
-- Check what status values exist
SELECT 
  status,
  COUNT(*) AS count
FROM user_play_history
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY status
ORDER BY count DESC;
```

## Usage Tips

1. **Run queries in Supabase SQL Editor**: Copy and paste these queries into the Supabase SQL editor to validate metrics.

2. **Compare with Dashboard**: After running a query, compare the result with what's shown on the `/dashboard` page.

3. **Date Ranges**: Adjust the `INTERVAL` values if you want to check different time periods.

4. **Null Handling**: The queries use `COALESCE` and clamping functions to handle nulls, matching the implementation in `lib/metrics.ts`.

5. **Performance**: For large datasets, these queries may take a few seconds. Consider adding indexes on `created_at` columns if queries are slow.

