import { motion } from 'framer-motion'

export default function StatCard({ icon, label, value, color = 'violet', delay = 0 }) {
  const colors = {
    violet: 'from-violet-500/20 to-violet-600/10 border-violet-500/20 text-violet-400',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400',
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/20 text-cyan-400',
    green: 'from-green-500/20 to-green-600/10 border-green-500/20 text-green-400',
    pink: 'from-pink-500/20 to-pink-600/10 border-pink-500/20 text-pink-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5 backdrop-blur-xl`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <div className={`text-3xl font-bold ${colors[color].split(' ').pop()}`}>{value}</div>
      </div>
      <p className="text-slate-400 text-sm font-medium">{label}</p>
    </motion.div>
  )
}
