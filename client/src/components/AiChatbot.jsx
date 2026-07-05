import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { aiAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  SparklesIcon,
  XMarkIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline'

const QUICK_PROMPTS = [
  'Show recommended events',
  'Find technical events',
  'What matches my profile?',
  'Register me for best match',
]

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

// Shared chat UI used in both modes
function ChatUI({ messages, loading, input, setInput, sendMessage, handleKey, inputRef, bottomRef, showQuickPrompts }) {
  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xs shrink-0 mt-1 mr-2">✨</div>
            )}
            <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-violet-600 to-blue-600 text-white rounded-tr-sm'
                : 'bg-white/8 text-slate-200 rounded-tl-sm border border-white/10'
            }`}>
              <MarkdownText text={msg.content} />
              {msg.registered && (
                <div className="mt-2 px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/20">
                  ✅ Auto-registered!
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xs shrink-0 mt-1 mr-2">✨</div>
            <div className="bg-white/8 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts — only when few messages */}
      {showQuickPrompts && messages.length <= 2 && (
        <div className="px-4 pb-2 flex gap-1.5 flex-wrap shrink-0">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              disabled={loading}
              className="text-xs px-2.5 py-1.5 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/20 transition-all"
            >
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
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask me to find events for you..."
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className={`p-1.5 rounded-lg transition-all ${
              input.trim() && !loading
                ? 'bg-violet-600 hover:bg-violet-500 text-white'
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-slate-600 text-xs mt-1.5">
          AI can auto-register you for matching events
        </p>
      </div>
    </div>
  )
}

export default function AiChatbot({ inline = false, onRegistered }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `👋 Hi ${user?.name?.split(' ')[0] || 'there'}! I'm your **CampusConnect AI**.\n\nI'll match events to your **${user?.department}** profile${user?.cgpa > 0 ? `, CGPA **${user.cgpa}**` : ''}${user?.skills?.length > 0 ? `, and skills like **${user.skills.slice(0, 2).join(', ')}**` : ''} and register you automatically.\n\nWhat are you looking for?`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if ((inline || open) && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [inline, open])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')

    const userMsg = { role: 'user', content: msg }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)

    try {
      const history = newMessages.slice(1).slice(-10).map(m => ({ role: m.role, content: m.content }))

      const res = await aiAPI.chat({
        message: msg,
        department: user?.department || '',
        cgpa: user?.cgpa || 0,
        skills: user?.skills || [],
        interests: user?.interests || [],
        history: history.slice(0, -1),
      })

      const aiReply = res.data
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: aiReply.message,
          registered: aiReply.registered,
          registeredTitle: aiReply.registeredEventTitle,
        },
      ])

      if (aiReply.registered && aiReply.registeredEventTitle) {
        toast.success(`🎉 Registered for "${aiReply.registeredEventTitle}"!`, { duration: 4000 })
        onRegistered?.()
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '⚠️ Something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const chatProps = { messages, loading, input, setInput, sendMessage, handleKey, inputRef, bottomRef, showQuickPrompts: true }

  // ── INLINE MODE (Student Dashboard) ─────────────────────────────────
  if (inline) {
    return (
      <div className="glass rounded-2xl border border-violet-500/20 overflow-hidden flex flex-col" style={{ height: '560px' }}>
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-violet-600/30 to-blue-600/20 border-b border-white/10 shrink-0 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
            <SparklesIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100">CampusConnect AI</p>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
              Smart Event Assistant
            </p>
          </div>
        </div>

        <ChatUI {...chatProps} />
      </div>
    )
  }

  // ── FLOATING MODE (Profile page) ─────────────────────────────────────
  return (
    <>
      {/* Trigger button */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 shadow-lg shadow-violet-500/40 flex items-center justify-center transition-all ${open ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <SparklesIcon className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-dark-900 animate-pulse" />
      </motion.button>

      {/* Floating panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 right-6 z-50 w-[370px] max-w-[calc(100vw-2rem)]"
            style={{ height: '560px' }}
          >
            <div className="flex flex-col h-full glass rounded-2xl border border-violet-500/20 shadow-2xl shadow-violet-500/20 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600/30 to-blue-600/20 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                    <SparklesIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-100">CampusConnect AI</p>
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                      Smart Event Assistant
                    </p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-all text-slate-400 hover:text-slate-200">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>

              <ChatUI {...chatProps} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
