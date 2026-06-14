import { DashboardLayout } from "@/components/layout/DashboardLayout"
import AuthCallback from "@/pages/AuthCallback"
import Dashboard from "@/pages/Dashboard"
import LoginPage from "@/pages/Login"
import Notifications from "@/pages/Notifications"
import Bills from "@/pages/Bills"
import Events from "@/pages/EventsPage"
import Wishlist from "@/pages/Wishlist"
import Profile from "@/pages/Profile"
import { ProtectedRoute } from "@/routes/ProtectedRoute"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { ErrorMessage } from "./components/shared/ErrorMessage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/events" element={<Events />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/profile" element={<Profile />} />
            <Route
              path="/settings"
              element={<ErrorMessage message="A página de configurações ainda está em desenvolvimento." />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
