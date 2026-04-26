'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useGithubUser } from '@/hooks/useGithubData'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const { data: user } = useGithubUser()
  const router = useRouter()
  const [defaultTab, setDefaultTab] = useState('overview')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    if (!user?.login) return
    async function loadPrefs() {
      if (!user?.login) return
      const { data } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('github_username', user.login)
        .single()
      if (data) setDefaultTab(data.default_tab || 'overview')
    }
    loadPrefs()
  }, [user?.login])

  async function savePreferences() {
    setSaving(true)
    await supabase.from('user_preferences').upsert({
      github_username: user?.login,
      default_tab: defaultTab,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'github_username' })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar session={session} />
      <div className="flex min-h-0">
        <Sidebar username={user?.login || ''} />
        <div className="flex-1 p-3 md:p-6 pb-24 md:pb-6 max-w-2xl">

          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your preferences</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">GitHub Profile</h2>
            <div className="flex items-center gap-4">
              <img src={user?.avatar_url} alt="avatar" className="w-14 h-14 rounded-full border-2 border-blue-100" />
              <div>
                <p className="font-medium text-gray-900">{user?.name || user?.login}</p>
                <p className="text-sm text-gray-500">@{user?.login}</p>
                <p className="text-xs text-gray-400 mt-0.5">{user?.location || 'No location set'} · Joined {new Date(user?.created_at).getFullYear()}</p>
              </div>
              <div className="ml-auto">
                <span className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full font-medium">● Connected</span>
              </div>
            </div>
          </div>

          {/* Stats summary */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Account Stats</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Public Repos', value: user?.public_repos },
                { label: 'Followers', value: user?.followers },
                { label: 'Following', value: user?.following },
              ].map((s) => (
                <div key={s.label} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xl font-semibold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1.5">Default Landing Page</label>
                <select
                  value={defaultTab}
                  onChange={(e) => setDefaultTab(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 w-full max-w-xs"
                >
                  <option value="overview">Overview</option>
                  <option value="repos">Repositories</option>
                  <option value="contributions">Contributions</option>
                  <option value="languages">Languages</option>
                </select>
              </div>
            </div>

            <button
              onClick={savePreferences}
              disabled={saving}
              className="mt-5 bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>

            {saved && (
              <p className="text-green-600 text-sm mt-2">✓ Preferences saved!</p>
            )}
          </div>

          {/* About / Developer Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/40 rounded-xl p-5 mb-4">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-base">🛠️</span>
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">About the Developer</h2>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">PP</div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Pushkar Pawar</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Full Stack Developer · Pune, India</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <a href="mailto:pushkarpawaroff@gmail.com"
                className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition group">
                <span className="w-6 h-6 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0 group-hover:border-red-200 transition">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                pushkarpawaroff@gmail.com
              </a>

              <a href="https://github.com/Pushkar012345" target="_blank"
                className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition group">
                <span className="w-6 h-6 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0 group-hover:border-gray-400 transition">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38l-.01-1.49c-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                </span>
                github.com/Pushkar012345
              </a>

              <a href="https://www.linkedin.com/in/pushkarpawar314/" target="_blank"
                className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition group">
                <span className="w-6 h-6 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0 group-hover:border-blue-200 transition">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </span>
                linkedin.com/in/pushkarpawar314
              </a>

              <a href="https://pushkar012345.github.io/" target="_blank"
                className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition group">
                <span className="w-6 h-6 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0 group-hover:border-indigo-200 transition">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </span>
                pushkar012345.github.io
              </a>
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-white dark:bg-gray-900 border border-red-100 dark:border-red-900/30 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-red-600 mb-2">Account</h2>
            <p className="text-xs text-gray-400 mb-4">Sign out of your GitHub account from DevDash.</p>
            <button
              onClick={() => signOut()}
              className="text-sm text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition"
            >
              Sign Out
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}