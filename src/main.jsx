import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import ClientApp           from './beergarage-client/App.jsx'
import AdminLogin          from './beergarage-admin/pages/AdminLogin.tsx'
import AdminReservations   from './beergarage-admin/pages/AdminReservations.tsx'
import AdminMap            from './beergarage-admin/pages/AdminMap.tsx'
import ProtectedRoute      from './beergarage-admin/components/ProtectedRoute.tsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* ── Admin ── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminReservations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/map"
          element={
            <ProtectedRoute>
              <AdminMap />
            </ProtectedRoute>
          }
        />

        {/* ── Client landing ── */}
        <Route path="/*" element={<ClientApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
