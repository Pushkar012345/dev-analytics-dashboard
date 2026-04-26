'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useGithubUser, useGithubRepos, useGithubEvents } from '@/hooks/useGithubData'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import ErrorBanner from '@/components/ErrorBanner'
import dynamic from 'next/dynamic'

const CommitChart = dynamic(() => import('@/components/CommitChart'), { ssr: false })

export default function ContributionsPage() {
  const { data: session, status } = useSession()
  const { data: user } = useGithubUser()
  const { data: repos } = useGithubRepos()
  const { data: events, isLoading: eventsLoading, isError: eventsError, error: eventsErr, refetch: refetchEvents } = useGithubEvents()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  )

  const recentRepos = repos?.filter((r: any) => {
    const days = (Date.now() - new Date(r.updated_at).getTime()) / (1000 * 60 * 60 * 24)
    return days < 30
  }).length || 0

  const stats = [
    { label: 'Contributions (1yr)', value: eventsLoading ? '...' : events?.totalContributions ?? 0 },
    { label: 'Current Streak', value: eventsLoading ? '...' : `${events?.streak ?? 0}d` },
    { label: 'Repos Active (30d)', value: recentRepos },
    { label: 'Public Gists', value: user?.public_gists || 0 },
  ]

  const dayOrder = events?.dayOrder || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const dayCount = events?.dayCount || {}
  const maxDay = Math.max(...Object.values(dayCount) as number[], 1)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar session={session} />
      <div className="flex min-h-0">
        <Sidebar username={user?.login || ''} />
        <div className="flex-1 min-w-0 p-3 md:p-6 pb-24 md:pb-6 overflow-x-hidden">

          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">Contributions</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Contribution data from GitHub GraphQL API — matches your profile page
            </p>
          </div>

          <ErrorBanner error={eventsError ? eventsErr! : null} onRetry={refetchEvents} />

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* TEMP DEBUG REMOVED */}

          {/* Commit Chart */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Contribution Activity — Last 6 Months</h2>
              {eventsLoading && (
                <span className="text-xs text-gray-400 animate-pulse">Fetching events...</span>
              )}
            </div>
            {events?.monthlyData ? (
              <CommitChart data={events.monthlyData} />
            ) : (
              <div className="h-[220px] flex items-center justify-center">
                <p className="text-gray-400 text-sm animate-pulse">Loading commit data...</p>
              </div>
            )}
          </div>

          {/* Day of week — from real push events */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Commits by Day of Week</h2>
            {eventsLoading ? (
              <div className="h-28 flex items-center justify-center">
                <p className="text-gray-400 text-sm animate-pulse">Loading...</p>
              </div>
            ) : (
              <div className="flex items-end gap-1 sm:gap-3 h-28">
                {dayOrder.map((day) => {
                  const count = dayCount[day] || 0
                  return (
                    <div key={day} className="flex flex-col items-center gap-1 flex-1">
                      <span className="text-[9px] text-gray-400 font-medium">{count || ''}</span>
                      <div
                        className="w-full bg-blue-500 rounded-t-md transition-all"
                        style={{
                          height: `${(count / maxDay) * 72}px`,
                          minHeight: count > 0 ? '4px' : '2px',
                          opacity: count > 0 ? 1 : 0.12,
                        }}
                      />
                      <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">{day}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recent Push Activity */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Recent Push Activity</h2>
            {eventsLoading ? (
              <p className="text-gray-400 text-sm animate-pulse">Loading activity...</p>
            ) : events?.recentPushes?.length === 0 ? (
              <p className="text-gray-400 text-sm">No recent push events found.</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {events?.recentPushes?.map((push: any, i: number) => {
                  const days = Math.floor((Date.now() - new Date(push.date).getTime()) / (1000 * 60 * 60 * 24))
                  return (
                    <div key={i} className="py-3 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <a href={push.repoUrl} target="_blank"
                            className="text-blue-600 font-medium text-sm hover:underline truncate">
                            {push.repo}
                          </a>
                          <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full shrink-0">
                            {push.commits} {push.commits === 1 ? 'commit' : 'commits'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{push.message}</p>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                        {days === 0 ? 'today' : `${days}d ago`}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}