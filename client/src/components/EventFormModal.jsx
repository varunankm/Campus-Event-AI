import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { eventsAPI } from '../services/api'
import { XMarkIcon, QrCodeIcon, PhotoIcon } from '@heroicons/react/24/outline'

const categories = ['Technical', 'Cultural', 'Sports', 'Academic', 'Workshop', 'Seminar']
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
  'Arts & Humanities', 'Architecture',
  'All Departments'
]

const toInputDate = (d) => d ? new Date(d).toISOString().split('T')[0] : ''

// Convert image file to base64 data URL for preview/storage
const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = reject
  reader.readAsDataURL(file)
})

export default function EventFormModal({ event, onClose, onSaved, facultyName }) {
  const isEdit = !!event

  const [form, setForm] = useState({
    title: event?.title || '',
    description: event?.description || '',
    department: event?.department || '',
    category: event?.category || '',
    venue: event?.venue || '',
    date: toInputDate(event?.date),
    time: event?.time || '',
    registrationDeadline: toInputDate(event?.registrationDeadline),
    maxParticipants: event?.maxParticipants || 50,
    posterUrl: event?.posterUrl || '',
    qrCodeUrl: event?.qrCodeUrl || '',
    budgetEstimate: event?.budgetEstimate || 0,
    actualExpense: event?.actualExpense || 0,
    facultyName: event?.facultyName || facultyName || '',
  })
  const [loading, setLoading] = useState(false)
  const [posterPreview, setPosterPreview] = useState(event?.posterUrl || '')
  const [qrPreview, setQrPreview] = useState(event?.qrCodeUrl || '')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large. Max 2MB.')
      return
    }
    try {
      const dataUrl = await fileToDataUrl(file)
      setForm(prev => ({ ...prev, [field]: dataUrl }))
      if (field === 'posterUrl') setPosterPreview(dataUrl)
      if (field === 'qrCodeUrl') setQrPreview(dataUrl)
    } catch {
      toast.error('Failed to read file')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.date || !form.registrationDeadline || !form.category || !form.department)
      return toast.error('Please fill in all required fields')

    setLoading(true)
    try {
      const payload = {
        ...form,
        date: new Date(form.date).toISOString(),
        registrationDeadline: new Date(form.registrationDeadline).toISOString(),
        maxParticipants: parseInt(form.maxParticipants),
        budgetEstimate: parseFloat(form.budgetEstimate) || 0,
        actualExpense: parseFloat(form.actualExpense) || 0,
      }
      const res = isEdit
        ? await eventsAPI.update(event.id || event._id, payload)
        : await eventsAPI.create(payload)

      toast.success(isEdit ? 'Event updated!' : 'Event created!')
      onSaved(res.data, isEdit)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event')
    } finally {
      setLoading(false)
    }
  }

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
        className="w-full max-w-2xl glass rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold gradient-text">{isEdit ? 'Edit Event' : 'Create New Event'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-all">
            <XMarkIcon className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-400 mb-1">Title *</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="Event title" className="input-field" required />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-400 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                placeholder="Event description" className="input-field resize-none" rows={3} />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Department *</label>
              <select name="department" value={form.department} onChange={handleChange} className="input-field" required>
                <option value="" style={{backgroundColor:'#0f172a',color:'#94a3b8'}}>Select department</option>
                {departments.map(d => <option key={d} value={d} style={{backgroundColor:'#0f172a',color:'#e2e8f0'}}>{d}</option>)}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} className="input-field" required>
                <option value="" style={{backgroundColor:'#0f172a',color:'#94a3b8'}}>Select category</option>
                {categories.map(c => <option key={c} value={c} style={{backgroundColor:'#0f172a',color:'#e2e8f0'}}>{c}</option>)}
              </select>
            </div>

            {/* Venue */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Venue *</label>
              <input name="venue" value={form.venue} onChange={handleChange} placeholder="e.g. Auditorium A" className="input-field" required />
            </div>

            {/* Faculty Name */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Faculty Name</label>
              <input name="facultyName" value={form.facultyName} onChange={handleChange} placeholder="Organizer name" className="input-field" />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Event Date *</label>
              <input name="date" type="date" value={form.date} onChange={handleChange} className="input-field" required />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Event Time</label>
              <input name="time" type="time" value={form.time} onChange={handleChange} className="input-field" />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Registration Deadline *</label>
              <input name="registrationDeadline" type="date" value={form.registrationDeadline} onChange={handleChange} className="input-field" required />
            </div>

            {/* Max Participants */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Max Participants</label>
              <input name="maxParticipants" type="number" min={1} value={form.maxParticipants} onChange={handleChange} className="input-field" />
            </div>

            {/* Budget Estimate */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Budget Estimate (₹)</label>
              <input name="budgetEstimate" type="number" min={0} step="0.01" value={form.budgetEstimate}
                onChange={handleChange} placeholder="0.00" className="input-field" />
            </div>

            {/* Actual Expense */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Actual Expense (₹)</label>
              <input name="actualExpense" type="number" min={0} step="0.01" value={form.actualExpense}
                onChange={handleChange} placeholder="0.00" className="input-field" />
            </div>

            {/* Poster Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-400 mb-1">
                <PhotoIcon className="w-4 h-4 inline mr-1" />Event Poster
              </label>
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <label className="block w-full cursor-pointer">
                    <div className="input-field flex items-center gap-2 cursor-pointer hover:border-violet-500/40 transition-all">
                      <PhotoIcon className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-500 text-sm">Upload image or paste URL</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'posterUrl')} />
                  </label>
                  <input
                    name="posterUrl"
                    value={form.posterUrl.startsWith('data:') ? '' : form.posterUrl}
                    onChange={handleChange}
                    placeholder="Or paste image URL..."
                    className="input-field mt-2 text-sm"
                  />
                </div>
                {posterPreview && (
                  <div className="relative shrink-0">
                    <img src={posterPreview} alt="Poster" className="w-16 h-16 rounded-xl object-cover border border-white/10" />
                    <button type="button" onClick={() => { setPosterPreview(''); setForm(p => ({ ...p, posterUrl: '' })) }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <XMarkIcon className="w-2.5 h-2.5 text-white" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-400 mb-1">
                <QrCodeIcon className="w-4 h-4 inline mr-1" />QR Code (for registration/payment)
              </label>
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <label className="block w-full cursor-pointer">
                    <div className="input-field flex items-center gap-2 cursor-pointer hover:border-violet-500/40 transition-all">
                      <QrCodeIcon className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-500 text-sm">Upload QR code image</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'qrCodeUrl')} />
                  </label>
                  <input
                    name="qrCodeUrl"
                    value={form.qrCodeUrl.startsWith('data:') ? '' : form.qrCodeUrl}
                    onChange={handleChange}
                    placeholder="Or paste QR code URL..."
                    className="input-field mt-2 text-sm"
                  />
                </div>
                {qrPreview && (
                  <div className="relative shrink-0">
                    <img src={qrPreview} alt="QR Code" className="w-16 h-16 rounded-xl object-cover border border-white/10 bg-white p-1" />
                    <button type="button" onClick={() => { setQrPreview(''); setForm(p => ({ ...p, qrCodeUrl: '' })) }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <XMarkIcon className="w-2.5 h-2.5 text-white" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">Students will see this QR for payment/attendance scanning</p>
            </div>

          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : isEdit ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
