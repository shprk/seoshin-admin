function base64Url(value: object): string {
  return btoa(JSON.stringify(value))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * Build an unsigned token shaped like the one the API issues. Only the payload
 * matters: nothing on the client verifies the signature.
 */
export function createAccessToken({
  expiresInSeconds,
  email = 'user@example.com',
}: {
  expiresInSeconds: number
  email?: string
}): string {
  const header = base64Url({ alg: 'HS256', typ: 'JWT' })
  const payload = base64Url({
    sub: 'ACC-1',
    email,
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  })

  return `${header}.${payload}.signature`
}
