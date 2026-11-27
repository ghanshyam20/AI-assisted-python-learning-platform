import { useEffect, useState } from 'react'
import { Brain, Bug, Code2, Lightbulb, MessageCircle, Sparkles, Terminal, LoaderCircle } from 'lucide-react'
import './LessonAIAssistant.css'

type Action = 'explain' | 'tutor' | 'examples' | 'quiz' | 'explain_code' | 'debug'
const actions: { id: Action; title: string; description: string; icon: typeof Sparkles }[] = [
  { id: 'explain', title: 'Explain simply', description: 'Understand the concept', icon: Lightbulb },
  { id: 'tutor', title: 'Ask AI Tutor', description: 'Ask a lesson question', icon: MessageCircle },
  { id: 'examples', title: 'Generate examples', description: 'Explore more Python code', icon: Code2 },
  { id: 'quiz', title: 'Quiz me', description: 'Test your knowledge', icon: Brain },
  { id: 'explain_code', title: 'Explain my code', description: 'Understand every line', icon: Terminal },
  { id: 'debug', title: 'Debug with AI', description: 'Find and fix mistakes', icon: Bug },
]

function csrfToken() {
  const cookie = document.cookie.split('; ').find(item => item.startsWith('csrftoken='))
  return cookie ? decodeURIComponent(cookie.slice('csrftoken='.length)) : ''
}

export function LessonAIAssistant({ slug, pageId }: { slug: string; pageId?: number }) {
  const [action, setAction] = useState<Action>('explain')
  const [question, setQuestion] = useState('')
  const [code, setCode] = useState('')
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  useEffect(() => { setAnswer(''); setError(''); setQuestion(''); setCode('') }, [slug, pageId])

  async function run(selected: Action) {
    if (loading) return
    setAction(selected)
    setAnswer('')
    setError('')
    if (selected === 'tutor' && !question.trim()) { setError('Write your question first.'); return }
    if ((selected === 'debug' || selected === 'explain_code') && !code.trim()) { setError('Paste your Python code first.'); return }
    setLoading(true)
    try {
      const response = await fetch(`/api/learning/lessons/${encodeURIComponent(slug)}/ai/`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken() },
        body: JSON.stringify({ action: selected, ...(pageId ? { page_id: pageId } : {}), question, code }),
      })
      const data: { answer?: string; detail?: string; question?: string[]; code?: string[] } = await response.json()
      if (!response.ok) throw new Error(data.detail || data.question?.[0] || data.code?.[0] || `AI request failed (${response.status})`)
      setAnswer(data.answer || 'No answer returned.')
    } catch (err) { setError(err instanceof Error ? err.message : 'AI request failed.') }
    finally { setLoading(false) }
  }

  return <section className="pylearn-ai" aria-label="AI learning assistant">
    <div className="pylearn-ai__heading"><span className="pylearn-ai__symbol"><Sparkles size={20}/></span><div><h2>Learn with AI</h2><p>Personalized assistance for this lesson page</p></div></div>
    <div className="pylearn-ai__grid">{actions.map(item => {
      const Icon = item.icon
      return <button key={item.id} type="button" className={`pylearn-ai__action ${action === item.id ? 'is-active' : ''}`} onClick={() => { setAction(item.id); setAnswer(''); setError('') }} aria-pressed={action === item.id}>
        <Icon size={19}/><span><strong>{item.title}</strong><small>{item.description}</small></span>
      </button>
    })}</div>
    {action === 'tutor' && <label className="pylearn-ai__field">Your question<textarea value={question} onChange={event => setQuestion(event.target.value)} maxLength={2000} placeholder="What is confusing about this lesson?" rows={3}/></label>}
    {(action === 'explain_code' || action === 'debug') && <label className="pylearn-ai__field">Your Python code<textarea value={code} onChange={event => setCode(event.target.value)} maxLength={6000} placeholder={'name = "Python"\nprint(name)'} rows={7} spellCheck={false}/></label>}
    <button type="button" className="pylearn-ai__run" disabled={loading} onClick={() => void run(action)}>{loading ? <LoaderCircle size={16} className="pylearn-ai__spin"/> : <Sparkles size={16}/>} {loading ? 'Thinking...' : `Run ${actions.find(item => item.id === action)?.title}`}</button>
    {error && <p className="pylearn-ai__error" role="alert">{error}</p>}
    {answer && <div className="pylearn-ai__answer" role="status"><strong>AI response</strong><div>{answer}</div><small>AI can make mistakes. Run and verify code before relying on it.</small></div>}
  </section>
}
