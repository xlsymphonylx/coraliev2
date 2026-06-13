import { LogOut, Settings, ShieldCheck, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { clearToken } from '@/api/client'
import "@/components/layout/styles/UserDropdown.scss"

type UserDropdownProps = {
  isAdmin: boolean
  username: string | null
}

function UserDropdown({ isAdmin, username }: UserDropdownProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearToken()
    navigate('/login', { replace: true })
  }

  return (
    <details className="user-dropdown">
      <summary className="user-dropdown__trigger">
        <User />
      </summary>
      <div className="user-dropdown__dropdown">
        <div className="user-dropdown__user-info">
          <h3 className="user-dropdown__user-info-username">{username ?? 'guest'}</h3>
          <p className="user-dropdown__user-info-role">
            {isAdmin ? 'Admin' : 'Member'}
          </p>
        </div>
        <div className="user-dropdown__options">
          {isAdmin ? (
            <button
              type="button"
              className="user-dropdown__options-item"
              onClick={() => navigate('/admin')}
            >
              <ShieldCheck size={16} />
              Admin
            </button>
          ) : null}
          <button
            type="button"
            className="user-dropdown__options-item"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </details>
  )
}

export default UserDropdown
