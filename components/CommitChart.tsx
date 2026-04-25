'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function CommitChart({ data }: { data: { month: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Repos Updated">
          {data.map((_, index) => (
            <Cell key={index} fill="#3b82f6" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}