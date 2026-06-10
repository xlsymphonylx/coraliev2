import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { checkToken } from '@/api/client'

type SkipLandingMiddlewareProps = {
  children: ReactNode
}

function SkipLandingMiddleware({ children }: SkipLandingMiddlewareProps) {
  return checkToken() ? <Navigate to="/" replace /> : children
}

export default SkipLandingMiddleware
