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

        {/* Built by badge */}
        <div className="mx-3 mb-3 mt-3 px-3 py-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/40">
          <p className="text-[9px] font-semibold text-blue-400 dark:text-blue-500 tracking-widest uppercase mb-1">Built by</p>
          <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">Pushkar Pawar</p>
          <div className="flex items-center gap-2.5 mt-2">
            <a href="https://github.com/Pushkar012345" target="_blank" title="GitHub"
              className="text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38l-.01-1.49c-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/pushkarpawar314/" target="_blank" title="LinkedIn"
              className="text-gray-400 hover:text-blue-600 transition">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="https://pushkar012345.github.io/" target="_blank" title="Portfolio"
              className="text-gray-400 hover:text-indigo-600 transition">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </a>
            <a href="mailto:pushkarpawaroff@gmail.com" title="Email"
              className="text-gray-400 hover:text-red-500 transition">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav — hidden on desktop */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between px-1 py-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 flex-1 py-1 rounded-lg transition ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="text-[9px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}