'use client'

import { useEffect, useMemo, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import SearchableSelect from '../../components/SearchableSelect'
import { VIOLATION_TYPES, VEHICLE_TYPES, PROVINCE_OPTIONS } from '../../lib/options'
import JSZip from 'jszip'

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
  violation_type: string | null
  vehicle_type: string | null
  pov_dashcam: string | null
  provincia: string | null
  note_bdoi: string | null
  signedUrl?: string
}

// I valori multipli sono salvati come testo separato da virgole
const splitValues = (v: string | null) =>
  v ? v.split(',').map((x) => x.trim()).filter(Boolean) : []

// Lista di base + voci personalizzate già usate in altre clip, in ordine alfabetico
const buildOptions = (base: string[], used: (string | null)[]) => {
  const customs = new Set<string>()
  used.forEach((v) => splitValues(v).forEach((x) => { if (!base.includes(x)) customs.add(x) }))
  return [...base, ...customs]
    .sort((a, b) => a.localeCompare(b, 'it'))
    .map((v) => ({ value: v, label: v }))
}

const TAB_LABELS: Record<Status, string> = {
  da_valutare: 'Da valutare',
  da_scaricare: 'Da scaricare',
  scaricati: 'Scaricati',
  scartate: 'Scartate',
}

// Formati che i browser non riescono in genere a riprodurre nativamente nel tag <video>
const POORLY_SUPPORTED_EXTENSIONS = ['avi', 'wmv', 'mkv', 'flv', 'mts', 'm2ts']

function isPoorlySupportedFormat(path: string) {
  const ext = path.split('.').pop()?.toLowerCase()
  return ext ? POORLY_SUPPORTED_EXTENSIONS.includes(ext) : false
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Caricamento...</p>
        </main>
      }
    >
      <AdminPanelContent />
    </Suspense>
  )
}

function AdminPanelContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as Status) || 'da_valutare'
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingSession, setCheckingSession] = useState(true)
  const [tab, setTab] = useState<Status>(initialTab)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loadingVideoId, setLoadingVideoId] = useState<string | null>(null)
  const [zipping, setZipping] = useState(false)
  const [zipProgress, setZipProgress] = useState({ current: 0, total: 0 })
  const [deleting, setDeleting] = useState<{ current: number; total: number } | null>(null)
  const [filterEmail, setFilterEmail] = useState('')
  const [filterSeqFrom, setFilterSeqFrom] = useState('')
  const [filterSeqTo, setFilterSeqTo] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  const filtersActive =
    filterEmail || filterSeqFrom || filterSeqTo || filterDateFrom || filterDateTo

  const resetFilters = () => {
    setFilterEmail('')
    setFilterSeqFrom('')
    setFilterSeqTo('')
    setFilterDateFrom('')
    setFilterDateTo('')
  }

  const applyFilters = (list: Submission[]) =>
    list.filter((s) => {
      if (filterEmail && !s.email.toLowerCase().includes(filterEmail.toLowerCase())) return false
      if (filterSeqFrom && s.seq_number < Number(filterSeqFrom)) return false
      if (filterSeqTo && s.seq_number > Number(filterSeqTo)) return false
      if (filterDateFrom && new Date(s.created_at) < new Date(filterDateFrom)) return false
      if (filterDateTo && new Date(s.created_at) > new Date(filterDateTo + 'T23:59:59')) return false
      return true
    })

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

    // Non generiamo più un URL firmato per OGNI video qui: con molte clip,
    // farlo per tutte insieme ad ogni apertura della pagina rallentava/bloccava
    // il pannello. Ogni URL viene ora richiesto solo quando serve davvero
    // (vedi loadVideoUrl), cliccando "Mostra video" o "Scarica".
    //
    // Supabase limita ogni singola richiesta a 1000 righe: con più clip di
    // così, recuperiamo tutto a blocchi di 1000 finché non finiscono.
    const allRows: Submission[] = []
    const batchSize = 1000
    let from = 0

    while (true) {
      const { data, error } = await supabase
        .from('video_submissions')
        .select('*')
        .order('created_at', { ascending: true })
        .range(from, from + batchSize - 1)

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }
      if (!data || data.length === 0) break

      allRows.push(...data)
      if (data.length < batchSize) break
      from += batchSize
    }

    setSubmissions(allRows)
    setLoading(false)
  }, [])

  // Richiede l'URL firmato di UN SOLO video, solo quando serve davvero
  const getSignedUrl = async (submission: Submission): Promise<string | null> => {
    if (submission.signedUrl) return submission.signedUrl

    const { data: signed, error } = await supabase.storage
      .from('video-uploads')
      .createSignedUrl(submission.video_path, 3600) // valido 1 ora

    if (error || !signed?.signedUrl) {
      console.error(error)
      return null
    }

    setSubmissions((prev) =>
      prev.map((s) => (s.id === submission.id ? { ...s, signedUrl: signed.signedUrl } : s))
    )
    return signed.signedUrl
  }

  const handleShowVideo = async (submission: Submission) => {
    setLoadingVideoId(submission.id)
    await getSignedUrl(submission)
    setLoadingVideoId(null)
  }

  useEffect(() => {
    if (!checkingSession) {
      loadSubmissions()
    }
  }, [checkingSession, loadSubmissions])

  // Opzioni dei menù: voci di base + eventuali voci personalizzate già usate, in ordine alfabetico
  const violationOptions = useMemo(
    () => buildOptions(VIOLATION_TYPES, submissions.map((s) => s.violation_type)),
    [submissions]
  )
  const vehicleOptions = useMemo(
    () =>
      buildOptions(VEHICLE_TYPES, [
        ...submissions.map((s) => s.vehicle_type),
        ...submissions.map((s) => s.pov_dashcam),
      ]),
    [submissions]
  )

  // Durante l'eliminazione avvisa se si prova a chiudere/ricaricare la pagina
  useEffect(() => {
    if (!deleting) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [deleting])

  // Elimina i video a gruppi di 10 (molto più veloce che uno alla volta) mostrando
  // l'avanzamento. Il file e la riga vengono eliminati insieme: se il file non si
  // riesce a cancellare, la riga resta, così non rimane un file "orfano" nello storage.
  // Il registro NON va toccato: lo stato resta "congelato" a quello che era
  // prima dell'eliminazione (da_valutare / scaricato / scartato).
  const deleteSubmissions = async (targets: Submission[]) => {
    const BATCH_SIZE = 10
    const deletedIds = new Set<string>()
    let failed = 0

    setDeleting({ current: 0, total: targets.length })

    try {
      for (let i = 0; i < targets.length; i += BATCH_SIZE) {
        const chunk = targets.slice(i, i + BATCH_SIZE)

        const { error: storageError } = await supabase.storage
          .from('video-uploads')
          .remove(chunk.map((s) => s.video_path))

        if (storageError) {
          console.error(storageError)
          failed += chunk.length
        } else {
          const { error: dbError } = await supabase
            .from('video_submissions')
            .delete()
            .in('id', chunk.map((s) => s.id))

          if (dbError) {
            console.error(dbError)
            failed += chunk.length
          } else {
            chunk.forEach((s) => deletedIds.add(s.id))
          }
        }

        setDeleting({ current: Math.min(i + BATCH_SIZE, targets.length), total: targets.length })
      }
    } finally {
      setSubmissions((prev) => prev.filter((s) => !deletedIds.has(s.id)))
      setSelected((prev) => {
        const next = new Set(prev)
        deletedIds.forEach((id) => next.delete(id))
        return next
      })
      setDeleting(null)
    }

    if (failed > 0) {
      alert(`${failed} video non sono stati eliminati a causa di un errore. Riprova.`)
    }
  }

  const handleDelete = async (submission: Submission) => {
    const confirmed = window.confirm('Eliminare definitivamente questo video?')
    if (!confirmed) return

    await deleteSubmissions([submission])
  }

  // Nel registro permanente teniamo solo 3 stati: "da_scaricare" conta ancora come
  // "da_valutare" perché non è uno stato definitivo.
  const mapToLogStatus = (status: Status): 'da_valutare' | 'scaricato' | 'scartato' => {
    if (status === 'scaricati') return 'scaricato'
    if (status === 'scartate') return 'scartato'
    return 'da_valutare'
  }

  const updateStatus = async (submission: Submission, newStatus: Status) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === submission.id ? { ...s, status: newStatus } : s))
    )
    await supabase.from('video_submissions').update({ status: newStatus }).eq('id', submission.id)
    await supabase
      .from('submission_log')
      .update({ status: mapToLogStatus(newStatus) })
      .eq('seq_number', submission.seq_number)
  }

  // Aggiorna una classificazione (tipo infrazione / veicolo / provincia) e la "congela"
  // subito anche nel registro permanente, così resta anche dopo un'eventuale eliminazione.
  const updateClassification = async (
    submission: Submission,
    field: 'violation_type' | 'vehicle_type' | 'pov_dashcam' | 'provincia',
    value: string
  ) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === submission.id ? { ...s, [field]: value } : s))
    )
    await supabase.from('video_submissions').update({ [field]: value }).eq('id', submission.id)
    await supabase
      .from('submission_log')
      .update({ [field]: value })
      .eq('seq_number', submission.seq_number)
  }

  // Salva la "Nota BDOI" (si scrive nel campo e si salva quando si esce dal campo)
  const saveBdoiNote = async (submission: Submission, value: string) => {
    const clean = value.trim()
    await supabase
      .from('video_submissions')
      .update({ note_bdoi: clean || null })
      .eq('id', submission.id)
  }

  const getDownloadFileName = (submission: Submission) => {
    const sanitize = (name: string) => name.replace(/[\\/:*?"<>|]/g, '-').trim()
    const ext = submission.video_path.split('.').pop()
    const seq = String(submission.seq_number).padStart(6, '0')

    // La Nota BDOI (se presente) viene aggiunta in fondo al nome del file, accorciata
    // a 80 caratteri per non creare nomi troppo lunghi.
    const bdoiNote = submission.note_bdoi ? sanitize(submission.note_bdoi).slice(0, 80) : ''
    const noteSuffix = bdoiNote ? ` - ${bdoiNote}` : ''

    // Il numero progressivo va sempre in testa al nome, per evitare sovrascritture
    // quando più invii hanno lo stesso nickname/località o lo stesso nome file originale.
    if (submission.nickname) {
      return `${seq} - ${sanitize(
        `${submission.nickname} - ${submission.location}${
          submission.provincia ? ` (${submission.provincia})` : ''
        }`
      )}${noteSuffix}.${ext}`
    }

    if (submission.original_filename) {
      // Il file originale ha già la sua estensione: la nota va prima dell'estensione
      const original = sanitize(submission.original_filename)
      const dot = original.lastIndexOf('.')
      return dot > 0
        ? `${seq} - ${original.slice(0, dot)}${noteSuffix}${original.slice(dot)}`
        : `${seq} - ${original}${noteSuffix}`
    }

    return `${seq} - ${submission.video_path}`
  }

  const downloadSubmission = async (submission: Submission) => {
    const url = await getSignedUrl(submission)
    if (!url) return

    const fileName = getDownloadFileName(submission)

    const response = await fetch(url)
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
    const seqNumbers = targets.map((s) => s.seq_number)
    setSubmissions((prev) =>
      prev.map((s) => (ids.includes(s.id) ? { ...s, status: newStatus } : s))
    )
    await supabase.from('video_submissions').update({ status: newStatus }).in('id', ids)
    await supabase
      .from('submission_log')
      .update({ status: mapToLogStatus(newStatus) })
      .in('seq_number', seqNumbers)
    setSelected(new Set())
  }

  const handleBulkDownload = async (list: Submission[]) => {
    const targets = list.filter((s) => selected.has(s.id))
    if (targets.length === 0) return

    // Un solo video selezionato: scarica il file così com'è, non serve uno ZIP
    if (targets.length === 1) {
      try {
        await downloadSubmission(targets[0])
        if (targets[0].status === 'da_scaricare') {
          await updateStatus(targets[0], 'scaricati')
        }
      } catch (err) {
        console.error(err)
        alert('Errore durante il download.')
      }
      setSelected(new Set())
      return
    }

    setZipping(true)
    setZipProgress({ current: 0, total: targets.length })

    try {
      const zip = new JSZip()

      for (let i = 0; i < targets.length; i++) {
        const submission = targets[i]
        setZipProgress({ current: i + 1, total: targets.length })

        const url = await getSignedUrl(submission)
        if (!url) continue

        const response = await fetch(url)
        const blob = await response.blob()
        zip.file(getDownloadFileName(submission), blob)
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const zipUrl = URL.createObjectURL(zipBlob)
      const dateLabel = new Date().toISOString().slice(0, 10)

      const a = document.createElement('a')
      a.href = zipUrl
      a.download = `bdoi-clip-${dateLabel}.zip`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(zipUrl)

      // Le clip scaricate da "Da scaricare" passano automaticamente a "Scaricati"
      for (const submission of targets) {
        if (submission.status === 'da_scaricare') {
          await updateStatus(submission, 'scaricati')
        }
      }
    } catch (err) {
      console.error(err)
      alert('Errore durante la creazione dello ZIP. Riprova.')
    } finally {
      setZipping(false)
      setSelected(new Set())
    }
  }

  const handleBulkDelete = async (list: Submission[]) => {
    const targets = list.filter((s) => selected.has(s.id))
    if (targets.length === 0) return

    const confirmed = window.confirm(
      `Eliminare definitivamente ${targets.length} video selezionati? L'operazione non è reversibile.`
    )
    if (!confirmed) return

    await deleteSubmissions(targets)
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
  const visible = applyFilters(buckets[tab])

  return (
    <main className="min-h-screen bg-[#EEF1F5] px-4 py-8">
      {/* Eliminazione in corso: blocca la pagina e mostra l'avanzamento */}
      {deleting && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
            <p className="font-bold text-[#123769] uppercase tracking-wide text-sm mb-3">
              Eliminazione in corso...
            </p>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-[#1B4B93] rounded-full transition-all duration-200"
                style={{ width: `${Math.round((deleting.current / deleting.total) * 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {deleting.current} di {deleting.total} video
            </p>
            <p className="text-xs text-gray-400 mt-3">
              Non chiudere né cambiare pagina finché non finisce.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-white bg-[#1B4B93] hover:bg-[#123769] text-xs font-bold uppercase tracking-wide rounded-full px-3 py-1.5 transition">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold uppercase tracking-wide text-[#123769]">
              Pannello video
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/log" className="text-sm text-[#1B4B93] underline font-medium">
              Elenco mastro
            </Link>
            <button onClick={handleLogout} className="text-sm text-[#1B4B93] underline font-medium">
              Esci
            </button>
          </div>
        </div>

        {/* Filtri */}
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
              <input
                type="text"
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
                placeholder="Cerca per email..."
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Numero da</label>
              <input
                type="number"
                value={filterSeqFrom}
                onChange={(e) => setFilterSeqFrom(e.target.value)}
                placeholder="es. 100"
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Numero a</label>
              <input
                type="number"
                value={filterSeqTo}
                onChange={(e) => setFilterSeqTo(e.target.value)}
                placeholder="es. 200"
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Data da</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Data a</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
            </div>
          </div>
          {filtersActive && (
            <button
              onClick={resetFilters}
              className="text-xs text-[#1B4B93] underline font-medium mt-3"
            >
              Reimposta filtri
            </button>
          )}
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
          <p className="text-gray-500">
            {filtersActive
              ? 'Nessun video corrisponde ai filtri applicati.'
              : 'Nessun video in questa categoria.'}
          </p>
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
                      className="bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
                    >
                      Scarta
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleBulkDownload(visible)}
                      disabled={zipping}
                      className="bg-[#1B4B93] text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide disabled:opacity-60"
                    >
                      {zipping
                        ? `Comprimendo ${zipProgress.current}/${zipProgress.total}...`
                        : selected.size > 1
                          ? 'Scarica selezionati (ZIP)'
                          : 'Scarica'}
                    </button>
                    <button
                      onClick={() => handleBulkStatus(visible, 'scartate')}
                      className="bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
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
                {tab !== 'da_scaricare' && (
                  <button
                    onClick={() => handleBulkDelete(visible)}
                    className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
                  >
                    Elimina
                  </button>
                )}
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
                isPoorlySupportedFormat(s.video_path) ? (
                  <div className="bg-amber-50 border border-amber-200 rounded mb-3 mt-3 px-4 py-6 text-center">
                    <p className="text-sm text-amber-800">
                      Anteprima non disponibile per i file{' '}
                      <strong>.{s.video_path.split('.').pop()?.toUpperCase()}</strong> — i
                      browser non riescono a riprodurli direttamente. Scarica il video per
                      guardarlo con un player esterno (es. VLC).
                    </p>
                  </div>
                ) : (
                  <video controls preload="metadata" className="w-full rounded mb-3 mt-3 max-h-96">
                    <source src={s.signedUrl} />
                    Il tuo browser non supporta la riproduzione video.
                  </video>
                )
              ) : (
                <button
                  onClick={() => handleShowVideo(s)}
                  disabled={loadingVideoId === s.id}
                  className="w-full rounded mb-3 mt-3 py-6 bg-gray-50 border border-dashed border-gray-300 text-gray-500 text-sm hover:bg-gray-100 transition disabled:opacity-60"
                >
                  {loadingVideoId === s.id ? 'Caricamento...' : '▶ Mostra video'}
                </button>
              )}

              {/* Classificazione: evento, POV dashcam, utenti coinvolti, provincia */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Evento</label>
                  <SearchableSelect
                    multiple
                    allowCustom
                    options={violationOptions}
                    value={splitValues(s.violation_type)}
                    onChange={(values) => updateClassification(s, 'violation_type', values.join(', '))}
                    placeholder="Non specificato"
                    variant="white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">POV dashcam</label>
                  <SearchableSelect
                    multiple
                    allowCustom
                    options={vehicleOptions}
                    value={splitValues(s.pov_dashcam)}
                    onChange={(values) => updateClassification(s, 'pov_dashcam', values.join(', '))}
                    placeholder="Non specificato"
                    variant="white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Utenti coinvolti</label>
                  <SearchableSelect
                    multiple
                    allowCustom
                    options={vehicleOptions}
                    value={splitValues(s.vehicle_type)}
                    onChange={(values) => updateClassification(s, 'vehicle_type', values.join(', '))}
                    placeholder="Non specificato"
                    variant="white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Provincia</label>
                  <SearchableSelect
                    options={PROVINCE_OPTIONS}
                    value={s.provincia ?? ''}
                    onChange={(v) => updateClassification(s, 'provincia', v)}
                    placeholder="Non specificata"
                    variant="white"
                  />
                </div>
              </div>

              {/* Note BDOI: vengono aggiunte in fondo al nome del file quando lo scarichi */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Note BDOI{' '}
                  <span className="font-normal text-gray-400">
                    (aggiunte al nome del file al download)
                  </span>
                </label>
                <input
                  type="text"
                  value={s.note_bdoi ?? ''}
                  onChange={(e) =>
                    setSubmissions((prev) =>
                      prev.map((x) => (x.id === s.id ? { ...x, note_bdoi: e.target.value } : x))
                    )
                  }
                  onBlur={(e) => saveBdoiNote(s, e.target.value)}
                  placeholder="es. incrocio pericoloso, Rossi - Roma"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 text-gray-800"
                />
              </div>

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
                      className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide"
                    >
                      Scarta
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleDownload(s)}
                      className="bg-[#1B4B93] text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide"
                    >
                      Scarica
                    </button>
                    <button
                      onClick={() => updateStatus(s, 'scartate')}
                      className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide"
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
                {s.status !== 'da_scaricare' && (
                  <button
                    onClick={() => handleDelete(s)}
                    className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide"
                  >
                    Elimina
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
