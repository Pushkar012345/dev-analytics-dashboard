'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'Repositories', href: '/dashboard/repos' },
  { label: 'Contributions', href: '/dashboard/contributions' },
  { label: 'Languages', href: '/dashboard/languages' },
  { label: 'Settings', href: '/dashboard/settings' },
]

export default function Sidebar({ username }: { username: string }) {
  const pathname = usePathname()

  return (
    <div className="w-48 bg-white border-r border-gray-200 min-h-screen flex flex-col py-4">
      <p className="text-xs font-medium text-gray-400 px-4 mb-2 tracking-wide">MENU</p>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-2 px-4 py-2 text-sm ${
            pathname === item.href
              ? 'bg-blue-50 text-blue-600 font-medium'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${pathname === item.href ? 'bg-blue-600' : 'bg-gray-300'}`}/>
          {item.label}
        </Link>
      ))}

      <div className="mt-auto px-4 pt-4 border-t border-gray-100 mx-4">
        <p className="text-xs font-medium text-gray-400 mb-1 tracking-wide">ACCOUNT</p>
        <p className="text-xs text-gray-500">@{username}</p>
        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1 inline-block">● Connected</span>
      </div>
    </div>
  )
}