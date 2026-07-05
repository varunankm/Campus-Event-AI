import { motion } from 'framer-motion'
import { CalendarIcon, MapPinIcon, UserGroupIcon, TagIcon } from '@heroicons/react/24/outline'

const categoryColors = {
  Technical: 'bg-blue-500/20 text-blue-300',
  Cultural: 'bg-pink-500/20 text-pink-300',
  Sports: 'bg-green-500/20 text-green-300',
  Academic: 'bg-yellow-500/20 text-yellow-300',
  Workshop: 'bg-purple-500/20 text-purple-300',
  Seminar: 'bg-cyan-500/20 text-cyan-300',
}

export default function EventCard({ event, onRegister, isRegistered, showRegisterBtn = true }) {
  const deadline = new Date(event.registrationDeadline)
  const eventDate = new Date(event.date)
  const isDeadlinePassed = new Date() > deadline
  const categoryClass = categoryColors[event.category] || 'bg-violet-500/20 text-violet-300'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3 }}
      className="glass-hover p-5 flex flex-col gap-3 h-full"
    >
      {/* Poster */}
      {event.posterUrl ? (
        <div className="w-full h-40 rounded-xl overflow-hidden">
          <img
            src={event.posterUrl}
            alt={event.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </div>
      ) : (
        <div className="w-full h-40 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center">
          <span className="text-4xl">🎓</span>
        </div>
      )}

      {/* Category & Department */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`badge ${categoryClass}`}>
          {event.category}
        </span>
        <span className="badge bg-white/5 text-slate-400">
          {event.department}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-slate-100 leading-tight">{event.title}</h3>

      {/* Description */}
      <p className="text-slate-400 text-sm line-clamp-2 flex-1">{event.description}</p>

      {/* Details */}
      <div className="space-y-1.5 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-violet-400 shrink-0" />
          <span>{eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} · {event.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPinIcon className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="truncate">{event.venue}</span>
        </div>
        <div className="flex items-center gap-2">
          <UserGroupIcon className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Max {event.maxParticipants} participants</span>
        </div>
        <div className="flex items-center gap-2">
          <TagIcon className="w-4 h-4 text-pink-400 shrink-0" />
          <span>By {event.facultyName}</span>
        </div>
      </div>

      {/* Deadline */}
      <div className={`text-xs px-3 py-1.5 rounded-lg ${isDeadlinePassed ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
        {isDeadlinePassed ? '⚠ Registration closed' : `Deadline: ${deadline.toLocaleDateString()}`}
      </div>

      {/* QR Code */}
      {event.qrCodeUrl && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
          <img src={event.qrCodeUrl} alt="QR" className="w-10 h-10 rounded-lg bg-white p-0.5 object-contain shrink-0" />
          <p className="text-xs text-slate-400">Scan QR for payment / attendance</p>
        </div>
      )}

      {/* Register Button */}
      {showRegisterBtn && (
        <button
          onClick={() => onRegister && onRegister(event.id)}
          disabled={isRegistered || isDeadlinePassed}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
            isRegistered
              ? 'bg-green-500/20 text-green-400 cursor-default border border-green-500/30'
              : isDeadlinePassed
              ? 'bg-white/5 text-slate-500 cursor-not-allowed'
              : 'btn-primary'
          }`}
        >
          {isRegistered ? '✓ Registered' : 'Register Now'}
        </button>
      )}
    </motion.div>
  )
}
