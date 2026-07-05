import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#events', label: 'Events' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
]

export default function Navbar({ variant = 'landing' }) {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const dashboardLinks = {
    student: [
      { to: '/student', label: 'Dashboard' },
      { to: '/student/events', label: 'Events' },
      { to: '/student/profile', label: 'Profile' },
    ],
    faculty: [
      { to: '/faculty', label: 'Dashboard' },
      { to: '/faculty/events', label: 'My Events' },
    ],
    admin: [
      { to: '/admin', label: 'Admin Panel' },
    ],
  }

  const links = user ? (dashboardLinks[user.role] || []) : []

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3"
    >
      <div className="max-w-7xl mx-auto glass px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-sm font-bold">
            CC
          </div>
          <span className="font-bold text-lg gradient-text">CampusConnect</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {variant === 'landing' && !user && navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-slate-400 hover:text-slate-100 px-3 py-2 rounded-lg hover:bg-white/5 text-sm font-medium transition-all"
            >
              {link.label}
            </a>
          ))}
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === link.to
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-200">{user.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
              <button onClick={handleLogout} className="btn-secondary flex items-center gap-2 py-2 px-4">
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-secondary py-2 px-5 text-sm">Login</Link>
              <Link to="/register" className="btn-primary py-2 px-5 text-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 rounded-lg glass" onClick={() => setOpen(!open)}>
          {open ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mt-2 max-w-7xl mx-auto glass p-4 flex flex-col gap-2"
          >
            {variant === 'landing' && !user && navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-100 px-3 py-2 rounded-lg hover:bg-white/5 text-sm">
                {link.label}
              </a>
            ))}
            {links.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-100 px-3 py-2 rounded-lg hover:bg-white/5 text-sm">
                {link.label}
              </Link>
            ))}
            {user ? (
              <button onClick={() => { handleLogout(); setOpen(false) }}
                className="btn-secondary text-sm mt-2 flex items-center gap-2 justify-center">
                <ArrowRightOnRectangleIcon className="w-4 h-4" /> Logout
              </button>
            ) : (
              <div className="flex gap-2 mt-2">
                <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary flex-1 text-center text-sm py-2">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary flex-1 text-center text-sm py-2">Register</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
