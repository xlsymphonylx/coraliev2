import { Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ApplyMiddleware from './components/middlewares/ApplyMiddleware'
import { routes } from './routes'

function App() {
  return (
    <Layout>
      <Routes>
        {routes.map(({ path, element, middleware }) => (
          <Route
            key={path}
            path={path}
            element={ApplyMiddleware(element, middleware)}
          />
        ))}
      </Routes>
    </Layout>
  )
}

export default App
