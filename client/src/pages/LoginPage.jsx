import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import BackgroundEffects from '../components/BackgroundEffects'
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill in all fields')
    setLoading(true)
    try {
      const res = await authAPI.login(form)
      const { token, ...userData } = res.data
      login(userData, token)
      toast.success(`Welcome back, ${userData.name}!`)
      navigate(`/${userData.role}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const demoAccounts = [
    { label: 'Admin Demo', email: 'admin@campusconnect.edu', password: 'Admin@123', color: 'pink' },
    { label: 'Faculty Demo', email: 'faculty@campusconnect.edu', password: 'Faculty@123', color: 'blue' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <BackgroundEffects />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center font-bold">CC</div>
            <span className="font-bold text-xl gradient-text">CampusConnect</span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-100">Welcome back</h1>
          <p className="text-slate-400 mt-2">Sign in to your account</p>
        </div>

        <div className="glass p-8 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@university.edu"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In →'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-slate-500 text-xs text-center mb-3">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => setForm({ email: acc.email, password: acc.password })}
                  className={`text-xs py-2 px-3 rounded-lg border transition-all ${
                    acc.color === 'pink'
                      ? 'border-pink-500/30 text-pink-400 hover:bg-pink-500/10'
                      : 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10'
                  }`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-slate-400 text-sm mt-6">
            No account?{' '}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 font-semibold">
              Register as Student
            </Link>
            {' · '}
            <Link to="/register/faculty" className="text-blue-400 hover:text-blue-300 font-semibold">
              Register as Faculty
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
