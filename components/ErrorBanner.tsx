'use client'
import { signOut } from 'next-auth/react'

interface ErrorBannerProps {
  error: Error | null
  onRetry?: () => void
}

export default function ErrorBanner({ error, onRetry }: ErrorBannerProps) {
  if (!error) return null

  const isAuthError = error.message.includes('token expired')
  const isRateLimit = error.message.includes('rate limit')

  return (
    <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 px-4 py-3 flex items-start gap-3 mb-5">
      <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="#ef4444" strokeWidth="1.5"/>
        <path d="M8 4.5v4M8 10.5v1" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-red-700 dark:text-red-400">
          {isRateLimit ? 'GitHub API rate limit reached' : isAuthError ? 'Session expired' : 'Something went wrong'}
        </p>
        <p className="text-xs text-red-600/80 dark:text-red-500/80 mt-0.5">{error.message}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isAuthError ? (
          <button
            onClick={() => signOut()}
            className="text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 px-2.5 py-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition"
          >
            Sign out
          </button>
        ) : onRetry ? (
          <button
            onClick={onRetry}
            className="text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 px-2.5 py-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition"
          >
            Retry
          </button>
        ) : null}
      </div>
    </div>
  )
}