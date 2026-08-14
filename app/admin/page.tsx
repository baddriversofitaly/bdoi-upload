'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

type Status = 'da_valutare' | 'da_scaricare' | 'scaricati' | 'scartate'

type Submission = {
  id: string
  seq_number: number
  nickname: string | null
  location: string | null
  email: string
  note: string | null
  original_filename: string | null
  video_path: string
  created_at: string
  status: Status
  signedUrl?: string
}

const TAB_LABELS: Record<Status, string> = {
  da_valutare: 'Da valutare',
  da_scaricare: 'Da scaricare',
  scaricati: 'Scaricati',
  scartate: 'Scartate',
}

export default function AdminPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingSession, setCheckingSession] = useState(true)
  const [tab, setTab] = useState<Status>('da_valutare')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Controlla che l'utente sia autenticato, altrimenti manda al login
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/admin/login')
      } else {
        setCheckingSession(false)
      }
    })
  }, [router])

  const loadSubmissions = useCallback(async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('video_submissions')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    // Genera un URL firmato temporaneo per ogni video (bucket privato)
    const withUrls = await Promise.all(
      (data ?? []).map(async (row) => {
        const { data: signed } = await supabase.storage
          .from('video-uploads')
          .createSignedUrl(row.video_path, 3600) // valido 1 ora

        return { ...row, signedUrl: signed?.signedUrl }
      })
    )

    setSubmissions(withUrls)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!checkingSession) {
      loadSubmissions()
    }
  }, [checkingSession, loadSubmissions])

  const deleteSubmission = async (submission: Submission) => {
    await supabase.storage.from('video-uploads').remove([submission.video_path])
    await supabase.from('video_submissions').delete().eq('id', submission.id)
  }

  const handleDelete = async (submission: Submission) => {
    const confirmed = window.confirm('Eliminare definitivamente questo video?')
    if (!confirmed) return

    await deleteSubmission(submission)
    setSubmissions((prev) => prev.filter((s) => s.id !== submission.id))
  }

  const updateStatus = async (submission: Submission, newStatus: Status) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === submission.id ? { ...s, status: newStatus } : s))
    )
    await supabase.from('video_submissions').update({ status: newStatus }).eq('id', submission.id)
  }

  const downloadSubmission = async (submission: Submission) => {
    if (!submission.signedUrl) return

    const sanitize = (name: string) => name.replace(/[\\/:*?"<>|]/g, '-').trim()
    const ext = submission.video_path.split('.').pop()
    const seq = String(submission.seq_number).padStart(6, '0')

    // Il numero progressivo va sempre in testa al nome, per evitare sovrascritture
    // quando più invii hanno lo stesso nickname/località o lo stesso nome file originale.
    const fileName = submission.nickname
      ? `${seq} - ${sanitize(`${submission.nickname} - ${submission.location}`)}.${ext}`
      : submission.original_filename
        ? `${seq} - ${sanitize(submission.original_filename)}`
        : `${seq} - ${submission.video_path}`

    const response = await fetch(submission.signedUrl)
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = blobUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(blobUrl)
  }

  const handleDownload = async (submission: Submission) => {
    try {
      await downloadSubmission(submission)
      // Se era "da scaricare", il download lo sposta automaticamente in "Scaricati"
      if (submission.status === 'da_scaricare') {
        await updateStatus(submission, 'scaricati')
      }
    } catch (err) {
      console.error(err)
      alert('Errore durante il download del video.')
    }
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = (list: Submission[]) => {
    setSelected((prev) => {
      const allSelected = list.every((s) => prev.has(s.id))
      const next = new Set(prev)
      if (allSelected) {
        list.forEach((s) => next.delete(s.id))
      } else {
        list.forEach((s) => next.add(s.id))
      }
      return next
    })
  }

  const handleBulkStatus = async (list: Submission[], newStatus: Status) => {
    const targets = list.filter((s) => selected.has(s.id))
    if (targets.length === 0) return

    const ids = targets.map((s) => s.id)
    setSubmissions((prev) =>
      prev.map((s) => (ids.includes(s.id) ? { ...s, status: newStatus } : s))
    )
    await supabase.from('video_submissions').update({ status: newStatus }).in('id', ids)
    setSelected(new Set())
  }

  const handleBulkDownload = async (list: Submission[]) => {
    const targets = list.filter((s) => selected.has(s.id))
    if (targets.length === 0) return

    for (const submission of targets) {
      try {
        await downloadSubmission(submission)
        if (submission.status === 'da_scaricare') {
          await updateStatus(submission, 'scaricati')
        }
      } catch (err) {
        console.error(err)
        alert(`Errore durante il download di "${submission.original_filename ?? submission.video_path}".`)
      }
    }
    setSelected(new Set())
  }

  const handleBulkDelete = async (list: Submission[]) => {
    const targets = list.filter((s) => selected.has(s.id))
    if (targets.length === 0) return

    const confirmed = window.confirm(
      `Eliminare definitivamente ${targets.length} video selezionati? L'operazione non è reversibile.`
    )
    if (!confirmed) return

    for (const submission of targets) {
      await deleteSubmission(submission)
    }

    const deletedIds = new Set(targets.map((s) => s.id))
    setSubmissions((prev) => prev.filter((s) => !deletedIds.has(s.id)))
    setSelected(new Set())
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (checkingSession || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Caricamento...</p>
      </main>
    )
  }

  const daValutare = submissions.filter((s) => s.status === 'da_valutare')
  const daScaricare = submissions.filter((s) => s.status === 'da_scaricare')
  const scaricati = submissions.filter((s) => s.status === 'scaricati')
  const scartate = submissions.filter((s) => s.status === 'scartate')
  const buckets: Record<Status, Submission[]> = {
    da_valutare: daValutare,
    da_scaricare: daScaricare,
    scaricati,
    scartate,
  }
  const visible = buckets[tab]

  return (
    <main className="min-h-screen bg-[#EEF1F5] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-[#123769]">
            Pannello video
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

        {/* Schede */}
        <div className="flex gap-2 mb-6">
          {(Object.keys(TAB_LABELS) as Status[]).map((key) => (
            <button
              key={key}
              onClick={() => {
                setTab(key)
                setSelected(new Set())
              }}
              className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide ${
                tab === key
                  ? 'bg-[#1B4B93] text-white'
                  : 'bg-white text-[#1B4B93] border border-[#1B4B93]/30'
              }`}
            >
              {TAB_LABELS[key]} ({buckets[key].length})
            </button>
          ))}
        </div>

        {visible.length === 0 && (
          <p className="text-gray-500">Nessun video in questa categoria.</p>
        )}

        {visible.length > 0 && (
          <div className="flex items-center justify-between mb-4 bg-white rounded-lg border border-gray-200 px-4 py-2.5 flex-wrap gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={visible.length > 0 && visible.every((s) => selected.has(s.id))}
                onChange={() => toggleSelectAll(visible)}
              />
              {selected.size > 0 ? `${selected.size} selezionati` : 'Seleziona tutti'}
            </label>

            {selected.size > 0 && (
              <div className="flex gap-2 flex-wrap">
                {tab === 'da_valutare' ? (
                  <>
                    <button
                      onClick={() => handleBulkStatus(visible, 'da_scaricare')}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
                    >
                      Da scaricare
                    </button>
                    <button
                      onClick={() => handleBulkStatus(visible, 'scartate')}
                      className="bg-amber-400 text-[#123769] px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
                    >
                      Scarta
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleBulkDownload(visible)}
                      className="bg-[#1B4B93] text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
                    >
                      Scarica
                    </button>
                    <button
                      onClick={() => handleBulkStatus(visible, 'scartate')}
                      className="bg-amber-400 text-[#123769] px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
                    >
                      Scarta
                    </button>
                    <button
                      onClick={() => handleBulkStatus(visible, 'da_valutare')}
                      className="bg-white text-[#1B4B93] border border-[#1B4B93]/40 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
                    >
                      Rimetti in valutazione
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleBulkDelete(visible)}
                  className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
                >
                  Elimina
                </button>
              </div>
            )}
          </div>
        )}

        <div className="space-y-6">
          {visible.map((s) => (
            <div
              key={s.id}
              className={`bg-white rounded-xl shadow border p-4 ${
                selected.has(s.id) ? 'ring-2 ring-[#1B4B93] border-gray-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(s.id)}
                    onChange={() => toggleSelect(s.id)}
                    className="shrink-0"
                  />
                  <span className="text-xs font-mono text-gray-400 shrink-0">
                    #{String(s.seq_number).padStart(6, '0')}
                  </span>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
                    {s.nickname ? (
                      <>
                        <span><strong>Nickname:</strong> {s.nickname}</span>
                        <span><strong>Località:</strong> {s.location}</span>
                      </>
                    ) : (
                      <span className="italic text-gray-400">
                        Nickname/località non forniti (utente ha dichiarato di aver già rinominato il file)
                      </span>
                    )}
                    <span><strong>Email:</strong> {s.email}</span>
                    <span><strong>Data:</strong> {new Date(s.created_at).toLocaleString('it-IT')}</span>
                  </div>
                </div>
              </div>

              {s.original_filename && (
                <p className="text-xs text-gray-500 mb-1">
                  File originale: <span className="font-mono">{s.original_filename}</span>
                </p>
              )}

              {s.note && (
                <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded px-3 py-2 mb-3 mt-2">
                  <strong>Note:</strong> {s.note}
                </p>
              )}

              {s.signedUrl ? (
                <video controls className="w-full rounded mb-3 mt-3 max-h-96">
                  <source src={s.signedUrl} />
                  Il tuo browser non supporta la riproduzione video.
                </video>
              ) : (
                <p className="text-red-500 text-sm mb-3 mt-3">Impossibile caricare il video.</p>
              )}

              <div className="flex gap-3 flex-wrap">
                {s.status === 'da_valutare' ? (
                  <>
                    <button
                      onClick={() => updateStatus(s, 'da_scaricare')}
                      className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide"
                    >
                      Da scaricare
                    </button>
                    <button
                      onClick={() => updateStatus(s, 'scartate')}
                      className="bg-amber-400 text-[#123769] px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide"
                    >
                      Scarta
                    </button>
                  </>
                ) : (
                  <>
                    {s.signedUrl && (
                      <button
                        onClick={() => handleDownload(s)}
                        className="bg-[#1B4B93] text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide"
                      >
                        Scarica
                      </button>
                    )}
                    <button
                      onClick={() => updateStatus(s, 'scartate')}
                      className="bg-amber-400 text-[#123769] px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide"
                    >
                      Scarta
                    </button>
                    <button
                      onClick={() => updateStatus(s, 'da_valutare')}
                      className="bg-white text-[#1B4B93] border border-[#1B4B93]/40 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide"
                    >
                      Rimetti in valutazione
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(s)}
                  className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide"
                >
                  Elimina
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
