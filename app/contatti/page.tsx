'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ContattiPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!emailRegex.test(email) || !message.trim()) return

    setStatus('sending')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })

      if (!res.ok) throw new Error('Invio fallito')

      setStatus('success')
      setName('')
      setEmail('')
      setMessage('')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-xl mx-auto">
        <Link href="/" className="text-white/80 hover:text-white text-sm mb-3 inline-block">
          ← Torna alla pagina di invio
        </Link>

        <div className="bg-[#1B4B93] border-4 border-white rounded-2xl shadow-xl p-6 md:p-8">
          <h1 className="text-white text-xl font-bold uppercase tracking-wide mb-1">Contattaci</h1>
          <p className="text-white/75 text-sm mb-5">
            Hai domande o dubbi? Scrivici, ti risponderemo il prima possibile.
          </p>

          {status === 'success' ? (
            <div className="text-center py-6">
              <p className="text-white font-semibold mb-4">
                Messaggio inviato! Ti risponderemo il prima possibile.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="bg-white text-[#1B4B93] font-bold uppercase text-sm tracking-wide px-5 py-2.5 rounded-full"
              >
                Invia un altro messaggio
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-white/90 mb-1">
                  Nome <span className="font-normal normal-case text-white/60">(facoltativo)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md px-3 py-2 bg-white text-[#123769] focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-white/90 mb-1">
                  Email <span className="font-normal normal-case text-white/60">(obbligatoria)</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md px-3 py-2 bg-white text-[#123769] focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-white/90 mb-1">
                  Messaggio
                </label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full rounded-md px-3 py-2 bg-white text-[#123769] focus:outline-none focus:ring-2 focus:ring-white resize-none"
                />
              </div>

              {status === 'error' && (
                <p className="text-sm bg-white/95 text-red-700 rounded px-3 py-2 font-medium">
                  Qualcosa è andato storto durante l&apos;invio. Riprova.
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-white text-[#1B4B93] rounded-full py-3 font-bold uppercase tracking-wide disabled:opacity-50"
              >
                {status === 'sending' ? 'Invio in corso...' : 'Invia messaggio'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
