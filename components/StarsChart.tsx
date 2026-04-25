'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function StarsChart({ repos }: { repos: any[] }) {
  const data = repos
    .filter((r) => r.stargazers_count > 0)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6)
    .map((r) => ({
      name: r.name.length > 12 ? r.name.slice(0, 12) + '…' : r.name,
      stars: r.stargazers_count,
    }))

  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 h-[268px] flex items-center justify-center">
        <p className="text-gray-400 text-sm">No starred repos yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Stars per Repo</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="stars" radius={[4, 4, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill="#3b82f6" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default StarsChart