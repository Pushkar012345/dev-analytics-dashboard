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
    <div className="min-h-screen bg-gray-50">
      <Navbar session={session} />
      <div className="flex">
        <Sidebar username={user?.login || ''} />
        <div className="flex-1 p-6 max-w-2xl">

          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your preferences</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">GitHub Profile</h2>
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
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Account Stats</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Public Repos', value: user?.public_repos },
                { label: 'Followers', value: user?.followers },
                { label: 'Following', value: user?.following },
              ].map((s) => (
                <div key={s.label} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xl font-semibold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Preferences</h2>
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

          {/* Danger zone */}
          <div className="bg-white border border-red-100 rounded-xl p-5">
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