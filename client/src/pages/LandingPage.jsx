import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { eventsAPI } from '../services/api'
import Navbar from '../components/Navbar'
import BackgroundEffects from '../components/BackgroundEffects'
import EventCard from '../components/EventCard'

const stats = [
  { value: '500+', label: 'Students Registered' },
  { value: '50+', label: 'Events Hosted' },
  { value: '20+', label: 'Departments' },
  { value: '98%', label: 'Satisfaction Rate' },
]

const features = [
  { icon: '🎯', title: 'Smart Registration', desc: 'Register for campus events in seconds with our streamlined process.' },
  { icon: '📅', title: 'Event Management', desc: 'Faculty can create, edit and manage events with full control.' },
  { icon: '🛡️', title: 'Role-Based Access', desc: 'Secure access for students, faculty, and administrators.' },
  { icon: '📊', title: 'Live Dashboard', desc: 'Real-time stats on registrations, participants, and upcoming events.' },
  { icon: '🔔', title: 'Instant Notifications', desc: 'Get notified about registrations and event updates instantly.' },
  { icon: '📱', title: 'Mobile Friendly', desc: 'Access everything from your phone, tablet, or desktop.' },
]

export default function LandingPage() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    eventsAPI.getAll().then((res) => setEvents(res.data.slice(0, 3))).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <BackgroundEffects />
      <Navbar variant="landing" />

      {/* Hero */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-violet-300 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Now live — CampusConnect AI v1.0
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Your Campus,{' '}
            <span className="gradient-text">Supercharged</span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            The modern event management platform for colleges. Discover, register, and manage campus events — all in one beautiful dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-base px-8 py-3.5">
              Get Started Free →
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3.5">
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Floating cards preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-16 w-full max-w-5xl mx-auto"
        >
          <div className="glass p-6 rounded-3xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="text-center p-4"
                >
                  <div className="text-3xl font-black gradient-text">{stat.value}</div>
                  <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">Everything You Need</h2>
            <p className="text-slate-400 text-lg">Powerful tools for students, faculty, and administrators</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass-hover p-6"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section id="events" className="relative z-10 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">Featured Events</h2>
            <p className="text-slate-400 text-lg">Discover what's happening on campus</p>
          </div>
          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id || event._id} event={{ ...event, id: event.id || event._id }} showRegisterBtn={false} />
              ))}
            </div>
          ) : (
            <div className="text-center glass p-12 rounded-2xl">
              <p className="text-4xl mb-4">🎓</p>
              <p className="text-slate-400">Events will appear here once added. <Link to="/register" className="text-violet-400 hover:underline">Register</Link> to see all events.</p>
            </div>
          )}
          <div className="text-center mt-10">
            <Link to="/register" className="btn-primary inline-block px-8 py-3">
              View All Events →
            </Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="relative z-10 py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">About CampusConnect AI</h2>
            <p className="text-slate-400 text-lg leading-relaxed mt-4">
              CampusConnect AI is a next-generation college event management platform designed to bridge the gap between students and campus activities. We empower students to discover events that match their interests, help faculty organize memorable experiences, and give administrators full visibility into campus life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="relative z-10 py-24 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">Get In Touch</h2>
            <p className="text-slate-400">Have questions? We'd love to hear from you.</p>
          </div>
          <div className="glass p-8 rounded-2xl">
            <div className="space-y-4">
              <input type="text" placeholder="Your Name" className="input-field" readOnly />
              <input type="email" placeholder="Your Email" className="input-field" readOnly />
              <textarea rows={4} placeholder="Your Message" className="input-field resize-none" readOnly />
              <button className="btn-primary w-full py-3">Send Message</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xs font-bold">CC</div>
            <span className="font-semibold gradient-text">CampusConnect AI</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 CampusConnect AI. Built for campus communities.</p>
          <div className="flex gap-4 text-slate-500 text-sm">
            <a href="#" className="hover:text-violet-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-violet-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-violet-400 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
