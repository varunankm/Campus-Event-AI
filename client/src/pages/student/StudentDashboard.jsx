import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { registrationAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import StatCard from '../../components/StatCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import EventCard from '../../components/EventCard'
import AiChatbot from '../../components/AiChatbot'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = () => {
    registrationAPI.getStudentDashboard()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchDashboard() }, [])

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100">
            Hey, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-400 mt-1">{user?.department} · Student Dashboard</p>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Left: main content — 2 cols */}
            <div className="xl:col-span-2 space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon="🎪" label="Total Events" value={data?.totalEvents ?? 0} color="violet" delay={0} />
                <StatCard icon="✅" label="Registered" value={data?.registeredEvents ?? 0} color="blue" delay={0.1} />
                <StatCard icon="🚀" label="Upcoming" value={data?.upcomingEvents ?? 0} color="cyan" delay={0.2} />
                <StatCard icon="🏫" label="Department" value={user?.department?.split(' ')[0] ?? '—'} color="green" delay={0.3} />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/student/events" className="glass-hover p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-violet-500/20 flex items-center justify-center text-xl">🔍</div>
                  <div>
                    <h3 className="font-semibold text-slate-100">Browse Events</h3>
                    <p className="text-slate-400 text-sm">Discover and register for events</p>
                  </div>
                </Link>
                <Link to="/student/profile" className="glass-hover p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl">👤</div>
                  <div>
                    <h3 className="font-semibold text-slate-100">My Profile</h3>
                    <p className="text-slate-400 text-sm">View your account details</p>
                  </div>
                </Link>
              </div>

              {/* Registered Events */}
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-4">My Registered Events</h2>
                {data?.registeredEventDetails?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {data.registeredEventDetails.map((event) => (
                      <EventCard
                        key={event.id || event._id}
                        event={{ ...event, id: event.id || event._id }}
                        isRegistered={true}
                        showRegisterBtn={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="glass p-8 rounded-2xl text-center">
                    <p className="text-4xl mb-3">📭</p>
                    <p className="text-slate-400 mb-4">No registered events yet. Ask the AI assistant to find events for you!</p>
                    <Link to="/student/events" className="btn-primary inline-block px-6 py-2.5 text-sm">
                      Browse Events →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right: AI Chatbot panel — 1 col */}
            <div className="xl:col-span-1">
              <AiChatbot
                inline={true}
                onRegistered={fetchDashboard}
              />
            </div>

          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
