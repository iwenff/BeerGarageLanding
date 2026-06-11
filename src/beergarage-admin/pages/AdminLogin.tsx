import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import '../admin.css'

const API_URL = 'https://beergarage-back-production.up.railway.app'

export default function AdminLogin() {
  const [login, setLogin]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      })
      if (res.status === 401) {
        setError('Неверный логин или пароль')
        return
      }
      if (!res.ok) { setError('Ошибка сервера'); return }
      const { token, user } = await res.json()
      localStorage.setItem('token', token)
      localStorage.setItem('role', user.role)
      localStorage.setItem('name', user.name)
      navigate('/admin')
    } catch {
      setError('Не удалось подключиться к серверу')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-app">
      <div className="adm-login">
        <form className="adm-login__card" onSubmit={handleSubmit}>
          <p className="adm-login__logo">Beer Garage</p>
          <h1 className="adm-login__title">Вход в систему</h1>

          <label className="adm-login__field">
            <span>Логин</span>
            <input
              type="text"
              value={login}
              required
              autoFocus
              autoComplete="username"
              onChange={(e) => setLogin(e.target.value)}
            />
          </label>

          <label className="adm-login__field">
            <span>Пароль</span>
            <input
              type="password"
              value={password}
              required
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="adm-login__error">{error}</p>}

          <button className="adm-login__btn" type="submit" disabled={loading}>
            {loading ? 'Входим…' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )
}
