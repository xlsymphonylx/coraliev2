import { useLocation } from 'react-router-dom'
import { Route, Routes } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import Layout from './components/layout/Layout'
import ApplyMiddleware from './components/middlewares/ApplyMiddleware'
import { routes } from './routes'

function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const Wrapper = isAdminRoute ? AdminLayout : Layout

  return (
    <Wrapper>
      <Routes>
        {routes.map(({ path, element, middleware }) => (
          <Route
            key={path}
            path={path}
            element={ApplyMiddleware(element, middleware)}
          />
        ))}
      </Routes>
    </Wrapper>
  )
}

export default App
