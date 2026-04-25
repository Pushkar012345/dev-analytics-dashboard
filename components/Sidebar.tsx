'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: '⊞' },
  { label: 'Repos', href: '/dashboard/repos', icon: '⑂' },
  { label: 'Commits', href: '/dashboard/contributions', icon: '◈' },
  { label: 'Languages', href: '/dashboard/languages', icon: '◉' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙' },
]

export default function Sidebar({ username }: { username: string }) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Sidebar — hidden on mobile */}
      <div className="hidden md:flex w-48 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 min-h-screen flex-col py-4 shrink-0">
        <p className="text-xs font-medium text-gray-400 px-4 mb-2 tracking-wide">MENU</p>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-4 py-2 text-sm ${
              pathname === item.href
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${pathname === item.href ? 'bg-blue-600 dark:bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'}`} />
            {item.label}
          </Link>
        ))}

        <div className="mt-auto px-4 pt-4 border-t border-gray-100 dark:border-gray-700 mx-4">
          <p className="text-xs font-medium text-gray-400 mb-1 tracking-wide">ACCOUNT</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">@{username}</p>
          <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full mt-1 inline-block">● Connected</span>
        </div>
      </div>

      {/* Mobile Bottom Nav — hidden on desktop */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}