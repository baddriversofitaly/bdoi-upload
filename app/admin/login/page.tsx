'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      setErrorMessage('Email o password non corrette.')
      return
    }

    router.push('/admin')
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#1B4B93] border-4 border-white rounded-2xl shadow-xl p-6 space-y-4"
      >
        <h1 className="text-xl font-bold uppercase tracking-wide text-white">Accesso admin</h1>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-white/90 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md px-3 py-2 bg-white text-[#123769] focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-white/90 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md px-3 py-2 bg-white text-[#123769] focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>

        {errorMessage && (
          <p className="text-sm bg-white/95 text-red-700 rounded px-3 py-2 font-medium">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-[#1B4B93] rounded-full py-2.5 font-bold uppercase tracking-wide disabled:opacity-50"
        >
          {loading ? 'Accesso in corso...' : 'Accedi'}
        </button>
      </form>
    </main>
  )
}
