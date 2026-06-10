import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { checkAdminToken } from '@/api/client'

type AdminMiddlewareProps = {
  children: ReactNode
}

function AdminMiddleware({ children }: AdminMiddlewareProps) {
  return checkAdminToken() ? children : <Navigate to="/" replace />
}

export default AdminMiddleware
