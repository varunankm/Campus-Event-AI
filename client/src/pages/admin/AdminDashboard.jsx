import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { usersAPI, eventsAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import StatCard from '../../components/StatCard'
import LoadingSpinner from '../../components/LoadingSpinner'

const tabs = ['Overview', 'Students', 'Faculty', 'Events']

export default function AdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('Overview')
  const [students, setStudents] = useState([])
  const [faculty, setFaculty] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, fRes, eRes] = await Promise.all([
          usersAPI.getStudents(),
          usersAPI.getFaculty(),
          eventsAPI.getAll(),
        ])
        setStudents(sRes.data)
        setFaculty(fRes.data)
        setEvents(eRes.data)
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100">
            Admin <span className="gradient-text">Control Panel</span>
          </h1>
          <p className="text-slate-400 mt-1">Full system overview and management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="🎓" label="Total Students" value={students.length} color="violet" delay={0} />
          <StatCard icon="👨‍🏫" label="Faculty Members" value={faculty.length} color="blue" delay={0.1} />
          <StatCard icon="🎪" label="Total Events" value={events.length} color="cyan" delay={0.2} />
          <StatCard icon="✅" label="Active Events" value={events.filter(e => new Date(e.date) > new Date()).length} color="green" delay={0.3} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-violet-500/30 text-violet-300 border border-violet-500/30'
                  : 'glass text-slate-400 hover:text-slate-200'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            {activeTab === 'Overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass p-5 rounded-2xl">
                  <h3 className="font-bold text-slate-200 mb-4">Recent Students</h3>
                  <div className="space-y-3">
                    {students.slice(0, 5).map((s) => (
                      <UserRow key={s.id || s._id} user={s} role="student" />
                    ))}
                    {students.length === 0 && <p className="text-slate-500 text-sm">No students yet</p>}
                  </div>
                </div>
                <div className="glass p-5 rounded-2xl">
                  <h3 className="font-bold text-slate-200 mb-4">Recent Events</h3>
                  <div className="space-y-3">
                    {events.slice(0, 5).map((ev) => (
                      <div key={ev.id || ev._id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-sm">🎓</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-200 text-sm font-medium truncate">{ev.title}</p>
                          <p className="text-slate-500 text-xs">{ev.department} · {new Date(ev.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                    {events.length === 0 && <p className="text-slate-500 text-sm">No events yet</p>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Students' && (
              <UserTable data={students} columns={['Name', 'Email', 'Department', 'Joined']} role="student" />
            )}

            {activeTab === 'Faculty' && (
              <UserTable data={faculty} columns={['Name', 'Email', 'Department', 'Joined']} role="faculty" />
            )}

            {activeTab === 'Events' && (
              <div className="glass rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <p className="text-slate-400 text-sm">{events.length} total events</p>
                </div>
                <div className="divide-y divide-white/5">
                  {events.map((ev) => (
                    <div key={ev.id || ev._id} className="p-4 hover:bg-white/5 transition-all flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-200 truncate">{ev.title}</p>
                        <p className="text-slate-500 text-sm">{ev.department} · {ev.venue} · {new Date(ev.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2 shrink-0 flex-wrap">
                        <span className="badge bg-violet-500/20 text-violet-300">{ev.category}</span>
                        <span className={`badge ${new Date(ev.date) > new Date() ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-500'}`}>
                          {new Date(ev.date) > new Date() ? 'Upcoming' : 'Past'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {events.length === 0 && <p className="p-8 text-center text-slate-500">No events found</p>}
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </DashboardLayout>
  )
}

function UserRow({ user, role }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
        role === 'student' ? 'bg-violet-500/20 text-violet-400' : 'bg-blue-500/20 text-blue-400'
      }`}>
        {user.name?.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-200 text-sm font-medium truncate">{user.name}</p>
        <p className="text-slate-500 text-xs truncate">{user.department}</p>
      </div>
    </div>
  )
}

function UserTable({ data, columns, role }) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <p className="text-slate-400 text-sm">{data.length} {role}(s)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((col) => (
                <th key={col} className="text-left text-slate-500 font-medium px-4 py-3">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((row) => (
              <tr key={row.id || row._id} className="hover:bg-white/5 transition-all">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      role === 'student' ? 'bg-violet-500/20 text-violet-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>{row.name?.charAt(0).toUpperCase()}</div>
                    <span className="text-slate-200 font-medium">{row.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400">{row.email}</td>
                <td className="px-4 py-3 text-slate-400">{row.department}</td>
                <td className="px-4 py-3 text-slate-500">{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No records found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
