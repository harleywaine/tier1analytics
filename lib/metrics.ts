import { createServerClient } from './supabase-server'
import type { KpisResponse, TrendsResponse, TopSessionsResponse, TopSession } from './db/types'

/**
 * Get start and end dates for a period
 */
function getDateRange(days: number): { start: Date; end: Date } {
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  const start = new Date(end)
  start.setDate(start.getDate() - days)
  start.setHours(0, 0, 0, 0)
  return { start, end }
}

function getTodayRange(): { start: Date; end: Date } {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

/**
 * Clamp progress percentage between 0 and 100
 */
function clampProgress(progress: number | null): number {
  if (progress === null || progress === undefined) return 0
  return Math.max(0, Math.min(100, progress))
}

/**
 * Get KPIs for the dashboard
 */
export async function getKpis(): Promise<KpisResponse> {
  const supabase = createServerClient()
  const now = new Date()
  const today = getTodayRange()
  const last7d = getDateRange(7)
  const last30d = getDateRange(30)

  // Helper to format date for Supabase
  const formatDate = (date: Date) => date.toISOString()

  // New Users
  const [newUsersToday, newUsers7d, newUsers30d] = await Promise.all([
    supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', formatDate(today.start))
      .lte('created_at', formatDate(today.end)),
    supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', formatDate(last7d.start))
      .lte('created_at', formatDate(last7d.end)),
    supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', formatDate(last30d.start))
      .lte('created_at', formatDate(last30d.end)),
  ])

  // Active Users (DAU/WAU/MAU)
  const todayStart = formatDate(today.start)
  const todayEnd = formatDate(today.end)
  const sevenDaysAgo = formatDate(last7d.start)
  const thirtyDaysAgo = formatDate(last30d.start)

  // Get distinct user counts (we'll need to fetch and count manually)
  const [dauData, wauData, mauData] = await Promise.all([
    supabase
      .from('user_play_history')
      .select('user_id')
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd),
    supabase
      .from('user_play_history')
      .select('user_id')
      .gte('created_at', sevenDaysAgo),
    supabase
      .from('user_play_history')
      .select('user_id')
      .gte('created_at', thirtyDaysAgo),
  ])

  const dau = new Set(dauData.data?.map((r) => r.user_id) || []).size
  const wau = new Set(wauData.data?.map((r) => r.user_id) || []).size
  const mau = new Set(mauData.data?.map((r) => r.user_id) || []).size

  // Plays
  const [playsToday, plays7d, plays30d] = await Promise.all([
    supabase
      .from('user_play_history')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd),
    supabase
      .from('user_play_history')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', formatDate(last7d.start))
      .lte('created_at', formatDate(last7d.end)),
    supabase
      .from('user_play_history')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', formatDate(last30d.start))
      .lte('created_at', formatDate(last30d.end)),
  ])

  // Minutes Listened - fetch play history and join with sessions
  const [minutesTodayData, minutes7dData, minutes30dData] = await Promise.all([
    supabase
      .from('user_play_history')
      .select('progress_percentage, session_id')
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd),
    supabase
      .from('user_play_history')
      .select('progress_percentage, session_id')
      .gte('created_at', formatDate(last7d.start))
      .lte('created_at', formatDate(last7d.end)),
    supabase
      .from('user_play_history')
      .select('progress_percentage, session_id')
      .gte('created_at', formatDate(last30d.start))
      .lte('created_at', formatDate(last30d.end)),
  ])

  // Fetch all unique session IDs and get their lengths
  const allSessionIds = new Set<string>()
  ;[minutesTodayData.data, minutes7dData.data, minutes30dData.data].forEach((data) => {
    data?.forEach((item) => {
      if (item.session_id) allSessionIds.add(item.session_id)
    })
  })

  const sessionLengths = new Map<string, number>()
  if (allSessionIds.size > 0) {
    const { data: sessions } = await supabase
      .from('unified_sessions')
      .select('id, length')
      .in('id', Array.from(allSessionIds))

    sessions?.forEach((s) => {
      sessionLengths.set(s.id, s.length || 0)
    })
  }

  const calculateMinutes = (data: any[]): number => {
    return (
      data.reduce((sum, item) => {
        const progress = clampProgress(item.progress_percentage) / 100.0
        const length = sessionLengths.get(item.session_id) || 0
        return sum + progress * length
      }, 0) / 60.0
    )
  }

  // Completion Rate
  const [completionData] = await Promise.all([
    supabase
      .from('user_play_history')
      .select('status, progress_percentage')
      .gte('created_at', formatDate(last30d.start))
      .lte('created_at', formatDate(last30d.end)),
  ])

  const completionRecords = completionData.data || []
  const completed = completionRecords.filter(
    (r) => r.status === 'completed' || clampProgress(r.progress_percentage) >= 95
  ).length
  const completionRate =
    completionRecords.length > 0 ? (completed / completionRecords.length) * 100 : 0

  // Favorites
  const [favorites7d, favorites30d] = await Promise.all([
    supabase
      .from('favorites')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', formatDate(last7d.start))
      .lte('created_at', formatDate(last7d.end)),
    supabase
      .from('favorites')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', formatDate(last30d.start))
      .lte('created_at', formatDate(last30d.end)),
  ])

  // Feedback
  const [feedback7d, feedback30d] = await Promise.all([
    supabase
      .from('feedback')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', formatDate(last7d.start))
      .lte('created_at', formatDate(last7d.end)),
    supabase
      .from('feedback')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', formatDate(last30d.start))
      .lte('created_at', formatDate(last30d.end)),
  ])

  return {
    newUsers: {
      today: newUsersToday.count || 0,
      last7d: newUsers7d.count || 0,
      last30d: newUsers30d.count || 0,
    },
    activeUsers: {
      dau,
      wau,
      mau,
    },
    plays: {
      today: playsToday.count || 0,
      last7d: plays7d.count || 0,
      last30d: plays30d.count || 0,
    },
    minutesListened: {
      today: calculateMinutes(minutesTodayData.data || []),
      last7d: calculateMinutes(minutes7dData.data || []),
      last30d: calculateMinutes(minutes30dData.data || []),
    },
    completionRate: Math.round(completionRate * 100) / 100,
    favorites: {
      last7d: favorites7d.count || 0,
      last30d: favorites30d.count || 0,
    },
    feedback: {
      last7d: feedback7d.count || 0,
      last30d: feedback30d.count || 0,
    },
  }
}

/**
 * Get DAU trends for the last N days
 */
export async function getTrends(days: number): Promise<TrendsResponse> {
  const supabase = createServerClient()
  const { start } = getDateRange(days)
  const startDate = start.toISOString()

  // Fetch all play history records in the date range
  const { data, error } = await supabase
    .from('user_play_history')
    .select('user_id, created_at')
    .gte('created_at', startDate)
    .order('created_at', { ascending: true })

  if (error) throw error

  // Group by date and count distinct users per day
  const dailyUsers = new Map<string, Set<string>>()

  data?.forEach((record) => {
    const date = new Date(record.created_at).toISOString().split('T')[0]
    if (!dailyUsers.has(date)) {
      dailyUsers.set(date, new Set())
    }
    dailyUsers.get(date)!.add(record.user_id)
  })

  // Convert to array and fill missing dates with 0
  const result: Array<{ date: string; dau: number }> = []
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const dau = dailyUsers.get(dateStr)?.size || 0
    result.push({ date: dateStr, dau })
  }

  return { data: result }
}

/**
 * Get daily minutes listened for the last N days
 */
export async function getDailyMinutes(days: number): Promise<{ data: Array<{ date: string; minutes: number }> }> {
  const supabase = createServerClient()
  const { start } = getDateRange(days)
  const startDate = start.toISOString()

  // Fetch play history records
  const { data: playHistory, error } = await supabase
    .from('user_play_history')
    .select('session_id, progress_percentage, created_at')
    .gte('created_at', startDate)

  if (error) throw error

  if (!playHistory || playHistory.length === 0) {
    return { data: [] }
  }

  // Get unique session IDs
  const sessionIds = [...new Set(playHistory.map((r) => r.session_id).filter(Boolean))]

  // Fetch session lengths
  const sessionLengths = new Map<string, number>()
  if (sessionIds.length > 0) {
    const { data: sessions } = await supabase
      .from('unified_sessions')
      .select('id, length')
      .in('id', sessionIds)

    sessions?.forEach((s) => {
      sessionLengths.set(s.id, s.length || 0)
    })
  }

  // Group by date and calculate minutes
  const dailyMinutes = new Map<string, number>()

  playHistory.forEach((record) => {
    const date = new Date(record.created_at).toISOString().split('T')[0]
    const progress = clampProgress(record.progress_percentage) / 100.0
    const length = sessionLengths.get(record.session_id) || 0
    const minutes = (progress * length) / 60.0

    dailyMinutes.set(date, (dailyMinutes.get(date) || 0) + minutes)
  })

  // Convert to array and fill missing dates
  const result: Array<{ date: string; minutes: number }> = []
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const minutes = Math.round((dailyMinutes.get(dateStr) || 0) * 100) / 100
    result.push({ date: dateStr, minutes })
  }

  return { data: result }
}

/**
 * Get top sessions by play count
 */
export async function getTopSessions(
  days: number,
  limit: number
): Promise<TopSessionsResponse> {
  const supabase = createServerClient()
  const { start } = getDateRange(days)
  const startDate = start.toISOString()

  // Fetch play history records
  const { data: playHistory, error: playHistoryError } = await supabase
    .from('user_play_history')
    .select('session_id, progress_percentage')
    .gte('created_at', startDate)

  if (playHistoryError) throw playHistoryError

  if (!playHistory || playHistory.length === 0) {
    return { sessions: [] }
  }

  // Get unique session IDs
  const sessionIds = [...new Set(playHistory.map((r) => r.session_id).filter(Boolean))]

  if (sessionIds.length === 0) {
    return { sessions: [] }
  }

  // Fetch session details
  const { data: sessions, error: sessionsError } = await supabase
    .from('unified_sessions')
    .select('id, title, length')
    .in('id', sessionIds)

  if (sessionsError) throw sessionsError

  // Create a map of session details
  const sessionMap = new Map<string, { title: string | null; length: number }>()
  sessions?.forEach((s) => {
    sessionMap.set(s.id, {
      title: s.title,
      length: s.length || 0,
    })
  })

  // Group by session_id and calculate metrics
  const statsMap = new Map<
    string,
    {
      title: string | null
      plays: number
      totalProgress: number
      totalMinutes: number
      progressCount: number
    }
  >()

  playHistory.forEach((record) => {
    const sessionId = record.session_id
    if (!sessionId) return

    const progress = clampProgress(record.progress_percentage)
    const session = sessionMap.get(sessionId)
    const length = session?.length || 0
    const title = session?.title || null

    if (!statsMap.has(sessionId)) {
      statsMap.set(sessionId, {
        title,
        plays: 0,
        totalProgress: 0,
        totalMinutes: 0,
        progressCount: 0,
      })
    }

    const stats = statsMap.get(sessionId)!
    stats.plays++
    stats.totalProgress += progress
    stats.progressCount++
    stats.totalMinutes += (progress / 100.0) * (length / 60.0)
  })

  // Convert to array and sort by plays
  const topSessions: TopSession[] = Array.from(statsMap.entries())
    .map(([sessionId, stats]) => ({
      sessionId,
      title: stats.title,
      plays: stats.plays,
      minutesListened: Math.round(stats.totalMinutes * 100) / 100,
      avgProgress: stats.progressCount > 0 
        ? Math.round((stats.totalProgress / stats.progressCount) * 100) / 100 
        : 0,
    }))
    .sort((a, b) => b.plays - a.plays)
    .slice(0, limit)

  return { sessions: topSessions }
}

/**
 * Get user metrics list
 */
export async function getUserMetrics(limit = 100, offset = 0) {
  const supabase = createServerClient()
  const last30d = getDateRange(30)
  const formatDate = (date: Date) => date.toISOString()

  // Fetch users from public.users view
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, created_at')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (usersError) throw usersError

  if (!users || users.length === 0) {
    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
    
    return { users: [], total: totalCount || 0 }
  }

  const userIds = users.map((u) => u.id)

  // Fetch play history for these users
  const { data: playHistory, error: playHistoryError } = await supabase
    .from('user_play_history')
    .select('user_id, session_id, progress_percentage, status, created_at')
    .in('user_id', userIds)
    .gte('created_at', formatDate(last30d.start))

  if (playHistoryError) throw playHistoryError

  // Get unique session IDs
  const sessionIds = [...new Set(playHistory?.map((r) => r.session_id).filter(Boolean) || [])]

  // Fetch session lengths
  const sessionLengths = new Map<string, number>()
  if (sessionIds.length > 0) {
    const { data: sessions } = await supabase
      .from('unified_sessions')
      .select('id, length')
      .in('id', sessionIds)

    sessions?.forEach((s) => {
      sessionLengths.set(s.id, s.length || 0)
    })
  }

  // Fetch favorites
  const { data: favorites, error: favoritesError } = await supabase
    .from('favorites')
    .select('user_id')
    .in('user_id', userIds)

  if (favoritesError) throw favoritesError

  // Fetch feedback
  const { data: feedback, error: feedbackError } = await supabase
    .from('feedback')
    .select('user_id')
    .in('user_id', userIds)

  if (feedbackError) throw feedbackError

  // Calculate metrics per user
  const userMetrics = users.map((user) => {
    const userPlays = playHistory?.filter((p) => p.user_id === user.id) || []
    const totalPlays = userPlays.length
    const completedPlays = userPlays.filter(
      (p) => p.status === 'completed' || clampProgress(p.progress_percentage) >= 95
    ).length
    const completionRate = totalPlays > 0 ? (completedPlays / totalPlays) * 100 : 0

    // Calculate minutes listened
    const totalMinutes = userPlays.reduce((sum, play) => {
      const progress = clampProgress(play.progress_percentage) / 100.0
      const length = sessionLengths.get(play.session_id) || 0
      return sum + (progress * length) / 60.0
    }, 0)

    // Calculate average progress
    const avgProgress =
      userPlays.length > 0
        ? userPlays.reduce((sum, p) => sum + clampProgress(p.progress_percentage), 0) / userPlays.length
        : 0

    const userFavorites = favorites?.filter((f) => f.user_id === user.id).length || 0
    const userFeedback = feedback?.filter((f) => f.user_id === user.id).length || 0

    // Last activity
    const lastPlay = userPlays.length > 0
      ? userPlays.reduce((latest, play) => {
          return new Date(play.created_at) > new Date(latest.created_at) ? play : latest
        }, userPlays[0])
      : null

    return {
      userId: user.id,
      email: user.email || 'No email',
      createdAt: user.created_at,
      totalPlays,
      completedPlays,
      completionRate: Math.round(completionRate * 100) / 100,
      totalMinutes: Math.round(totalMinutes * 100) / 100,
      avgProgress: Math.round(avgProgress * 100) / 100,
      favorites: userFavorites,
      feedback: userFeedback,
      lastActivity: lastPlay?.created_at || null,
    }
  })

  // Get total count for pagination
  const { count: totalCount } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })

  return {
    users: userMetrics,
    total: totalCount || 0,
  }
}

/**
 * Get detailed individual user usage metrics
 */
export async function getUserDetailMetrics(userId: string) {
  const supabase = createServerClient()
  const formatDate = (date: Date) => date.toISOString()

  // Get user info
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, created_at, email_confirmed_at, last_sign_in_at')
    .eq('id', userId)
    .single()

  if (userError) throw userError
  if (!user) throw new Error('User not found')

  // Get all play history for this user
  const { data: playHistory, error: playHistoryError } = await supabase
    .from('user_play_history')
    .select('id, session_id, progress_percentage, status, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (playHistoryError) throw playHistoryError

  // Get unique session IDs
  const sessionIds = [...new Set(playHistory?.map((r) => r.session_id).filter(Boolean) || [])]

  // Fetch session details
  const sessionMap = new Map<string, { title: string | null; length: number }>()
  if (sessionIds.length > 0) {
    const { data: sessions } = await supabase
      .from('unified_sessions')
      .select('id, title, length')
      .in('id', sessionIds)

    sessions?.forEach((s) => {
      sessionMap.set(s.id, {
        title: s.title,
        length: s.length || 0,
      })
    })
  }

  // Get favorites
  const { data: favorites, error: favoritesError } = await supabase
    .from('favorites')
    .select('session_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (favoritesError) throw favoritesError

  // Get favorite session details
  const favoriteSessionIds = favorites?.map((f) => f.session_id).filter(Boolean) || []
  const favoriteSessionsMap = new Map<string, { title: string | null }>()
  if (favoriteSessionIds.length > 0) {
    const { data: favoriteSessions } = await supabase
      .from('unified_sessions')
      .select('id, title')
      .in('id', favoriteSessionIds)

    favoriteSessions?.forEach((s) => {
      favoriteSessionsMap.set(s.id, { title: s.title })
    })
  }

  // Get feedback
  const { data: feedback, error: feedbackError } = await supabase
    .from('feedback')
    .select('id, message, created_at, app_version, device_info')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (feedbackError) throw feedbackError

  // Calculate time-based metrics
  const today = getTodayRange()
  const last7d = getDateRange(7)
  const last30d = getDateRange(30)

  const playsToday = playHistory?.filter(
    (p) => new Date(p.created_at) >= today.start && new Date(p.created_at) <= today.end
  ).length || 0

  const plays7d = playHistory?.filter(
    (p) => new Date(p.created_at) >= last7d.start
  ).length || 0

  const plays30d = playHistory?.filter(
    (p) => new Date(p.created_at) >= last30d.start
  ).length || 0

  // Calculate minutes by period
  const calculateMinutes = (plays: any[]) => {
    return plays.reduce((sum, play) => {
      const progress = clampProgress(play.progress_percentage) / 100.0
      const session = sessionMap.get(play.session_id)
      const length = session?.length || 0
      return sum + (progress * length) / 60.0
    }, 0)
  }

  const minutesToday = calculateMinutes(
    playHistory?.filter(
      (p) => new Date(p.created_at) >= today.start && new Date(p.created_at) <= today.end
    ) || []
  )

  const minutes7d = calculateMinutes(
    playHistory?.filter((p) => new Date(p.created_at) >= last7d.start) || []
  )

  const minutes30d = calculateMinutes(
    playHistory?.filter((p) => new Date(p.created_at) >= last30d.start) || []
  )

  // Calculate session-level stats
  const sessionStats = new Map<
    string,
    {
      title: string | null
      plays: number
      totalMinutes: number
      avgProgress: number
      lastPlayed: string | null
      progressSum: number
      progressCount: number
    }
  >()

  playHistory?.forEach((play) => {
    const sessionId = play.session_id
    if (!sessionId) return

    const session = sessionMap.get(sessionId)
    const progress = clampProgress(play.progress_percentage)
    const length = session?.length || 0
    const minutes = (progress / 100.0) * (length / 60.0)

    if (!sessionStats.has(sessionId)) {
      sessionStats.set(sessionId, {
        title: session?.title || null,
        plays: 0,
        totalMinutes: 0,
        avgProgress: 0,
        lastPlayed: null,
        progressSum: 0,
        progressCount: 0,
      })
    }

    const stats = sessionStats.get(sessionId)!
    stats.plays++
    stats.totalMinutes += minutes
    stats.progressSum += progress
    stats.progressCount++
    if (!stats.lastPlayed || new Date(play.created_at) > new Date(stats.lastPlayed)) {
      stats.lastPlayed = play.created_at
    }
  })

  // Calculate average progress for each session
  sessionStats.forEach((stats, sessionId) => {
    stats.avgProgress = stats.progressCount > 0 
      ? Math.round((stats.progressSum / stats.progressCount) * 100) / 100 
      : 0
    stats.totalMinutes = Math.round(stats.totalMinutes * 100) / 100
  })

  // Daily activity breakdown (last 30 days)
  const dailyActivity = new Map<string, { plays: number; minutes: number }>()
  playHistory?.forEach((play) => {
    const date = new Date(play.created_at).toISOString().split('T')[0]
    const session = sessionMap.get(play.session_id)
    const progress = clampProgress(play.progress_percentage) / 100.0
    const length = session?.length || 0
    const minutes = (progress * length) / 60.0

    if (!dailyActivity.has(date)) {
      dailyActivity.set(date, { plays: 0, minutes: 0 })
    }
    const day = dailyActivity.get(date)!
    day.plays++
    day.minutes += minutes
  })

  // Fill in missing dates for last 30 days
  const dailyActivityArray: Array<{ date: string; plays: number; minutes: number }> = []
  const todayDate = new Date()
  todayDate.setHours(23, 59, 59, 999)

  for (let i = 29; i >= 0; i--) {
    const date = new Date(todayDate)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const activity = dailyActivity.get(dateStr) || { plays: 0, minutes: 0 }
    dailyActivityArray.push({
      date: dateStr,
      plays: activity.plays,
      minutes: Math.round(activity.minutes * 100) / 100,
    })
  }

  // Overall stats
  const totalPlays = playHistory?.length || 0
  const completedPlays = playHistory?.filter(
    (p) => p.status === 'completed' || clampProgress(p.progress_percentage) >= 95
  ).length || 0
  const completionRate = totalPlays > 0 ? (completedPlays / totalPlays) * 100 : 0
  const totalMinutes = calculateMinutes(playHistory || [])
  const avgProgress = playHistory && playHistory.length > 0
    ? playHistory.reduce((sum, p) => sum + clampProgress(p.progress_percentage), 0) / playHistory.length
    : 0

  return {
    user: {
      id: user.id,
      email: user.email || 'No email',
      createdAt: user.created_at,
      emailConfirmedAt: user.email_confirmed_at,
      lastSignInAt: user.last_sign_in_at,
    },
    summary: {
      totalPlays,
      completedPlays,
      completionRate: Math.round(completionRate * 100) / 100,
      totalMinutes: Math.round(totalMinutes * 100) / 100,
      avgProgress: Math.round(avgProgress * 100) / 100,
      favorites: favorites?.length || 0,
      feedback: feedback?.length || 0,
    },
    timeBased: {
      today: { plays: playsToday, minutes: Math.round(minutesToday * 100) / 100 },
      last7d: { plays: plays7d, minutes: Math.round(minutes7d * 100) / 100 },
      last30d: { plays: plays30d, minutes: Math.round(minutes30d * 100) / 100 },
    },
    sessions: Array.from(sessionStats.entries())
      .map(([sessionId, stats]) => ({
        sessionId,
        title: stats.title,
        plays: stats.plays,
        totalMinutes: stats.totalMinutes,
        avgProgress: stats.avgProgress,
        lastPlayed: stats.lastPlayed,
      }))
      .sort((a, b) => b.plays - a.plays),
    favorites: favorites?.map((f) => ({
      sessionId: f.session_id,
      title: favoriteSessionsMap.get(f.session_id)?.title || null,
      favoritedAt: f.created_at,
    })) || [],
    feedback: feedback?.map((f) => ({
      id: f.id,
      message: f.message,
      createdAt: f.created_at,
      appVersion: f.app_version,
      deviceInfo: f.device_info,
    })) || [],
    dailyActivity: dailyActivityArray,
  }
}
