export async function getAccessToken(): Promise<string> {
  const clientId = process.env.AMADEUS_CLIENT_ID
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET

  const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId!,
      client_secret: clientSecret!,
    }),
  })

  const data = await response.json()

  if (!data.access_token) {
    throw new Error('Amadeus Token konnte nicht abgerufen werden')
  }

  return data.access_token
}
