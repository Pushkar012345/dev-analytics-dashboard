'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useGithubUser, useGithubRepos } from '@/hooks/useGithubData'
import dynamic from 'next/dynamic'
import Sidebar from '@/components/Sidebar'

const LanguageChart = dynamic(() => import('@/components/LanguageChart'), { ssr: false })
const StarsChart = dynamic(() => import('@/components/StarsChart'), { ssr: false })

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { data: user, isLoading: userLoading } = useGithubUser()
  const { data: repos, isLoading: reposLoading } = useGithubRepos()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  const totalStars = repos?.reduce((acc: number, repo: any) => acc + repo.stargazers_count, 0) || 0
  const totalForks = repos?.reduce((acc: number, repo: any) => acc + repo.forks_count, 0) || 0

  const stats = [
    { label: 'Public Repos', value: userLoading ? '...' : user?.public_repos },
    { label: 'Total Stars', value: reposLoading ? '...' : totalStars },
    { label: 'Followers', value: userLoading ? '...' : user?.followers },
    { label: 'Total Forks', value: reposLoading ? '...' : totalForks },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="white">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38l-.01-1.49c-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">DevDash</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <img src={session?.user?.image || ''} alt="avatar" className="w-8 h-8 rounded-full" />
          <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-300">{session?.user?.name}</span>
          <button
            onClick={() => signOut()}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 border border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-1 rounded-md"
          >
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">↩</span>
          </button>
        </div>
      </nav>

      {/* Body with Sidebar */}
      <div className="flex min-h-0">
        <Sidebar username={user?.login || ''} />

        {/* pb-20 on mobile to clear the bottom nav */}
        <div className="flex-1 min-w-0 p-3 md:p-6 pb-24 md:pb-6">
          {/* Profile Header */}
          <div className="flex items-center gap-3 mb-6">
            <img src={user?.avatar_url} alt="avatar" className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-blue-100"/>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">{user?.name || user?.login}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">@{user?.login} · {user?.location || 'GitHub Developer'}</p>
            </div>
          </div>

          {/* Stat Cards — 2 cols on mobile, 4 on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Charts — 1 col on mobile, 2 on desktop */}
          {!reposLoading && repos && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 w-full overflow-hidden">
              <div className="min-w-0 overflow-hidden">
                <LanguageChart repos={repos} />
              </div>
              <div className="min-w-0 overflow-hidden">
                <StarsChart repos={repos} />
              </div>
            </div>
          )}

          {/* Top Repos */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Top Repositories</h2>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {reposLoading ? (
                <p className="text-gray-400 text-sm py-4">Loading repos...</p>
              ) : (
                repos
                  ?.sort((a: any, b: any) => b.stargazers_count - a.stargazers_count)
                  .slice(0, 5)
                  .map((repo: any) => (
                    <div key={repo.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="min-w-0">
                        <a href={repo.html_url} target="_blank" className="text-blue-600 font-medium text-sm hover:underline truncate block">
                          {repo.name}
                        </a>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{repo.description || 'No description'}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 shrink-0">
                        {repo.language && (
                          <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">{repo.language}</span>
                        )}
                        <span>★ {repo.stargazers_count}</span>
                        <span>⑂ {repo.forks_count}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}