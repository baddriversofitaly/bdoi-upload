import Link from 'next/link'
import Image from 'next/image'
import SocialIcons from '../components/SocialIcons'

export default function MappaPage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-white/80 hover:text-white text-sm mb-3 inline-block">
          ← Torna alla pagina di invio
        </Link>

        <div className="bg-[#1B4B93] border-4 border-white rounded-2xl shadow-xl p-6 md:p-8">
          <h1 className="text-white text-xl font-bold uppercase tracking-wide mb-1">
            Dove trovarci al REAS
          </h1>
          <p className="text-white/75 text-sm mb-5">
            Centro Fiera del Garda, Montichiari (BS) — ecco come raggiungere il nostro stand
            e l&apos;area prove pratiche di guida sicura.
          </p>

          <ol className="space-y-3 mb-6">
            <li className="flex gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-red-600 text-white font-bold text-sm flex items-center justify-center">1</span>
              <span className="text-white/90 text-sm leading-relaxed">
                Devi raggiungere lo stand <strong>Bad Drivers of Italy</strong>? Segui il percorso <strong className="text-red-400">ROSSO</strong>: passando per il Padiglione 1 raggiungi lo stand <strong>A22</strong> nel Padiglione 2.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">2</span>
              <span className="text-white/90 text-sm leading-relaxed">
                Devi raggiungere l&apos;<strong>area esterna guida sicura</strong> dallo stand Bad Drivers of Italy? Segui il percorso <strong className="text-blue-300">BLU</strong>: raggiungi il Gate 4 e poi gira a destra.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-green-600 text-white font-bold text-sm flex items-center justify-center">3</span>
              <span className="text-white/90 text-sm leading-relaxed">
                Devi raggiungere l&apos;area esterna dall&apos;<strong>ingresso della fiera</strong>? Segui il percorso <strong className="text-green-400">VERDE</strong>: attraversa il Padiglione 5, raggiungi il Gate 4 e poi gira a destra.
              </span>
            </li>
          </ol>

          <div className="bg-white rounded-xl p-2 md:p-3">
            <Image
              src="/mappa-reas.png"
              alt="Piantina della Fiera REAS con i percorsi per raggiungere lo stand Bad Drivers of Italy e l'area guida sicura"
              width={1200}
              height={900}
              className="w-full h-auto rounded-lg"
              priority
            />
          </div>
        </div>

        <div className="mt-6">
          <p className="text-center text-xs text-white/70 mb-2">Seguici su</p>
          <SocialIcons />
        </div>
      </div>
    </main>
  )
}
