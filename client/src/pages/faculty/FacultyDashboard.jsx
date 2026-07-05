import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { eventsAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import StatCard from '../../components/StatCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import FacultyAiAnalytics from '../../components/FacultyAiAnalytics'

export default function FacultyDashboard() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    eventsAPI.getMyEvents()
      .then((res) => setEvents(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const upcoming = events.filter(e => new Date(e.date) > new Date()).length
  const past = events.length - upcoming
  const totalBudget = events.reduce((s, e) => s + (e.budgetEstimate || 0), 0)
  const totalExpense = events.reduce((s, e) => s + (e.actualExpense || 0), 0)

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100">
            Hello, <span className="gradient-text">{user?.name?.split(' ').slice(-1)[0]}</span> 👋
          </h1>
          <p className="text-slate-400 mt-1">{user?.department} · Faculty Dashboard</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="📋" label="Total Events" value={events.length} color="violet" delay={0} />
          <StatCard icon="🚀" label="Upcoming" value={upcoming} color="blue" delay={0.1} />
          <StatCard icon="✅" label="Past Events" value={past} color="green" delay={0.2} />
          <StatCard icon="💰" label="Budget (₹)" value={totalBudget > 0 ? `₹${totalBudget.toLocaleString()}` : '—'} color="cyan" delay={0.3} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left: events list */}
          <div className="xl:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/faculty/events" className="glass-hover p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-violet-500/20 flex items-center justify-center text-xl">➕</div>
                <div>
                  <h3 className="font-semibold text-slate-100">Create Event</h3>
                  <p className="text-slate-400 text-sm">Add a new campus event</p>
                </div>
              </Link>
              <Link to="/faculty/events" className="glass-hover p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl">📋</div>
                <div>
                  <h3 className="font-semibold text-slate-100">Manage Events</h3>
                  <p className="text-slate-400 text-sm">Edit, delete and view participants</p>
                </div>
              </Link>
            </div>

            {/* Budget Overview */}
            {events.length > 0 && (
              <div className="glass rounded-2xl p-5">
                <h3 className="font-bold text-slate-200 mb-4">Budget Overview</h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <p className="text-lg font-bold text-blue-400">₹{totalBudget.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Total Budget</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <p className="text-lg font-bold text-violet-400">₹{totalExpense.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Total Expense</p>
                  </div>
                  <div className={`text-center p-3 rounded-xl border ${(totalBudget - totalExpense) >= 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                    <p className={`text-lg font-bold ${(totalBudget - totalExpense) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(totalBudget - totalExpense) >= 0 ? '+' : ''}₹{(totalBudget - totalExpense).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">{(totalBudget - totalExpense) >= 0 ? 'Surplus' : 'Deficit'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Events */}
            <div>
              <h2 className="text-xl font-bold text-slate-100 mb-4">Recent Events</h2>
              {loading ? <LoadingSpinner /> : events.length === 0 ? (
                <div className="glass p-8 rounded-2xl text-center">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-slate-400 mb-4">No events yet. Create your first one!</p>
                  <Link to="/faculty/events" className="btn-primary inline-block px-6 py-2.5 text-sm">Create First Event →</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.slice(0, 5).map((ev) => (
                    <div key={ev.id || ev._id} className="glass-hover p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {ev.posterUrl
                          ? <img src={ev.posterUrl} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" onError={e => e.target.style.display = 'none'} />
                          : <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/30 to-blue-500/30 flex items-center justify-center text-lg shrink-0">🎓</div>
                        }
                        <div>
                          <p className="font-semibold text-slate-200">{ev.title}</p>
                          <p className="text-sm text-slate-500">
                            {ev.venue} · {new Date(ev.date).toLocaleDateString()}
                            {ev.budgetEstimate > 0 && <span className="ml-2 text-cyan-500">₹{ev.budgetEstimate.toLocaleString()}</span>}
                          </p>
                        </div>
                      </div>
                      <span className={`badge shrink-0 ${new Date(ev.date) > new Date() ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}>
                        {new Date(ev.date) > new Date() ? 'Upcoming' : 'Past'}
                      </span>
                    </div>
                  ))}
                  {events.length > 5 && (
                    <Link to="/faculty/events" className="block text-center text-violet-400 text-sm hover:text-violet-300 pt-2">
                      View all {events.length} events →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: AI Analytics */}
          <div className="xl:col-span-1">
            <FacultyAiAnalytics />
          </div>

        </div>
      </motion.div>
    </DashboardLayout>
  )
}
