import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { eventsAPI, registrationAPI } from '../../services/api'
import DashboardLayout from '../../components/DashboardLayout'
import EventCard from '../../components/EventCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Academic', 'Workshop', 'Seminar']

export default function StudentEvents() {
  const [events, setEvents] = useState([])
  const [registeredIds, setRegisteredIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [evRes, dashRes] = await Promise.all([
          eventsAPI.getAll(),
          registrationAPI.getStudentDashboard()
        ])
        setEvents(evRes.data)
        const ids = new Set(dashRes.data.registeredEventDetails?.map(e => e.id || e._id) || [])
        setRegisteredIds(ids)
      } catch {
        toast.error('Failed to load events')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const handleRegister = async (eventId) => {
    try {
      await registrationAPI.register(eventId)
      setRegisteredIds(prev => new Set([...prev, eventId]))
      toast.success('Successfully registered for the event! 🎉')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  }

  const filtered = events.filter((ev) => {
    const matchSearch = ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.department.toLowerCase().includes(search.toLowerCase()) ||
      ev.venue.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'All' || ev.category === category
    return matchSearch && matchCategory
  })

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text">Campus Events</h1>
          <p className="text-slate-400 mt-1">Browse and register for upcoming events</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search events, departments, venues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  category === cat
                    ? 'bg-violet-500/30 text-violet-300 border border-violet-500/30'
                    : 'glass text-slate-400 hover:text-slate-200 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            <p className="text-slate-500 text-sm mb-5">{filtered.length} event{filtered.length !== 1 ? 's' : ''} found</p>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((event) => {
                  const id = event.id || event._id
                  return (
                    <EventCard
                      key={id}
                      event={{ ...event, id }}
                      isRegistered={registeredIds.has(id)}
                      onRegister={handleRegister}
                      showRegisterBtn={true}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="glass p-12 rounded-2xl text-center">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-slate-400">No events found matching your search.</p>
              </div>
            )}
          </>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
