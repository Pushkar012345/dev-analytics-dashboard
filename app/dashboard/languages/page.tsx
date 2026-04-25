'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useGithubUser, useGithubRepos } from '@/hooks/useGithubData'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import dynamic from 'next/dynamic'

const LanguageChart = dynamic(() => import('@/components/LanguageChart'), { ssr: false })
const StarsChart = dynamic(() => import('@/components/StarsChart'), { ssr: false })

export default function LanguagesPage() {
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

  // Build language stats
  const langMap: Record<string, { count: number; stars: number }> = {}
  repos?.forEach((repo: any) => {
    if (repo.language) {
      if (!langMap[repo.language]) langMap[repo.language] = { count: 0, stars: 0 }
      langMap[repo.language].count += 1
      langMap[repo.language].stars += repo.stargazers_count
    }
  })

  const totalRepos = repos?.filter((r: any) => r.language).length || 1
  const langList = Object.entries(langMap)
    .map(([name, data]) => ({
      name,
      count: data.count,
      stars: data.stars,
      percent: Math.round((data.count / totalRepos) * 100),
    }))
    .sort((a, b) => b.count - a.count)

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#ec4899']

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar session={session} />
      <div className="flex">
        <Sidebar username={user?.login || ''} />
        <div className="flex-1 p-6">

          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Languages</h1>
            <p className="text-gray-500 text-sm mt-1">{langList.length} languages across your repos</p>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <LanguageChart repos={repos || []} />
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Repos per Language</h2>
              <div className="space-y-3">
                {langList.slice(0, 6).map((lang, i) => (
                  <div key={lang.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-sm text-gray-700">{lang.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{lang.count} repos · {lang.percent}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${lang.percent}%`, background: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Language cards */}
          <div className="grid grid-cols-3 gap-4">
            {langList.map((lang, i) => (
              <div key={lang.name} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-200 transition">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="font-medium text-gray-900 text-sm">{lang.name}</span>
                  {i === 0 && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full ml-auto">Top</span>}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Repositories</span>
                    <span className="font-medium text-gray-700">{lang.count}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Total Stars</span>
                    <span className="font-medium text-gray-700">★ {lang.stars}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Share</span>
                    <span className="font-medium text-gray-700">{lang.percent}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}