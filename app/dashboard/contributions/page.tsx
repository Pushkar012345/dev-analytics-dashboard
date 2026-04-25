'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useGithubUser, useGithubRepos } from '@/hooks/useGithubData'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import dynamic from 'next/dynamic'

const CommitChart = dynamic(() => import('@/components/CommitChart'), { ssr: false })

export default function ContributionsPage() {
  const { data: session, status } = useSession()
  const { data: user } = useGithubUser()
  const { data: repos } = useGithubRepos()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  )

  // Build monthly commit data from repo updated_at dates
  const monthlyData = (() => {
    const months: Record<string, number> = {}
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const now = new Date()

    // Initialize last 6 months with 0
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = monthNames[d.getMonth()]
      months[key] = 0
    }

    // Count repos updated in each month
    repos?.forEach((repo: any) => {
      const d = new Date(repo.updated_at)
      const diff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
      if (diff >= 0 && diff < 6) {
        const key = monthNames[d.getMonth()]
        months[key] = (months[key] || 0) + 1
      }
    })

    return Object.entries(months).map(([month, count]) => ({ month, count }))
  })()

  // Streak calculation
  const totalRepos = repos?.length || 0
  const recentRepos = repos?.filter((r: any) => {
    const days = (Date.now() - new Date(r.updated_at).getTime()) / (1000 * 60 * 60 * 24)
    return days < 30
  }).length || 0

  const stats = [
    { label: 'Total Repos', value: totalRepos },
    { label: 'Updated This Month', value: recentRepos },
    { label: 'Public Gists', value: user?.public_gists || 0 },
    { label: 'Following', value: user?.following || 0 },
  ]

  // Most active day (based on repo updates)
  const dayCount: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 }
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  repos?.forEach((repo: any) => {
    const day = dayNames[new Date(repo.updated_at).getDay()]
    dayCount[day] = (dayCount[day] || 0) + 1
  })
  const maxDay = Math.max(...Object.values(dayCount)) || 1

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar session={session} />
      <div className="flex min-h-0">
        <Sidebar username={user?.login || ''} />
        <div className="flex-1 min-w-0 p-3 md:p-6 pb-24 md:pb-6">

          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">Contributions</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Your activity and commit trends</p>
          </div>

          {/* Stat Cards — 2 cols mobile, 4 desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Commit Chart */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6 overflow-hidden w-full">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Repo Activity — Last 6 Months</h2>
            <CommitChart data={monthlyData} />
          </div>

          {/* Day of week activity */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Most Active Days</h2>
            <div className="flex items-end gap-1 sm:gap-3 h-28">
              {Object.entries(dayCount).map(([day, count]) => (
                <div key={day} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className="w-full bg-blue-500 rounded-t-md transition-all"
                    style={{ height: `${(count / maxDay) * 80}px`, minHeight: count > 0 ? '4px' : '2px', opacity: count > 0 ? 1 : 0.15 }}
                  />
                  <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recently updated repos */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Recently Updated Repos</h2>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {repos
                ?.sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                .slice(0, 6)
                .map((repo: any) => {
                  const days = Math.floor((Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24))
                  return (
                    <div key={repo.id} className="py-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <a href={repo.html_url} target="_blank" className="text-blue-600 text-sm font-medium hover:underline truncate block">{repo.name}</a>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{repo.description || 'No description'}</p>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{days === 0 ? 'today' : `${days}d ago`}</span>
                    </div>
                  )
                })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}