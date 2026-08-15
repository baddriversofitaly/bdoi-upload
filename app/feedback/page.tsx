'use client'

import { useState } from 'react'
import Link from 'next/link'
import SocialIcons from '../components/SocialIcons'

const MAX_SCREENSHOT_MB = 8

export default function FeedbackPage() {
  const [type, setType] = useState<'suggerimento' | 'bug' | 'altro'>('bug')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!description.trim()) {
      setErrorMessage('Descrivi il consiglio o il problema riscontrato.')
      return
    }
    if (screenshot && screenshot.size > MAX_SCREENSHOT_MB * 1024 * 1024) {
      setErrorMessage(`Lo screenshot supera il limite di ${MAX_SCREENSHOT_MB}MB.`)
      return
    }

    setStatus('sending')

    try {
      const formData = new FormData()
      formData.append('type', type)
      formData.append('description', description)
      formData.append('email', email)
      if (screenshot) formData.append('screenshot', screenshot)

      const res = await fetch('/api/feedback', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Invio fallito')

      setStatus('success')
      setDescription('')
      setEmail('')
      setScreenshot(null)
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-xl mx-auto">
        <Link href="/" className="text-white bg-white/15 hover:bg-white/25 text-sm font-semibold inline-flex items-center gap-1 rounded-full px-3 py-1.5 transition mb-3">
          ← Torna alla pagina di invio
        </Link>

        <div className="bg-[#1B4B93] border-4 border-white rounded-2xl shadow-xl p-6 md:p-8">
          <h1 className="text-white text-xl font-bold uppercase tracking-wide mb-1">
            Consigli e segnalazioni
          </h1>
          <p className="text-white/75 text-sm mb-5">
            Hai un&apos;idea per migliorare il sito, o hai trovato un problema? Raccontacelo qui
            sotto, puoi anche allegare uno screenshot.
          </p>

          {status === 'success' ? (
            <div className="text-center py-6">
              <p className="text-white font-semibold mb-4">
                Segnalazione inviata, grazie del contributo!
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="bg-white text-[#1B4B93] font-bold uppercase text-sm tracking-wide px-5 py-2.5 rounded-full"
              >
                Invia un&apos;altra segnalazione
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-white/90 mb-1">
                  Tipo di segnalazione
                </label>
                <div className="flex gap-2">
                  {(
                    [
                      { value: 'bug', label: 'Bug / malfunzionamento' },
                      { value: 'suggerimento', label: 'Suggerimento' },
                      { value: 'altro', label: 'Altro' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setType(opt.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                        type === opt.value
                          ? 'bg-white text-[#1B4B93] border-white'
                          : 'bg-white/10 text-white border-white/40'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-white/90 mb-1">
                  Descrizione
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Descrivi cosa hai notato, con più dettagli possibile (es. cosa stavi facendo, cosa ti aspettavi, cosa è successo)."
                  className="w-full rounded-md px-3 py-2 bg-white text-[#123769] focus:outline-none focus:ring-2 focus:ring-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-white/90 mb-1">
                  Email <span className="font-normal normal-case text-white/60">(facoltativa, se vuoi una risposta)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md px-3 py-2 bg-white text-[#123769] focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-white/90 mb-1">
                  Screenshot <span className="font-normal normal-case text-white/60">(facoltativo)</span>
                </label>
                <label className="flex items-center justify-center w-full rounded-md border-2 border-dashed border-white/60 bg-white/10 text-white text-sm py-4 cursor-pointer hover:bg-white/15 transition text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                  {screenshot ? screenshot.name : `Allega un'immagine (max ${MAX_SCREENSHOT_MB}MB)`}
                </label>
              </div>

              {errorMessage && (
                <p className="text-sm bg-white/95 text-red-700 rounded px-3 py-2 font-medium">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-white text-[#1B4B93] rounded-full py-3 font-bold uppercase tracking-wide disabled:opacity-50"
              >
                {status === 'sending' ? 'Invio in corso...' : 'Invia segnalazione'}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6">
          <p className="text-center text-xs text-white/70 mb-2">Seguici su</p>
          <SocialIcons />
        </div>
      </div>
    </main>
  )
}
