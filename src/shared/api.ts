const API_URL = 'https://beergarage-back-production.up.railway.app'

const getToken = () => localStorage.getItem('token')

const handleUnauth = () => {
  localStorage.clear()
  window.location.href = '/admin/login'
}

const request = async (url: string, options: RequestInit = {}) => {
  const token = getToken()
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> || {}),
    },
  })
  if (res.status === 401) {
    handleUnauth()
    throw new Error('Unauthorized')
  }
  return res
}

export const api = {
  get:    (url: string)                   => request(url),
  post:   (url: string, body: object)     => request(url, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  (url: string, body: object)     => request(url, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (url: string)                   => request(url, { method: 'DELETE' }),
}
