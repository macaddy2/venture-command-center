import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './lib/theme'
import { AuthProvider } from './lib/useAuth'
import { ToastProvider } from './components/Toast'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider>
            <AuthProvider>
                <ToastProvider>
                    <App />
                </ToastProvider>
            </AuthProvider>
        </ThemeProvider>
    </StrictMode>,
)
