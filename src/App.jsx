import { HelmetProvider } from 'react-helmet-async'
import AppRouter from './routes/AppRouter'

function App() {
  return (
    <HelmetProvider>
      <AppRouter />
    </HelmetProvider>
  )
}

export default App