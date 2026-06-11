import { NavLink, useNavigate } from 'react-router-dom'

export default function AdminHeader() {
  const navigate = useNavigate()
  const name = localStorage.getItem('name') || ''
  const role = localStorage.getItem('role') || ''

  const logout = () => {
    localStorage.clear()
    navigate('/admin/login')
  }

  return (
    <header className="adm-header">
      <span className="adm-header__logo">Beer Garage Admin</span>

      <nav className="adm-header__nav">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) => `adm-header__link${isActive ? ' active' : ''}`}
        >
          Брони
        </NavLink>
        <NavLink
          to="/admin/map"
          className={({ isActive }) => `adm-header__link${isActive ? ' active' : ''}`}
        >
          Карта
        </NavLink>
      </nav>

      {name && (
        <span className="adm-header__user">
          {name}{role ? ` (${role})` : ''}
        </span>
      )}

      <button className="adm-header__logout" onClick={logout} type="button">
        Выход
      </button>
    </header>
  )
}
