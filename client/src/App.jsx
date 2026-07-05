import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { AuthProvider } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import FacultyRegisterPage from './pages/FacultyRegisterPage'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentEvents from './pages/student/StudentEvents'
import StudentProfile from './pages/student/StudentProfile'
import FacultyDashboard from './pages/faculty/FacultyDashboard'
import FacultyEvents from './pages/faculty/FacultyEvents'
import AdminDashboard from './pages/admin/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={`/${user.role}`} />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/student" />} />
      <Route path="/register/faculty" element={!user ? <FacultyRegisterPage /> : <Navigate to="/faculty" />} />

      <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/events" element={<ProtectedRoute role="student"><StudentEvents /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} />

      <Route path="/faculty" element={<ProtectedRoute role="faculty"><FacultyDashboard /></ProtectedRoute>} />
      <Route path="/faculty/events" element={<ProtectedRoute role="faculty"><FacultyEvents /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
