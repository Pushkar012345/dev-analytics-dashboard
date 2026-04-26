// GitHub REST API types

export interface GithubUser {
  login: string
  id: number
  avatar_url: string
  html_url: string
  name: string | null
  location: string | null
  bio: string | null
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
}

export interface GithubRepo {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  fork: boolean
  language: string | null
  stargazers_count: number
  forks_count: number
  watchers_count: number
  open_issues_count: number
  created_at: string
  updated_at: string
  pushed_at: string
  topics: string[]
  visibility: string
}

export interface GithubEvent {
  id: string
  type: string
  repo: { id: number; name: string; url: string }
  payload: {
    ref?: string
    commits?: { sha: string; message: string; author: { name: string } }[]
    size?: number
  }
  created_at: string
}

// GitHub GraphQL contribution types

export interface ContributionDay {
  date: string
  contributionCount: number
  weekday: number
}

export interface ContributionWeek {
  contributionDays: ContributionDay[]
}

export interface ContributionCalendar {
  totalContributions: number
  weeks: ContributionWeek[]
}

// Processed/derived types used in the app

export interface MonthlyContribution {
  month: string
  count: number
}

export interface RecentPush {
  repo: string
  repoUrl: string
  branch: string
  message: string
  date: string
}

export interface ContributionData {
  monthlyData: MonthlyContribution[]
  dayCount: Record<string, number>
  dayOrder: string[]
  recentPushes: RecentPush[]
  totalContributions: number
  totalCommits: number
  streak: number
}