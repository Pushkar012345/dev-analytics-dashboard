export async function getGithubUser(token: string) {
  const res = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function getGithubRepos(token: string) {
  const res = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}