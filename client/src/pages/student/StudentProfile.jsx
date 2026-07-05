import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import { UserCircleIcon, EnvelopeIcon, BuildingLibraryIcon, ShieldCheckIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function StudentProfile() {
  const { user } = useAuth()

  const fields = [
    { icon: UserCircleIcon, label: 'Full Name', value: user?.name, color: 'text-violet-400' },
    { icon: EnvelopeIcon, label: 'Email Address', value: user?.email, color: 'text-blue-400' },
    { icon: BuildingLibraryIcon, label: 'Department', value: user?.department, color: 'text-cyan-400' },
    { icon: ShieldCheckIcon, label: 'Role', value: user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1), color: 'text-green-400' },
  ]

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text">My Profile</h1>
          <p className="text-slate-400 mt-1">Your account information</p>
        </div>

        {/* Avatar Card */}
        <div className="glass p-8 rounded-2xl mb-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-4xl font-bold mb-4">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-slate-100">{user?.name}</h2>
          <p className="text-slate-400 mt-1">{user?.department}</p>
          <span className="mt-3 badge bg-green-500/20 text-green-400 border border-green-500/20">
            ✓ Verified Student
          </span>
        </div>

        {/* Details */}
        <div className="glass p-6 rounded-2xl space-y-4">
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Account Details</h3>
          {fields.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
              <Icon className={`w-5 h-5 ${color} shrink-0`} />
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-slate-200 font-medium">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* AI Assistant Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 glass p-5 rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-500/10 to-blue-500/10"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-100 mb-1">AI Event Assistant</h3>
              <p className="text-slate-400 text-sm">
                Your personal AI can analyze your <span className="text-violet-400 font-medium">{user?.department}</span> profile,
                recommend matching campus events, and auto-register you — all in one chat.
              </p>
              <p className="text-slate-500 text-xs mt-2">
                💡 Click the <span className="text-violet-400">✨ glowing button</span> at the bottom-right to start chatting.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Info note */}
        <div className="mt-4 glass p-4 rounded-xl border border-white/10">
          <p className="text-slate-400 text-sm text-center">
            To update your profile details, please contact your department administrator.
          </p>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}
