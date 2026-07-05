import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import BackgroundEffects from '../components/BackgroundEffects'
import {
  UserIcon, EnvelopeIcon, LockClosedIcon,
  BuildingLibraryIcon, AcademicCapIcon, IdentificationIcon,
} from '@heroicons/react/24/outline'

const departments = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Aerospace Engineering',
  'Chemical Engineering',
  'Biotechnology Engineering',
  'Industrial Engineering',
  'Automobile Engineering',
  'Petroleum Engineering',
  'Marine Engineering',
  'Mining Engineering',
  'Agricultural Engineering',
  'Environmental Engineering',
  'Textile Engineering',
  'Instrumentation Engineering',
  'Mathematics', 'Physics', 'Chemistry', 'Life Sciences',
  'Business Administration', 'Finance', 'Marketing',
  'Arts & Humanities', 'Architecture', 'Other'
]

const designations = [
  'Assistant Professor', 'Associate Professor', 'Professor',
  'Head of Department', 'Dean', 'Lecturer', 'Senior Lecturer',
  'Visiting Faculty', 'Research Fellow', 'Lab Instructor'
]

export default function FacultyRegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    department: '', designation: '', employeeId: '', specialization: '',
    experience: '', phone: '',
  })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Full name is required')
    if (!form.email.trim()) return toast.error('Email is required')
    if (!form.department) return toast.error('Please select your department')
    if (!form.designation) return toast.error('Please select your designation')
    if (!form.password || form.password.length < 6)
      return toast.error('Password must be at least 6 characters')
    if (form.password !== form.confirmPassword)
      return toast.error('Passwords do not match')

    setLoading(true)
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        department: form.department,
        role: 'faculty',
        // Pack faculty-specific info into achievements field
        achievements: [
          form.designation && `Designation: ${form.designation}`,
          form.employeeId && `Employee ID: ${form.employeeId}`,
          form.specialization && `Specialization: ${form.specialization}`,
          form.experience && `Experience: ${form.experience} years`,
          form.phone && `Phone: ${form.phone}`,
        ].filter(Boolean).join(' | '),
        skills: form.specialization ? [form.specialization] : [],
        interests: [],
        cgpa: 0,
        semester: '',
        rollNumber: form.employeeId || '',
        linkedIn: '',
        gitHub: '',
      }

      const res = await authAPI.registerFaculty(payload)
      const { token, ...userData } = res.data
      login(userData, token)
      toast.success(`Welcome, ${userData.name}! Faculty account created. 🎓`)
      navigate('/faculty')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.'
      toast.error(msg, { duration: 5000 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative">
      <BackgroundEffects />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-bold text-white">CC</div>
            <span className="font-bold text-xl gradient-text">CampusConnect</span>
          </Link>
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 px-4 py-1.5 rounded-full mb-3">
            <AcademicCapIcon className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">Faculty Registration</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Create Faculty Account</h1>
          <p className="text-slate-400 text-sm mt-1">Register to create and manage campus events</p>
        </div>

        <div className="glass p-6 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Personal Info */}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Personal Information</p>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Full Name *</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="Dr. John Smith" className="input-field pl-9 text-sm" required />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Email Address *</label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="faculty@university.edu" className="input-field pl-9 text-sm" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Password *</label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="password" name="password" value={form.password} onChange={handleChange}
                    placeholder="Min 6 chars" className="input-field pl-9 text-sm" required />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Confirm Password *</label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                    placeholder="Re-enter" className="input-field pl-9 text-sm" required />
                </div>
              </div>
            </div>

            {/* Academic Info */}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-1">Academic Details</p>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Department *</label>
              <div className="relative">
                <BuildingLibraryIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select name="department" value={form.department} onChange={handleChange}
                  className="input-field pl-9 text-sm appearance-none" required>
                  <option value="" style={{ backgroundColor: '#0f172a', color: '#94a3b8' }}>Select department</option>
                  {departments.map(d => (
                    <option key={d} value={d} style={{ backgroundColor: '#0f172a', color: '#e2e8f0' }}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Designation *</label>
              <div className="relative">
                <AcademicCapIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select name="designation" value={form.designation} onChange={handleChange}
                  className="input-field pl-9 text-sm appearance-none" required>
                  <option value="" style={{ backgroundColor: '#0f172a', color: '#94a3b8' }}>Select designation</option>
                  {designations.map(d => (
                    <option key={d} value={d} style={{ backgroundColor: '#0f172a', color: '#e2e8f0' }}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Employee ID</label>
                <div className="relative">
                  <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" name="employeeId" value={form.employeeId} onChange={handleChange}
                    placeholder="e.g. FAC001" className="input-field pl-9 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Experience (years)</label>
                <input type="number" name="experience" value={form.experience} onChange={handleChange}
                  placeholder="e.g. 5" min="0" max="50" className="input-field text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Specialization</label>
              <input type="text" name="specialization" value={form.specialization} onChange={handleChange}
                placeholder="e.g. Machine Learning, VLSI, Structural Engineering"
                className="input-field text-sm" />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                placeholder="e.g. +91 98765 43210" className="input-field text-sm" />
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm mt-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating Faculty Account...</>
                : <><AcademicCapIcon className="w-4 h-4" /> Create Faculty Account</>}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-white/10 space-y-2 text-center">
            <p className="text-slate-500 text-xs">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-400 hover:text-violet-300">Sign In</Link>
            </p>
            <p className="text-slate-500 text-xs">
              Registering as a student instead?{' '}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300">Student Registration</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
