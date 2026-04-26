'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useEffect, useState } from 'react'

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316']

function LanguageChart({ repos }: { repos: any[] }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const langMap: Record<string, number> = {}
  repos.forEach((repo) => {
    if (repo.language) {
      langMap[repo.language] = (langMap[repo.language] || 0) + 1
    }
  })

  const data = Object.entries(langMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  const total = data.reduce((acc, d) => acc + d.value, 0)

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Top Languages</h2>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={isMobile ? 70 : 80}
            dataKey="value"
            // No inline labels on mobile — they clip
            label={isMobile ? undefined : ({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            labelLine={!isMobile}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} repos`, 'Count']} />git 
        </PieChart>
      </ResponsiveContainer>

      {/* Mobile legend — shown only on mobile instead of inline labels */}
      {isMobile && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
          {data.map((entry, i) => (
            <div key={entry.name} className="flex items-center gap-1.5 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{entry.name}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto shrink-0">
                {Math.round((entry.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageChart