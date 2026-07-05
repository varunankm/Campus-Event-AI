import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { eventsAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import EventFormModal from '../../components/EventFormModal'
import ParticipantsModal from '../../components/ParticipantsModal'
import { PencilIcon, TrashIcon, UsersIcon, PlusIcon } from '@heroicons/react/24/outline'

export default function FacultyEvents() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editEvent, setEditEvent] = useState(null)
  const [participantsEvent, setParticipantsEvent] = useState(null)

  const fetchEvents = async () => {
    try {
      const res = await eventsAPI.getMyEvents()
      setEvents(res.data)
    } catch { toast.error('Failed to load events') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchEvents() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return
    try {
      await eventsAPI.delete(id)
      setEvents(events.filter(e => (e.id || e._id) !== id))
      toast.success('Event deleted')
    } catch { toast.error('Failed to delete event') }
  }

  const handleSaved = (saved, isEdit) => {
    if (isEdit) {
      setEvents(events.map(e => (e.id || e._id) === (saved.id || saved._id) ? saved : e))
    } else {
      setEvents([saved, ...events])
    }
    setShowForm(false)
    setEditEvent(null)
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">My Events</h1>
            <p className="text-slate-400 mt-1">Create and manage your campus events</p>
          </div>
          <button onClick={() => { setEditEvent(null); setShowForm(true) }} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-5 h-5" /> New Event
          </button>
        </div>

        {loading ? <LoadingSpinner /> : events.length === 0 ? (
          <div className="glass p-12 rounded-2xl text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-slate-400 mb-4">No events yet. Create your first one!</p>
            <button onClick={() => setShowForm(true)} className="btn-primary px-6 py-2.5 text-sm">Create Event →</button>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((ev) => {
              const id = ev.id || ev._id
              const isPast = new Date(ev.date) < new Date()
              return (
                <motion.div key={id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="glass-hover p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {ev.posterUrl ? (
                      <img src={ev.posterUrl} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0"
                        onError={(e) => { e.target.style.display = 'none' }} />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/30 to-blue-500/30 flex items-center justify-center text-2xl shrink-0">🎓</div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-100 truncate">{ev.title}</h3>
                      <p className="text-slate-400 text-sm truncate">{ev.venue} · {new Date(ev.date).toLocaleDateString()} · {ev.time}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="badge bg-violet-500/20 text-violet-300">{ev.category}</span>
                        <span className="badge bg-blue-500/20 text-blue-300">{ev.department}</span>
                        <span className={`badge ${isPast ? 'bg-slate-500/20 text-slate-400' : 'bg-green-500/20 text-green-400'}`}>
                          {isPast ? 'Past' : 'Upcoming'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setParticipantsEvent(ev)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10 text-sm transition-all">
                      <UsersIcon className="w-4 h-4" /> Participants
                    </button>
                    <button onClick={() => { setEditEvent(ev); setShowForm(true) }}
                      className="p-2 rounded-xl glass text-slate-300 hover:text-violet-400 hover:bg-violet-500/10 transition-all">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(id)}
                      className="p-2 rounded-xl glass text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <EventFormModal
            event={editEvent}
            onClose={() => { setShowForm(false); setEditEvent(null) }}
            onSaved={handleSaved}
            facultyName={user?.name || ''}
          />
        )}
        {participantsEvent && (
          <ParticipantsModal
            event={participantsEvent}
            onClose={() => setParticipantsEvent(null)}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
