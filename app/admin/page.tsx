'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

type Counts = {
  total: number
  da_valutare: number
  da_scaricare: number
  scaricati: number
  scartate: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [counts, setCounts] = useState<Counts | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/admin/login')
      } else {
        setCheckingSession(false)
      }
    })
  }, [router])

  useEffect(() => {
    if (checkingSession) return

    const loadCounts = async () => {
      // head: true -> nessun dato scaricato, solo il conteggio: costo quasi nullo
      const [total, daValutare, daScaricare, scaricati, scartate] = await Promise.all([
        supabase.from('video_submissions').select('*', { count: 'exact', head: true }),
        supabase.from('video_submissions').select('*', { count: 'exact', head: true }).eq('status', 'da_valutare'),
        supabase.from('video_submissions').select('*', { count: 'exact', head: true }).eq('status', 'da_scaricare'),
        supabase.from('video_submissions').select('*', { count: 'exact', head: true }).eq('status', 'scaricati'),
        supabase.from('video_submissions').select('*', { count: 'exact', head: true }).eq('status', 'scartate'),
      ])

      setCounts({
        total: total.count ?? 0,
        da_valutare: daValutare.count ?? 0,
        da_scaricare: daScaricare.count ?? 0,
        scaricati: scaricati.count ?? 0,
        scartate: scartate.count ?? 0,
      })
    }

    loadCounts()
  }, [checkingSession])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (checkingSession || !counts) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Caricamento...</p>
      </main>
    )
  }

  const cards: { label: string; value: number; tab: string; color: string }[] = [
    { label: 'Da valutare', value: counts.da_valutare, tab: 'da_valutare', color: 'bg-[#1B4B93]' },
    { label: 'Da scaricare', value: counts.da_scaricare, tab: 'da_scaricare', color: 'bg-green-600' },
    { label: 'Scaricati', value: counts.scaricati, tab: 'scaricati', color: 'bg-[#123769]' },
    { label: 'Scartate', value: counts.scartate, tab: 'scartate', color: 'bg-amber-500' },
  ]

  return (
    <main className="min-h-screen bg-[#EEF1F5] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-[#123769]">
            Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <Link href="/admin/log" className="text-sm text-[#1B4B93] underline font-medium">
              Elenco mastro
            </Link>
            <button onClick={handleLogout} className="text-sm text-[#1B4B93] underline font-medium">
              Esci
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-6 text-center">
          <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">
            Totale ricevuti
          </p>
          <p className="text-4xl font-bold text-[#123769]">{counts.total}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {cards.map((c) => (
            <Link
              key={c.tab}
              href={`/admin/panel?tab=${c.tab}`}
              className={`${c.color} text-white rounded-xl p-6 text-center shadow hover:opacity-90 transition`}
            >
              <p className="text-3xl font-bold">{c.value}</p>
              <p className="text-sm uppercase tracking-wide font-semibold mt-1">{c.label}</p>
            </Link>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Questa pagina mostra solo i conteggi, senza caricare nessun video — clicca su una
          categoria per aprire l&apos;elenco completo.
        </p>
      </div>
    </main>
  )
}
