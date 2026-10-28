import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
import { loadFonts } from './fonts'
import { PublishedContentProvider } from './context/ContentContext'

void loadFonts()

const Admin = lazy(() => import('./admin/Admin'))
const isAdmin = /^\/admin(?:\/|$)/.test(location.pathname)
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode>{isAdmin ? <Suspense fallback={<p className="admin-loading">Carregando o painel…</p>}><Admin/></Suspense> : <PublishedContentProvider><App/></PublishedContentProvider>}</React.StrictMode>)
