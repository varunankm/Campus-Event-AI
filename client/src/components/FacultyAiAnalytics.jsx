import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { aiAPI } from '../services/api'
import toast from 'react-hot-toast'
import {
  SparklesIcon, ChartBarIcon, CurrencyRupeeIcon,
  UsersIcon, ArrowPathIcon, PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'

function MarkdownText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
          : part.split('\n').map((line, j) => (
              <span key={`${i}-${j}`}>
                {line}
                {j < part.split('\n').length - 1 && <br />}
              </span>
            ))
      )}
    </span>
  )
}

// ── Analytics Tab ─────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [question, setQuestion] = useState('')
  const [asking, setAsking] = useState(false)

  const load = async (q = '') => {
    if (q) setAsking(true); else setLoading(true)
    try {
      const res = await aiAPI.facultyAnalytics({ question: q || '' })
      setData(res.data)
      if (q) setQuestion('')
    } catch {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
      setAsking(false)
    }
  }

  const colorMap = {
    violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    pink: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
  }

  return (
    <div className="p-5 space-y-5">
      {!data && !loading && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-slate-400 text-sm mb-4">
            Click to get AI-powered analytics on your events, budget & participation.
          </p>
          <button onClick={() => load()} className="btn-primary flex items-center gap-2 mx-auto py-2 px-5 text-sm">
            <ChartBarIcon className="w-4 h-4" /> Generate Report
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center py-10 gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
          <p className="text-slate-400 text-sm">Gemini is analyzing your events...</p>
        </div>
      )}

      {data && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Refresh */}
          <button onClick={() => load()} className="btn-secondary flex items-center gap-2 py-1.5 px-3 text-xs ml-auto">
            <ArrowPathIcon className="w-3.5 h-3.5" /> Refresh
          </button>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Events', value: data.summary.totalEvents, color: 'violet', icon: '📋' },
              { label: 'Participants', value: data.summary.totalParticipants, color: 'blue', icon: '👥' },
              { label: 'Total Budget', value: '₹' + Number(data.summary.totalBudget).toLocaleString(), color: 'cyan', icon: '💰' },
              {
                label: data.summary.netSurplus >= 0 ? 'Surplus' : 'Deficit',
                value: '₹' + Math.abs(Number(data.summary.netSurplus)).toLocaleString(),
                color: data.summary.netSurplus >= 0 ? 'green' : 'pink', icon: data.summary.netSurplus >= 0 ? '✅' : '⚠️'
              },
            ].map((s, i) => (
              <div key={i} className={`p-3 rounded-xl border text-center ${colorMap[s.color]}`}>
                <div className="text-xl mb-1">{s.icon}</div>
                <p className="text-base font-bold text-slate-100">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Per-event table */}
          {data.events.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">Event Breakdown</p>
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-xs min-w-[480px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      {['Event', 'Filled', 'Budget', 'Expense', '±'].map(h => (
                        <th key={h} className="text-left text-slate-500 px-3 py-2 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.events.map((ev, i) => (
                      <tr key={i} className="hover:bg-white/5">
                        <td className="px-3 py-2">
                          <p className="text-slate-200 font-medium truncate max-w-[100px]">{ev.title}</p>
                          <p className="text-slate-600">{ev.category}</p>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 bg-white/10 rounded-full h-1">
                              <div className={`h-1 rounded-full ${ev.fillRate >= 80 ? 'bg-green-400' : ev.fillRate >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                style={{ width: `${Math.min(ev.fillRate, 100)}%` }} />
                            </div>
                            <span className="text-slate-400">{ev.fillRate}%</span>
                          </div>
                          <p className="text-slate-500">{ev.participants}/{ev.maxParticipants}</p>
                        </td>
                        <td className="px-3 py-2 text-slate-300">₹{Number(ev.budgetEstimate).toLocaleString()}</td>
                        <td className="px-3 py-2 text-slate-300">₹{Number(ev.actualExpense).toLocaleString()}</td>
                        <td className={`px-3 py-2 font-semibold ${ev.surplus >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {ev.surplus >= 0 ? '+' : ''}₹{Number(ev.surplus).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AI Insight */}
          <div className="bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-violet-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <SparklesIcon className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-semibold text-violet-300">Gemini AI Insight</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              <MarkdownText text={data.aiInsight} />
            </p>
          </div>

          {/* Ask specific question */}
          <form onSubmit={e => { e.preventDefault(); if (question.trim()) load(question.trim()) }} className="flex gap-2">
            <input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Ask AI: Which event had best ROI?"
              className="input-field flex-1 text-sm py-2"
            />
            <button type="submit" disabled={asking || !question.trim()}
              className="btn-primary py-2 px-3 text-sm flex items-center gap-1 shrink-0">
              {asking ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <PaperAirplaneIcon className="w-4 h-4" />}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  )
}

// ── Chat Tab ──────────────────────────────────────────────────────────────
function ChatTab() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: '👋 Hi! I\'m your Faculty AI assistant.\n\nAsk me anything about your **event performance**, **budget**, **participation trends**, or get **improvement recommendations**.\n\nTry: **"Show budget report"** or **"Which event performed best?"**'
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')

    const updated = [...messages, { role: 'user', content: msg }]
    setMessages(updated)
    setLoading(true)

    try {
      const history = updated.slice(1, -1).slice(-8).map(m => ({ role: m.role, content: m.content }))
      const res = await aiAPI.facultyChat({ message: msg, history })
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.message }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const QUICK = ['Budget report', 'Participation stats', 'Best performing event', 'Give recommendations']

  return (
    <div className="flex flex-col" style={{ height: '480px' }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {messages.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xs shrink-0 mt-1 mr-2">✨</div>
            )}
            <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-gradient-to-br from-violet-600 to-blue-600 text-white rounded-tr-sm'
                : 'bg-white/8 text-slate-200 rounded-tl-sm border border-white/10'
            }`}>
              <MarkdownText text={m.content} />
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xs shrink-0 mt-1 mr-2">✨</div>
            <div className="bg-white/8 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1">
              {[0, 150, 300].map(d => (
                <span key={d} className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: d + 'ms' }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex gap-1.5 flex-wrap shrink-0">
          {QUICK.map(p => (
            <button key={p} onClick={() => send(p)} disabled={loading}
              className="text-xs px-2.5 py-1.5 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/20 transition-all">
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/10 focus-within:border-violet-500/40 px-3 py-2 transition-all">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Ask about your events, budget, participation..."
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none"
          />
          <button onClick={() => send()} disabled={!input.trim() || loading}
            className={`p-1.5 rounded-lg transition-all ${input.trim() && !loading ? 'bg-violet-600 hover:bg-violet-500 text-white' : 'text-slate-600 cursor-not-allowed'}`}>
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────
export default function FacultyAiAnalytics() {
  const [tab, setTab] = useState('chat')

  return (
    <div className="glass rounded-2xl overflow-hidden border border-violet-500/20">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-violet-600/20 to-blue-600/10 border-b border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0">
          <SparklesIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-slate-100 text-sm">Faculty AI Assistant</h3>
          <p className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
            Powered by Gemini
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {[
          { id: 'chat', label: 'AI Chat', icon: <ChatBubbleLeftRightIcon className="w-4 h-4" /> },
          { id: 'analytics', label: 'Analytics', icon: <ChartBarIcon className="w-4 h-4" /> },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all border-b-2 ${
              tab === t.id
                ? 'border-violet-500 text-violet-300 bg-violet-500/10'
                : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {tab === 'chat' ? <ChatTab /> : <AnalyticsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
