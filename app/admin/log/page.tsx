'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

type LogEntry = {
  id: string
  seq_number: number
  nickname: string | null
  location: string | null
  original_filename: string | null
  email: string
  status: 'da_valutare' | 'scaricato' | 'scartato'
  violation_type: string | null
  vehicle_type: string | null
  provincia: string | null
  created_at: string
}

const STATUS_LABELS: Record<LogEntry['status'], string> = {
  da_valutare: 'Da valutare',
  scaricato: 'Scaricato',
  scartato: 'Scartato',
}

const STATUS_COLORS: Record<LogEntry['status'], string> = {
  da_valutare: 'bg-gray-100 text-gray-700',
  scaricato: 'bg-green-100 text-green-700',
  scartato: 'bg-amber-100 text-amber-800',
}

const PAGE_SIZE = 200

export default function AdminLogPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
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

  const loadEntries = useCallback(async (pageIndex: number) => {
    setLoading(true)
    const from = pageIndex * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, error, count } = await supabase
      .from('submission_log')
      .select('*', { count: 'exact' })
      .order('seq_number', { ascending: false })
      .range(from, to)

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setEntries(data ?? [])
    setTotalCount(count ?? 0)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!checkingSession) loadEntries(page)
  }, [checkingSession, page, loadEntries])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  // L'export prende SEMPRE tutte le righe dal database, non solo quelle
  // visibili nella pagina corrente — le recupera a blocchi di 1000 (il
  // limite massimo per singola richiesta) finché non le ha prese tutte.
  const handleExportCsv = async () => {
    setExporting(true)
    const allEntries: LogEntry[] = []
    const batchSize = 1000
    let from = 0

    try {
      while (true) {
        const { data, error } = await supabase
          .from('submission_log')
          .select('*')
          .order('seq_number', { ascending: false })
          .range(from, from + batchSize - 1)

        if (error) throw error
        if (!data || data.length === 0) break

        allEntries.push(...data)
        if (data.length < batchSize) break
        from += batchSize
      }

      const header = [
        'Numero', 'Nome file', 'Nickname', 'Località', 'Provincia',
        'Tipo infrazione', 'Tipo veicolo', 'Email', 'Stato', 'Data invio',
      ]
      const rows = allEntries.map((e) => [
        String(e.seq_number).padStart(6, '0'),
        e.original_filename ?? '—',
        e.nickname ?? '—',
        e.location ?? '—',
        e.provincia ?? '—',
        e.violation_type ?? '—',
        e.vehicle_type ?? '—',
        e.email,
        STATUS_LABELS[e.status] ?? e.status,
        new Date(e.created_at).toLocaleString('it-IT'),
      ])

      const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`
      const csv = [header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n')

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `elenco-mastro-bdoi-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert("Errore durante l'esportazione. Riprova.")
    } finally {
      setExporting(false)
    }
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Caricamento...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#EEF1F5] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/panel" className="text-sm text-[#1B4B93] underline font-medium">
          ← Torna al pannello video
        </Link>

        <div className="flex items-center justify-between mt-3 mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wide text-[#123769]">
              Elenco mastro
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Storico permanente di tutti i file inviati ({totalCount} totali) — resta anche
              dopo l&apos;eliminazione dal pannello video.
            </p>
          </div>
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="bg-[#1B4B93] text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide disabled:opacity-60"
          >
            {exporting ? 'Preparazione CSV...' : 'Esporta CSV (tutto)'}
          </button>
        </div>

        <p className="text-xs text-gray-400 mb-2">
          ← Scorri orizzontalmente sulla tabella per vedere tutte le colonne →
        </p>

        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-auto">
          {loading ? (
            <p className="text-gray-500 text-center py-8">Caricamento...</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="px-4 py-3 font-semibold">Numero</th>
                  <th className="px-4 py-3 font-semibold">Nome file</th>
                  <th className="px-4 py-3 font-semibold">Nickname</th>
                  <th className="px-4 py-3 font-semibold">Località</th>
                  <th className="px-4 py-3 font-semibold">Provincia</th>
                  <th className="px-4 py-3 font-semibold">Infrazione</th>
                  <th className="px-4 py-3 font-semibold">Veicolo</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Stato</th>
                  <th className="px-4 py-3 font-semibold">Data invio</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-2.5 font-mono text-gray-400">
                      #{String(e.seq_number).padStart(6, '0')}
                    </td>
                    <td className="px-4 py-2.5 text-gray-700 font-mono text-xs">
                      {e.original_filename ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 text-gray-700">{e.nickname ?? '—'}</td>
                    <td className="px-4 py-2.5 text-gray-700">{e.location ?? '—'}</td>
                    <td className="px-4 py-2.5 text-gray-700">{e.provincia ?? '—'}</td>
                    <td className="px-4 py-2.5 text-gray-700">{e.violation_type ?? '—'}</td>
                    <td className="px-4 py-2.5 text-gray-700">{e.vehicle_type ?? '—'}</td>
                    <td className="px-4 py-2.5 text-gray-700">{e.email}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[e.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_LABELS[e.status] ?? e.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">
                      {new Date(e.created_at).toLocaleString('it-IT')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && entries.length === 0 && (
            <p className="text-gray-500 text-center py-8">Nessun invio registrato ancora.</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="bg-white text-[#1B4B93] border border-[#1B4B93]/30 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide disabled:opacity-40"
            >
              ← Precedente
            </button>
            <span className="text-sm text-gray-600">
              Pagina {page + 1} di {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="bg-white text-[#1B4B93] border border-[#1B4B93]/30 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide disabled:opacity-40"
            >
              Successiva →
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
