import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { authAPI, eventsAPI, registrationAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import BackgroundEffects from '../components/BackgroundEffects'
import {
  UserIcon, EnvelopeIcon, LockClosedIcon, BuildingLibraryIcon,
  SparklesIcon, CalendarIcon, MapPinIcon, AcademicCapIcon,
  CodeBracketIcon, StarIcon, ChevronRightIcon, ChevronLeftIcon,
} from '@heroicons/react/24/outline'

const departments = [
  // Engineering
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
  // Science
  'Mathematics', 'Physics', 'Chemistry', 'Life Sciences',
  // Management
  'Business Administration', 'Finance', 'Marketing',
  // Arts
  'Arts & Humanities', 'Architecture', 'Other'
]

const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']

const skillOptions = [
  'Python', 'Java', 'C++', 'JavaScript', 'React', 'Machine Learning',
  'Data Science', 'Web Development', 'Android', 'iOS', 'UI/UX Design',
  'Cloud Computing', 'Cybersecurity', 'Robotics', 'IoT', 'Blockchain'
]

const interestOptions = [
  'Technical Events', 'Cultural Events', 'Sports', 'Academic Seminars',
  'Workshops', 'Hackathons', 'Research', 'Entrepreneurship',
  'Music', 'Arts & Crafts', 'Public Speaking', 'Leadership'
]

const STEPS = [
  { id: 1, label: 'Account', icon: UserIcon },
  { id: 2, label: 'Academic', icon: AcademicCapIcon },
  { id: 3, label: 'Profile', icon: StarIcon },
]

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    // Step 1
    name: '', email: '', password: '', department: '',
    // Step 2
    rollNumber: '', semester: '', cgpa: '',
    // Step 3
    skills: [], interests: [], achievements: '', linkedin: '', github: '',
  })
  const [loading, setLoading] = useState(false)
  const [pageStep, setPageStep] = useState('form') // 'form' | 'suggestions'
  const [suggestions, setSuggestions] = useState([])
  const [registering, setRegistering] = useState(null)
  const [registeredIds, setRegisteredIds] = useState(new Set())
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const toggleSkill = (s) => setForm(p => ({
    ...p, skills: p.skills.includes(s) ? p.skills.filter(x => x !== s) : [...p.skills, s]
  }))

  const toggleInterest = (i) => setForm(p => ({
    ...p, interests: p.interests.includes(i) ? p.interests.filter(x => x !== i) : [...p.interests, i]
  }))

  const validateStep = () => {
    if (step === 1) {
      if (!form.name.trim()) return toast.error('Please enter your full name') || false
      if (!form.email.trim()) return toast.error('Please enter your email') || false
      if (!form.department) return toast.error('Please select your department') || false
      if (!form.password || form.password.length < 6) return toast.error('Password must be at least 6 characters') || false
      return true
    }
    if (step === 2) {
      if (form.cgpa && (isNaN(form.cgpa) || parseFloat(form.cgpa) < 0 || parseFloat(form.cgpa) > 10))
        return toast.error('CGPA must be between 0 and 10') || false
      return true
    }
    return true
  }

  const nextStep = () => { if (validateStep()) setStep(s => s + 1) }
  const prevStep = () => setStep(s => s - 1)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        department: form.department,
        rollNumber: form.rollNumber,
        semester: form.semester,
        cgpa: parseFloat(form.cgpa) || 0,
        skills: form.skills,
        interests: form.interests,
        achievements: form.achievements,
        linkedIn: form.linkedin,
        gitHub: form.github,
      }

      const res = await authAPI.register(payload)
      const { token, ...userData } = res.data
      login(userData, token)
      toast.success(`Welcome to CampusConnect, ${userData.name}! 🎉`)

      // Navigate to student dashboard immediately — no blocking event fetch
      // Then try to show suggestions in background with a short timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 4000) // 4s max wait

      try {
        const evRes = await eventsAPI.getAll()
        clearTimeout(timeoutId)
        const now = new Date()
        const dept = userData.department || form.department
        const userSkills = form.skills || []
        const userInterests = form.interests || []

        const matched = evRes.data
          .filter(ev => new Date(ev.registrationDeadline) > now)
          .filter(ev =>
            ev.department === dept ||
            ev.department === 'All Departments' ||
            userSkills.some(s => ev.title.toLowerCase().includes(s.toLowerCase()) ||
              ev.category.toLowerCase().includes(s.toLowerCase())) ||
            userInterests.some(i => ev.category.toLowerCase().includes(i.toLowerCase().split(' ')[0]))
          )
          .slice(0, 4)

        if (matched.length > 0) {
          setSuggestions(matched)
          setPageStep('suggestions')
        } else {
          navigate('/student')
        }
      } catch {
        clearTimeout(timeoutId)
        // If event fetch fails or times out, just go to dashboard
        navigate('/student')
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.'
      toast.error(msg, { duration: 5000 })
      console.error('Registration error:', err.response?.status, msg)
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterEvent = async (eventId, eventTitle) => {
    setRegistering(eventId)
    try {
      await registrationAPI.register(eventId)
      setRegisteredIds(p => new Set([...p, eventId]))
      toast.success(`Registered for "${eventTitle}"! 🎉`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setRegistering(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative">
      <BackgroundEffects />

      <AnimatePresence mode="wait">

        {/* ── MULTI-STEP FORM ── */}
        {pageStep === 'form' && (
          <motion.div key="form" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
            className="w-full max-w-lg relative z-10">

            {/* Logo */}
            <div className="text-center mb-6">
              <Link to="/" className="inline-flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center font-bold">CC</div>
                <span className="font-bold text-xl gradient-text">CampusConnect</span>
              </Link>
              <h1 className="text-2xl font-bold text-slate-100">Create Student Account</h1>
              <p className="text-slate-400 text-sm mt-1">AI will match events to your profile</p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    step === s.id ? 'bg-violet-500/30 text-violet-300 border border-violet-500/40'
                    : step > s.id ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/5 text-slate-500 border border-white/10'
                  }`}>
                    <s.icon className="w-3 h-3" />
                    {s.label}
                  </div>
                  {i < STEPS.length - 1 && (
                    <ChevronRightIcon className={`w-4 h-4 ${step > s.id ? 'text-green-400' : 'text-slate-600'}`} />
                  )}
                </div>
              ))}
            </div>

            <div className="glass p-6 rounded-2xl">
              <AnimatePresence mode="wait">

                {/* Step 1: Account */}
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <p className="text-sm font-semibold text-slate-300 mb-3">👤 Basic Information</p>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Full Name *</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="text" name="name" value={form.name} onChange={handleChange}
                          placeholder="John Doe" className="input-field pl-9 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Email Address *</label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="email" name="email" value={form.email} onChange={handleChange}
                          placeholder="you@university.edu" className="input-field pl-9 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Department *</label>
                      <div className="relative">
                        <BuildingLibraryIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <select name="department" value={form.department} onChange={handleChange}
                          className="input-field pl-9 text-sm appearance-none" required>
                          <option value="" disabled style={{backgroundColor:'#0f172a',color:'#94a3b8'}}>Select department</option>
                          {departments.map(d => (
                            <option key={d} value={d} style={{backgroundColor:'#0f172a',color:'#e2e8f0'}}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Password *</label>
                      <div className="relative">
                        <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="password" name="password" value={form.password} onChange={handleChange}
                          placeholder="Min 6 characters" className="input-field pl-9 text-sm" />
                      </div>
                    </div>
                    <button onClick={nextStep} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm mt-2">
                      Next: Academic Details <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                {/* Step 2: Academic */}
                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <p className="text-sm font-semibold text-slate-300 mb-3">🎓 Academic Background</p>
                    <p className="text-xs text-slate-500 mb-3">Optional — helps AI suggest better events</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Roll Number</label>
                        <input type="text" name="rollNumber" value={form.rollNumber} onChange={handleChange}
                          placeholder="e.g. CS2021001" className="input-field text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Current Semester</label>
                        <select name="semester" value={form.semester} onChange={handleChange}
                          className="input-field text-sm appearance-none">
                          <option value="" style={{backgroundColor:'#0f172a',color:'#94a3b8'}}>Select (optional)</option>
                          {semesters.map(s => (
                            <option key={s} value={s} style={{backgroundColor:'#0f172a',color:'#e2e8f0'}}>{s} Semester</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        CGPA <span className="text-slate-600">(0.0 – 10.0)</span>
                      </label>
                      <div className="relative">
                        <AcademicCapIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="number" name="cgpa" value={form.cgpa} onChange={handleChange}
                          step="0.01" min="0" max="10" placeholder="e.g. 8.5"
                          className="input-field pl-9 text-sm" />
                      </div>
                      {form.cgpa > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Academic Standing</span>
                            <span className={parseFloat(form.cgpa) >= 8.5 ? 'text-green-400' : parseFloat(form.cgpa) >= 7 ? 'text-yellow-400' : 'text-orange-400'}>
                              {parseFloat(form.cgpa) >= 9 ? '🏆 Outstanding' : parseFloat(form.cgpa) >= 8 ? '⭐ Excellent' : parseFloat(form.cgpa) >= 7 ? '✅ Good' : parseFloat(form.cgpa) >= 6 ? '📈 Average' : '📚 Needs Improvement'}
                            </span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full transition-all ${parseFloat(form.cgpa) >= 8.5 ? 'bg-green-400' : parseFloat(form.cgpa) >= 7 ? 'bg-yellow-400' : 'bg-orange-400'}`}
                              style={{ width: `${Math.min(parseFloat(form.cgpa) / 10 * 100, 100)}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Achievements / Awards</label>
                      <textarea name="achievements" value={form.achievements} onChange={handleChange}
                        rows={2} placeholder="e.g. 1st place in state hackathon, Published research paper..."
                        className="input-field text-sm resize-none" />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={prevStep} className="btn-secondary flex-1 py-2.5 flex items-center justify-center gap-2 text-sm">
                        <ChevronLeftIcon className="w-4 h-4" /> Back
                      </button>
                      <button onClick={nextStep} className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2 text-sm">
                        Next: Skills <ChevronRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Skills & Interests */}
                {step === 3 && (
                  <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <p className="text-sm font-semibold text-slate-300">⚡ Skills & Interests</p>
                      <p className="text-xs text-slate-500">AI uses these to recommend the best events for you (optional)</p>

                      {/* Skills */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-2">
                          Technical Skills <span className="text-slate-600">({form.skills.length} selected)</span>
                        </label>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                          {skillOptions.map(s => (
                            <button type="button" key={s} onClick={() => toggleSkill(s)}
                              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                                form.skills.includes(s)
                                  ? 'bg-violet-500/30 text-violet-300 border-violet-500/40'
                                  : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
                              }`}>
                              {form.skills.includes(s) ? '✓ ' : ''}{s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Interests */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-2">
                          Event Interests <span className="text-slate-600">({form.interests.length} selected)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {interestOptions.map(i => (
                            <button type="button" key={i} onClick={() => toggleInterest(i)}
                              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                                form.interests.includes(i)
                                  ? 'bg-blue-500/30 text-blue-300 border-blue-500/40'
                                  : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
                              }`}>
                              {form.interests.includes(i) ? '✓ ' : ''}{i}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Social Links */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">LinkedIn URL</label>
                          <input type="url" name="linkedin" value={form.linkedin} onChange={handleChange}
                            placeholder="linkedin.com/in/..." className="input-field text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">GitHub URL</label>
                          <input type="url" name="github" value={form.github} onChange={handleChange}
                            placeholder="github.com/..." className="input-field text-sm" />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-1">
                        <button type="button" onClick={prevStep}
                          className="btn-secondary flex-1 py-2.5 flex items-center justify-center gap-2 text-sm">
                          <ChevronLeftIcon className="w-4 h-4" /> Back
                        </button>
                        <button type="submit" disabled={loading}
                          className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2 text-sm">
                          {loading
                            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
                            : <><SparklesIcon className="w-4 h-4" /> Create Account</>}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-center text-slate-500 text-xs mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-400 hover:text-violet-300">Sign In</Link>
            </p>
          </motion.div>
        )}

        {/* ── AI EVENT SUGGESTIONS ── */}
        {pageStep === 'suggestions' && (
          <motion.div key="suggestions" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
            className="w-full max-w-2xl relative z-10">

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }} className="text-center mb-8">
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-violet-300 mb-4">
                <SparklesIcon className="w-4 h-4" /> AI-Matched Events
              </div>
              <h2 className="text-3xl font-bold text-slate-100">
                Welcome, <span className="gradient-text">{form.name.split(' ')[0]}</span>! 🎉
              </h2>
              <p className="text-slate-400 mt-2 text-sm">
                Based on your <span className="text-violet-400 font-semibold">{form.department}</span> profile,
                CGPA <span className="text-cyan-400 font-semibold">{form.cgpa}</span>, and
                skills <span className="text-blue-400 font-semibold">{form.skills.slice(0, 2).join(', ')}{form.skills.length > 2 ? '...' : ''}</span>:
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {suggestions.map((ev, i) => {
                const id = ev.id || ev._id
                const isReg = registeredIds.has(id)
                return (
                  <motion.div key={id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.1 }} className="glass-hover p-4 flex flex-col gap-3">
                    {ev.posterUrl && (
                      <img src={ev.posterUrl} alt="" className="w-full h-28 rounded-xl object-cover"
                        onError={e => e.target.style.display = 'none'} />
                    )}
                    <div className="flex gap-2 flex-wrap">
                      <span className="badge bg-violet-500/20 text-violet-300">{ev.category}</span>
                      <span className="badge bg-blue-500/20 text-blue-300">{ev.department}</span>
                    </div>
                    <h3 className="font-bold text-slate-100 leading-tight">{ev.title}</h3>
                    <div className="space-y-1 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-violet-400" />
                        {new Date(ev.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPinIcon className="w-3.5 h-3.5 text-blue-400" />
                        {ev.venue}
                      </div>
                    </div>
                    <button onClick={() => !isReg && handleRegisterEvent(id, ev.title)}
                      disabled={isReg || registering === id}
                      className={`w-full py-2 rounded-xl text-sm font-semibold transition-all ${
                        isReg ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : registering === id ? 'btn-secondary opacity-60' : 'btn-primary'
                      }`}>
                      {isReg ? '✓ Registered!' : registering === id ? 'Registering...' : 'Register Now'}
                    </button>
                  </motion.div>
                )
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate('/student')} className="btn-primary flex-1 py-3 text-center">
                Go to Dashboard →
              </button>
              <Link to="/student/events" className="btn-secondary flex-1 py-3 text-center">
                Browse All Events
              </Link>
            </div>
            <p className="text-center text-slate-500 text-xs mt-3">
              Your AI assistant on the dashboard can register you for more events anytime
            </p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
