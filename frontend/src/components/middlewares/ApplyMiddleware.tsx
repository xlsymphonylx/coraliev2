import type { ComponentType, ReactElement, ReactNode } from 'react'
import AdminMiddleware from '@/components/middlewares/AdminMiddleware'
import AuthMiddleware from '@/components/middlewares/AuthMiddleware'
import SkipLandingMiddleware from '@/components/middlewares/SkipLandingMiddleware'

type MiddlewareProps = {
  children: ReactNode
}

export type MiddlewareKey = 'auth' | 'admin' | 'skipLanding'

const middlewareMap: Record<MiddlewareKey, ComponentType<MiddlewareProps>> = {
  auth: AuthMiddleware,
  admin: AdminMiddleware,
  skipLanding: SkipLandingMiddleware,
}

function ApplyMiddleware(
  element: ReactElement,
  middleware: MiddlewareKey[] = [],
): ReactElement {
  return middleware.reduceRight((wrapped, key) => {
    const Guard = middlewareMap[key]

    return <Guard>{wrapped}</Guard>
  }, element)
}

export default ApplyMiddleware
