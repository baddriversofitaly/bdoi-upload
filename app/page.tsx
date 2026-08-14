'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import SocialIcons from './components/SocialIcons'

const MAX_FILE_SIZE_MB = 300
const MAX_FILES_RENAMED = 5

type Step = 'question' | 'renamed' | 'not-renamed'
type SubmitStatus = 'idle' | 'uploading' | 'success' | 'error'

type QueuedFile = {
  file: File
  id: string
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Logo() {
  return (
    <div className="flex justify-center mb-6">
      <div className="relative w-full max-w-sm aspect-[2.4/1]">
        <Image src="/logo.png" alt="Bad Drivers of Italy" fill className="object-contain" priority />
      </div>
    </div>
  )
}

function SuccessCard({ onReset }: { onReset: () => void }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-[#1B4B93] border-4 border-white rounded-2xl shadow-xl p-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white flex items-center justify-center">
          <svg className="w-8 h-8 text-[#1B4B93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-wide text-white mb-2">Video ricevuti</h1>
        <p className="text-white/85 mb-6">
          Grazie! I tuoi filmati sono stati caricati correttamente e verranno valutati a breve.
        </p>
        <button
          onClick={onReset}
          className="bg-white text-[#1B4B93] font-bold uppercase text-sm tracking-wide px-5 py-2.5 rounded-full"
        >
          Carica altri video
        </button>
      </div>
    </main>
  )
}

export default function UploadPage() {
  const [step, setStep] = useState<Step>('question')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  if (step === 'question') {
    return <QuestionStep onAnswer={(renamed) => setStep(renamed ? 'renamed' : 'not-renamed')} />
  }

  if (step === 'renamed') {
    return <RenamedForm onBack={() => setStep('question')} />
  }

  return <NotRenamedForm onBack={() => setStep('question')} />
}

function QuestionStep({ onAnswer }: { onAnswer: (renamed: boolean) => void }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="max-w-xl w-full">
        <Logo />

        <div className="bg-[#1B4B93] border-4 border-white rounded-2xl shadow-xl p-6 md:p-8">
          <h2 className="text-white text-lg font-bold uppercase tracking-wide mb-3 text-center">
            Come contribuire a Bad Drivers of Italy
          </h2>
          <ol className="text-white/90 text-[13px] list-decimal list-inside space-y-2.5">
            <li>
              Avere una dashcam a bordo: non accettiamo video registrati con il cellulare
              (specialmente se ripresi dal posto di guida). Ti serve una dashcam? Trova la tua su{' '}
              <a
                href="https://www.sicurisullastrada.it"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold"
              >
                SicuriSullaStrada.it
              </a>
              .
            </li>
            <li>
              Requisiti tecnici. Dimensione massima: 300MB per ogni file. Durata: minimo 6
              secondi, massimo 60 secondi.
            </li>
            <li>
              Massimo 5 file a settimana (consulta la pagina{' '}
              <Link href="/info" className="underline font-semibold">Info & Regole</Link> per
              sapere di più sui criteri di selezione).
            </li>
            <li>
              No collage di clip in un unico file: i video vanno inviati separatamente anche in
              caso di riprese fronte-retro.
            </li>
            <li>
              Inviare i video non vuol dire che vengano automaticamente pubblicati. In media,
              selezioniamo il 20-25% di quello che ci viene inviato per la pubblicazione su Bad
              Drivers of Italy. Inviare più volte lo stesso file non aumenta le probabilità di
              pubblicazione (anzi il contrario…).
            </li>
          </ol>
        </div>

        <div className="bg-[#1B4B93] border-4 border-white rounded-2xl shadow-xl p-6 md:p-8 text-center mt-6">
          <h1 className="text-white text-xl font-bold uppercase tracking-wide mb-4">
            Hai già rinominato i file con nickname e località?
          </h1>
          <div className="flex gap-3 justify-center mb-4">
            <button
              onClick={() => onAnswer(true)}
              className="bg-white text-[#1B4B93] rounded-full px-8 py-3 font-bold uppercase tracking-wide"
            >
              Sì
            </button>
            <button
              onClick={() => onAnswer(false)}
              className="bg-white/10 text-white border-2 border-white rounded-full px-8 py-3 font-bold uppercase tracking-wide"
            >
              No
            </button>
          </div>
          <p className="text-white/70 text-xs max-w-sm mx-auto mb-4">
            La scelta non influisce in alcun modo sulla selezione o pubblicazione dei tuoi
            video, serve solo a personalizzare il form di caricamento.
          </p>

          <ContactLink />

          <div className="mt-5">
            <p className="text-center text-xs text-white/70 mb-2">Seguici su</p>
            <SocialIcons />
          </div>
        </div>
      </div>
    </main>
  )
}

function BackLink({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="text-white bg-white/15 hover:bg-white/25 text-sm font-semibold inline-flex items-center gap-1 rounded-full px-3 py-1.5 transition"
    >
      ← Indietro
    </button>
  )
}

function ContactLink() {
  return (
    <div className="border-t border-white/25 pt-4">
      <p className="text-center text-sm text-white">
        Hai bisogno di ulteriori informazioni?{' '}
        <Link href="/contatti" className="font-bold underline">Contattaci</Link>
      </p>
    </div>
  )
}

function TermsCheckbox() {
  return (
    <div className="flex items-start gap-2">
      <input type="checkbox" id="terms" required className="mt-1" />
      <label htmlFor="terms" className="text-sm text-white/85">
        Dichiaro di essere il proprietario del filmato e accetto i{' '}
        <Link href="/termini" target="_blank" className="text-white underline">
          Termini di utilizzo
        </Link>{' '}
        e le{' '}
        <Link href="/info" target="_blank" className="text-white underline">
          Regole
        </Link>{' '}
        di Bad Drivers of Italy.
      </label>
    </div>
  )
}

async function uploadFileToStorage(
  path: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const url = `${supabaseUrl}/storage/v1/object/video-uploads/${encodeURIComponent(path)}`

    const xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)
    xhr.setRequestHeader('apikey', supabaseKey ?? '')
    xhr.setRequestHeader('Authorization', `Bearer ${supabaseKey}`)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`Upload fallito (status ${xhr.status})`))
      }
    }
    xhr.onerror = () => reject(new Error('Errore di rete durante il caricamento'))
    xhr.send(file)
  })
}

async function uploadOneFile(params: {
  file: File
  nickname: string | null
  location: string | null
  email: string
  note: string | null
  onProgress?: (percent: number) => void
}) {
  const { file, nickname, location, email, note, onProgress } = params
  const fileExt = file.name.split('.').pop()
  const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

  await uploadFileToStorage(filePath, file, onProgress)

  const { error: insertError } = await supabase.from('video_submissions').insert({
    nickname,
    location,
    email,
    note,
    original_filename: file.name,
    video_path: filePath,
    status: 'da_valutare',
    terms_accepted_at: new Date().toISOString(),
  })
  if (insertError) throw insertError
}

function ProgressBar({ percent, label }: { percent: number; label: string }) {
  return (
    <div>
      <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-150 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-white/70 text-xs mt-1.5 text-center">{label}</p>
    </div>
  )
}

// Invia l'email di conferma senza bloccare il flusso se fallisce
async function sendConfirmationEmail(email: string) {
  try {
    await fetch('/api/send-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
  } catch (err) {
    console.error('Invio email di conferma fallito:', err)
  }
}

// STEP: utente ha già rinominato i file -> solo email, note, upload multiplo
function RenamedForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [files, setFiles] = useState<QueuedFile[]>([])
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [fileProgress, setFileProgress] = useState(0)

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    const withIds = selected.map((file) => ({
      file,
      id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
    }))
    setFiles((prev) => [...prev, ...withIds].slice(0, MAX_FILES_RENAMED))
    e.target.value = ''
  }

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (files.length === 0) {
      setErrorMessage('Seleziona almeno un video da caricare.')
      return
    }
    const oversized = files.find((f) => f.file.size > MAX_FILE_SIZE_MB * 1024 * 1024)
    if (oversized) {
      setErrorMessage(`Il file "${oversized.file.name}" supera il limite di ${MAX_FILE_SIZE_MB}MB.`)
      return
    }
    if (!emailRegex.test(email)) {
      setErrorMessage('Inserisci un indirizzo email valido.')
      return
    }

    setStatus('uploading')
    setProgress({ current: 0, total: files.length })

    try {
      for (let i = 0; i < files.length; i++) {
        setProgress({ current: i + 1, total: files.length })
        setFileProgress(0)
        await uploadOneFile({
          file: files[i].file,
          nickname: null,
          location: null,
          email,
          note: note || null,
          onProgress: setFileProgress,
        })
      }
      await sendConfirmationEmail(email)
      setStatus('success')
    } catch (err) {
      console.error(err)
      setStatus('error')
      setErrorMessage('Qualcosa è andato storto durante il caricamento. Riprova.')
    }
  }

  if (status === 'success') {
    return <SuccessCard onReset={onBack} />
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-xl mx-auto">
        <Logo />

        <form
          onSubmit={handleSubmit}
          className="bg-[#1B4B93] border-4 border-white rounded-2xl shadow-xl p-6 md:p-8 space-y-5"
        >
          <BackLink onBack={onBack} />

          <div>
            <h1 className="text-white text-xl font-bold uppercase tracking-wide">Carica i tuoi video</h1>
            <p className="text-white/75 text-sm mt-1">
              Puoi caricare fino a {MAX_FILES_RENAMED} video, {MAX_FILE_SIZE_MB}MB ciascuno.
            </p>
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
              Note <span className="font-normal normal-case text-white/60">(facoltative)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Es. dinamica dell'episodio, ulteriori dettagli..."
              className="w-full rounded-md px-3 py-2 bg-white text-[#123769] focus:outline-none focus:ring-2 focus:ring-white resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-white/90 mb-1">
              Video
            </label>
            <label className="flex items-center justify-center w-full rounded-md border-2 border-dashed border-white/60 bg-white/10 text-white text-sm py-4 cursor-pointer hover:bg-white/15 transition text-center">
              <input type="file" accept="video/*" multiple onChange={handleFilesSelected} className="hidden" />
              Scegli fino a {MAX_FILES_RENAMED} video (max {MAX_FILE_SIZE_MB}MB ciascuno)
            </label>

            {files.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {files.map(({ file, id }) => (
                  <li key={id} className="flex items-center justify-between bg-white/10 rounded px-3 py-1.5 text-sm text-white">
                    <span className="truncate mr-2">
                      {file.name} <span className="text-white/60">({(file.size / (1024 * 1024)).toFixed(1)}MB)</span>
                    </span>
                    <button type="button" onClick={() => removeFile(id)} className="text-white/70 hover:text-white shrink-0" aria-label="Rimuovi">
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <TermsCheckbox />

          {status === 'uploading' && (
            <ProgressBar
              percent={Math.round((((progress.current - 1) * 100 + fileProgress) / (progress.total * 100)) * 100)}
              label={`Caricamento file ${progress.current}/${progress.total} — ${fileProgress}%`}
            />
          )}

          {errorMessage && (
            <p className="text-sm bg-white/95 text-red-700 rounded px-3 py-2 font-medium">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={status === 'uploading'}
            className="w-full bg-white text-[#1B4B93] rounded-full py-3 font-bold uppercase tracking-wide disabled:opacity-50"
          >
            {status === 'uploading'
              ? 'Caricamento in corso...'
              : `Invia ${files.length > 1 ? `${files.length} video` : 'video'}`}
          </button>

          <ContactLink />

          <div className="mt-5">
            <p className="text-center text-xs text-white/70 mb-2">Seguici su</p>
            <SocialIcons />
          </div>
        </form>
      </div>
    </main>
  )
}

// STEP: utente NON ha ancora rinominato i file -> nickname, località, email, 1 video alla volta
function NotRenamedForm({ onBack }: { onBack: () => void }) {
  const [nickname, setNickname] = useState('')
  const [location, setLocation] = useState('')
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [uploadPercent, setUploadPercent] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!file) {
      setErrorMessage('Seleziona un video da caricare.')
      return
    }
    if (!location.trim()) {
      setErrorMessage('Inserisci la località.')
      return
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`Il video supera il limite di ${MAX_FILE_SIZE_MB}MB.`)
      return
    }
    if (!emailRegex.test(email)) {
      setErrorMessage('Inserisci un indirizzo email valido.')
      return
    }

    setStatus('uploading')
    setUploadPercent(0)

    try {
      await uploadOneFile({
        file,
        nickname: nickname.trim() || 'anonimo',
        location,
        email,
        note: note || null,
        onProgress: setUploadPercent,
      })
      await sendConfirmationEmail(email)
      setStatus('success')
    } catch (err) {
      console.error(err)
      setStatus('error')
      setErrorMessage('Qualcosa è andato storto durante il caricamento. Riprova.')
    }
  }

  if (status === 'success') {
    return <SuccessCard onReset={onBack} />
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-xl mx-auto">
        <Logo />

        <form
          onSubmit={handleSubmit}
          className="bg-[#1B4B93] border-4 border-white rounded-2xl shadow-xl p-6 md:p-8 space-y-5"
        >
          <BackLink onBack={onBack} />

          <div>
            <h1 className="text-white text-xl font-bold uppercase tracking-wide">Carica il tuo video</h1>
            <p className="text-white/75 text-sm mt-1">
              Un video alla volta, massimo {MAX_FILE_SIZE_MB}MB.
            </p>
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
              Località dove è stato registrato il video <span className="font-normal normal-case text-white/60">(obbligatorio)</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="es. Codroipo (UD)"
              className="w-full rounded-md px-3 py-2 bg-white text-[#123769] focus:outline-none focus:ring-2 focus:ring-white placeholder:text-[#123769]/40"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-white/90 mb-1">
              Nickname per la pubblicazione <span className="font-normal normal-case text-white/60">(facoltativo — se vuoto, verrà pubblicato come &quot;anonimo&quot;)</span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full rounded-md px-3 py-2 bg-white text-[#123769] focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-white/90 mb-1">
              Note <span className="font-normal normal-case text-white/60">(facoltative)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Es. dinamica dell'episodio, ulteriori dettagli..."
              className="w-full rounded-md px-3 py-2 bg-white text-[#123769] focus:outline-none focus:ring-2 focus:ring-white resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-white/90 mb-1">Video</label>
            <label className="flex items-center justify-center w-full rounded-md border-2 border-dashed border-white/60 bg-white/10 text-white text-sm py-4 cursor-pointer hover:bg-white/15 transition text-center">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              {file ? file.name : `Scegli un video (max ${MAX_FILE_SIZE_MB}MB)`}
            </label>
          </div>

          <TermsCheckbox />

          {status === 'uploading' && (
            <ProgressBar percent={uploadPercent} label={`Caricamento in corso — ${uploadPercent}%`} />
          )}

          {errorMessage && (
            <p className="text-sm bg-white/95 text-red-700 rounded px-3 py-2 font-medium">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={status === 'uploading'}
            className="w-full bg-white text-[#1B4B93] rounded-full py-3 font-bold uppercase tracking-wide disabled:opacity-50"
          >
            {status === 'uploading' ? 'Caricamento in corso...' : 'Invia video'}
          </button>

          <ContactLink />

          <div className="mt-5">
            <p className="text-center text-xs text-white/70 mb-2">Seguici su</p>
            <SocialIcons />
          </div>
        </form>
      </div>
    </main>
  )
}
