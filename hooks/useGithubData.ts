import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

export function useGithubUser() {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ['github-user'],
    queryFn: async () => {
      const res = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      })
      return res.json()
    },
    enabled: !!session?.accessToken,
  })
}

export function useGithubRepos() {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ['github-repos'],
    queryFn: async () => {
      const res = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      })
      return res.json()
    },
    enabled: !!session?.accessToken,
  })
}

export function useGithubEvents() {
  const { data: session } = useSession()
  const { data: user } = useGithubUser()

  return useQuery({
    queryKey: ['github-events-v4', user?.login],
    queryFn: async () => {
      const headers = { Authorization: `Bearer ${session?.accessToken}` }

      const pages = await Promise.all(
        [1, 2, 3].map((page) =>
          fetch(
            `https://api.github.com/users/${user.login}/events?per_page=100&page=${page}`,
            { headers }
          ).then((r) => r.json())
        )
      )

      const allEvents: any[] = pages
        .flat()
        .filter((e: any) => e && typeof e === 'object' && e.type)

      // GitHub strips commit details from payload for this token scope.
      // We count push events as the activity unit (each push = 1 push activity).
      const pushEvents = allEvents.filter((e: any) => e.type === 'PushEvent')

      // --- Monthly push counts (last 6 months) ---
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      const now = new Date()
      const monthlyMap: Record<string, number> = {}
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        monthlyMap[`${d.getFullYear()}-${d.getMonth()}`] = 0
      }

      pushEvents.forEach((e: any) => {
        const d = new Date(e.created_at)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        if (key in monthlyMap) monthlyMap[key] += 1
      })

      const monthlyData = Object.entries(monthlyMap).map(([key, count]) => {
        const month = parseInt(key.split('-')[1])
        return { month: monthNames[month], count }
      })

      // --- Day of week breakdown ---
      const dayNames7 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      const dayCount: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 }
      pushEvents.forEach((e: any) => {
        const day = dayNames7[new Date(e.created_at).getDay()]
        dayCount[day] += 1
      })

      // --- Recent push activity feed (use repo name + branch from ref) ---
      const recentPushes = pushEvents.slice(0, 10).map((e: any) => {
        const branch = e.payload?.ref?.replace('refs/heads/', '') || 'main'
        return {
          repo: e.repo?.name?.split('/')[1] || e.repo?.name,
          repoUrl: `https://github.com/${e.repo?.name}`,
          branch,
          message: `Pushed to ${branch}`,
          date: e.created_at,
        }
      })

      // --- Streak: consecutive days with any push ---
      const pushDates = new Set(
        pushEvents.map((e: any) => new Date(e.created_at).toDateString())
      )
      let streak = 0
      const today = new Date()
      for (let i = 0; i < 365; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        if (pushDates.has(d.toDateString())) {
          streak++
        } else if (i > 0) {
          break
        }
      }

      return {
        monthlyData,
        dayCount,
        dayOrder,
        recentPushes,
        totalCommits: pushEvents.length, // pushes, not raw commits
        streak,
      }
    },
    enabled: !!session?.accessToken && !!user?.login,
    staleTime: 5 * 60 * 1000,
  })
}