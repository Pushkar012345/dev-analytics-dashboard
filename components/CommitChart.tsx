'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function CommitChart({ data }: { data: { month: string; count: number }[] }) {
  return (
    <div className="w-full overflow-hidden">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 24, left: -10, bottom: 0 }}>
          <XAxis dataKey="month" tick={{ fontSize: 11 }} interval={0} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
          <Tooltip />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Pushes" maxBarSize={40}>
            {data.map((_, index) => (
              <Cell key={index} fill="#3b82f6" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}