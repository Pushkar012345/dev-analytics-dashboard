'use client'
import dynamic from 'next/dynamic'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316']

function LanguageChart({ repos }: { repos: any[] }) {
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

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Top Languages</h2>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default LanguageChart