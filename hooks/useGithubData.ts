import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import type {
  GithubUser,
  GithubRepo,
  GithubEvent,
  ContributionCalendar,
  ContributionData,
  RecentPush,
} from '@/types/github'

async function ghFetch<T>(url: string, token: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  })
  if (res.status === 401) throw new Error('GitHub token expired. Please sign out and sign in again.')
  if (res.status === 403) throw new Error('GitHub API rate limit reached. Please wait a few minutes and refresh.')
  if (res.status === 404) throw new Error('GitHub resource not found.')
  if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export function useGithubUser() {
  const { data: session } = useSession()
  return useQuery<GithubUser, Error>({
    queryKey: ['github-user'],
    queryFn: () => ghFetch<GithubUser>('https://api.github.com/user', session!.accessToken!),
    enabled: !!session?.accessToken,
    retry: (failureCount, error) => {
      if (error.message.includes('rate limit') || error.message.includes('token expired')) return false
      return failureCount < 2
    },
  })
}

export function useGithubRepos() {
  const { data: session } = useSession()
  return useQuery<GithubRepo[], Error>({
    queryKey: ['github-repos'],
    queryFn: () =>
      ghFetch<GithubRepo[]>(
        'https://api.github.com/user/repos?per_page=100&sort=updated',
        session!.accessToken!
      ),
    enabled: !!session?.accessToken,
    retry: (failureCount, error) => {
      if (error.message.includes('rate limit') || error.message.includes('token expired')) return false
      return failureCount < 2
    },
  })
}

export function useGithubEvents() {
  const { data: session } = useSession()
  const { data: user } = useGithubUser()

  return useQuery<ContributionData, Error>({
    queryKey: ['github-contributions-gql-v1', user?.login],
    queryFn: async () => {
      const token = session!.accessToken!

      const gqlQuery = `
        query($login: String!) {
          user(login: $login) {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    date
                    contributionCount
                    weekday
                  }
                }
              }
            }
          }
        }
      `

      const gqlRes = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: gqlQuery, variables: { login: user!.login } }),
      })

      if (gqlRes.status === 401) throw new Error('GitHub token expired. Please sign out and sign in again.')
      if (gqlRes.status === 403) throw new Error('GitHub API rate limit reached. Please wait a few minutes and refresh.')
      if (!gqlRes.ok) throw new Error(`GitHub GraphQL error: ${gqlRes.status}`)

      const gqlData = await gqlRes.json()

      if (gqlData.errors?.length) {
        throw new Error(`GraphQL error: ${gqlData.errors[0].message}`)
      }

      const calendar: ContributionCalendar =
        gqlData?.data?.user?.contributionsCollection?.contributionCalendar

      if (!calendar) throw new Error('No contribution data returned from GitHub.')

      const allDays = calendar.weeks.flatMap((w) =>
        w.contributionDays.map((d) => ({
          date: d.date,
          count: d.contributionCount,
          weekday: d.weekday,
        }))
      )

      // Monthly counts (last 6 months)
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      const now = new Date()
      const monthlyMap: Record<string, number> = {}
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        monthlyMap[`${d.getFullYear()}-${d.getMonth()}`] = 0
      }
      allDays.forEach(({ date, count }) => {
        const d = new Date(date)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        if (key in monthlyMap) monthlyMap[key] += count
      })
      const monthlyData = Object.entries(monthlyMap).map(([key, count]) => ({
        month: monthNames[parseInt(key.split('-')[1])],
        count,
      }))

      // Day of week breakdown
      const dayNames7 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      const dayCount: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 }
      allDays.forEach(({ weekday, count }) => {
        dayCount[dayNames7[weekday]] += count
      })

      // Streak
      const activeDates = new Set(allDays.filter((d) => d.count > 0).map((d) => d.date))
      let streak = 0
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      const startOffset = activeDates.has(todayStr) ? 0 : 1
      for (let i = startOffset; i < 365; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        if (activeDates.has(dateStr)) streak++
        else break
      }

      // Recent pushes from Events API
      let recentPushes: RecentPush[] = []
      try {
        const events = await ghFetch<GithubEvent[]>(
          `https://api.github.com/users/${user!.login}/events?per_page=30&page=1`,
          token
        )
        recentPushes = events
          .filter((e) => e.type === 'PushEvent')
          .slice(0, 10)
          .map((e) => {
            const branch = e.payload?.ref?.replace('refs/heads/', '') || 'main'
            return {
              repo: e.repo?.name?.split('/')[1] || e.repo?.name,
              repoUrl: `https://github.com/${e.repo?.name}`,
              branch,
              message: `Pushed to ${branch}`,
              date: e.created_at,
            }
          })
      } catch {
        // Non-fatal: contributions data still works without push feed
        recentPushes = []
      }

      return {
        monthlyData,
        dayCount,
        dayOrder,
        recentPushes,
        totalContributions: calendar.totalContributions,
        totalCommits: calendar.totalContributions,
        streak,
      }
    },
    enabled: !!session?.accessToken && !!user?.login,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('rate limit') || error.message.includes('token expired')) return false
      return failureCount < 2
    },
  })
}