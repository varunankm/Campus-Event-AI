import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { eventsAPI } from '../services/api'
import { XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from './LoadingSpinner'

export default function ParticipantsModal({ event, onClose }) {
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const id = event.id || event._id

  useEffect(() => {
    eventsAPI.getParticipants(id)
      .then((res) => setParticipants(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md glass rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Participants</h2>
            <p className="text-slate-400 text-sm">{event.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-all">
            <XMarkIcon className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            <div className="glass px-4 py-3 rounded-xl mb-4 flex items-center justify-between">
              <span className="text-slate-400 text-sm">Total Registered</span>
              <span className="font-bold text-violet-400">{participants.length} / {event.maxParticipants}</span>
            </div>
            {participants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">👥</p>
                <p className="text-slate-400">No participants yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {participants.map((p, i) => (
                  <div key={p.id || p._id || i} className="glass p-3 rounded-xl flex items-center gap-3">
                    <UserCircleIcon className="w-8 h-8 text-slate-500 shrink-0" />
                    <div>
                      <p className="text-slate-200 text-sm font-medium">Student ID: {p.studentId?.slice(-8)}</p>
                      <p className="text-slate-500 text-xs">Registered {new Date(p.registeredAt).toLocaleDateString()}</p>
                    </div>
                    <span className="ml-auto badge bg-green-500/20 text-green-400">Confirmed</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
