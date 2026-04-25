import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

export function useGithubUser() {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ['github-user'],
    queryFn: async () => {
      const res = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      })
      return res.json()
    },
    enabled: !!session?.accessToken,
  })
}

export function useGithubRepos() {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ['github-repos'],
    queryFn: async () => {
      const res = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      })
      return res.json()
    },
    enabled: !!session?.accessToken,
  })
}