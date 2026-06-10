import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { checkToken } from '@/api/client'

type AuthMiddlewareProps = {
  children: ReactNode
}

function AuthMiddleware({ children }: AuthMiddlewareProps) {
  return checkToken() ? children : <Navigate to="/login" replace />
}

export default AuthMiddleware
