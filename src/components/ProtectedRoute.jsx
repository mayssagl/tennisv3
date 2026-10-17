import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from './ui/Loader'

// Guards a route. Optionally restrict to specific roles.
export default function ProtectedRoute({ children, roles }) {
  const { user, role, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loader full />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (roles && !roles.includes(role)) {
    // logged in but wrong role -> send to their own dashboard
    return <Navigate to={`/${role ?? 'player'}`} replace />
  }
  return children
}
