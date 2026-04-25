'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useGithubRepos, useGithubUser } from '@/hooks/useGithubData'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export default function ReposPage() {
  const { data: session, status } = useSession()
  const { data: user } = useGithubUser()
  const { data: repos, isLoading } = useGithubRepos()
  const router = useRouter()
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('stars')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  function getHealthScore(repo: any) {
    let score = 0
    if (repo.stargazers_count > 0) score += 20
    if (repo.description) score += 20
    if (repo.language) score += 20
    if (!repo.fork) score += 20
    const days = (Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24)
    if (days < 30) score += 20
    else if (days < 90) score += 10
    return score
  }

  function getHealthColor(score: number) {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 50) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-500 bg-red-50'
  }

  const languages = ['all', ...Array.from(new Set(repos?.map((r: any) => r.language).filter(Boolean))) as string[]]

  const filtered = repos
    ?.filter((r: any) => filter === 'all' || r.language === filter)
    ?.sort((a: any, b: any) => {
      if (sort === 'stars') return b.stargazers_count - a.stargazers_count
      if (sort === 'updated') return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      if (sort === 'name') return a.name.localeCompare(b.name)
      return 0
    })

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar session={session} />
      <div className="flex">
        <Sidebar username={user?.login || ''} />
        <div className="flex-1 p-6">

          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Repositories</h1>
            <p className="text-gray-500 text-sm mt-1">{repos?.length || 0} public repositories</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Language:</span>
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700">
                {languages.map((l) => (
                  <option key={l} value={l}>{l === 'all' ? 'All Languages' : l}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Sort:</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700">
                <option value="stars">Most Stars</option>
                <option value="updated">Recently Updated</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>

          {/* Repo Cards */}
          {isLoading ? (
            <p className="text-gray-400 text-sm">Loading repositories...</p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filtered?.map((repo: any) => {
                const health = getHealthScore(repo)
                const healthClass = getHealthColor(health)
                const updatedDays = Math.floor((Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24))
                return (
                  <div key={repo.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:border-blue-200 transition">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <a href={repo.html_url} target="_blank" className="text-blue-600 font-medium text-sm hover:underline truncate">{repo.name}</a>
                        {repo.fork && <span className="text-xs text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded">fork</span>}
                      </div>
                      <p className="text-xs text-gray-400 mb-2 truncate">{repo.description || 'No description'}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        {repo.language && <span className="text-blue-500">{repo.language}</span>}
                        <span>★ {repo.stargazers_count}</span>
                        <span>⑂ {repo.forks_count}</span>
                        <span>Updated {updatedDays === 0 ? 'today' : `${updatedDays}d ago`}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${healthClass}`}>Health {health}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}