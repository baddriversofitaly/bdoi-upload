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

          <div className="bg-white rounded-xl p-2 md:p-3 mb-6">
            <Image
              src="/mappa-reas.jpg"
              alt="Piantina della Fiera REAS con il percorso per raggiungere lo stand Bad Drivers of Italy e l'area guida sicura"
              width={1200}
              height={900}
              className="w-full h-auto rounded-lg"
              priority
            />
          </div>

          <h2 className="text-white font-bold uppercase text-sm tracking-wide mb-3">
            Come arrivare
          </h2>
          <ol className="space-y-3 mb-2">
            <li className="flex gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-white text-[#1B4B93] font-bold text-sm flex items-center justify-center">1</span>
              <span className="text-white/90 text-sm leading-relaxed">
                Entra dall&apos;<strong>Ingresso Fiera REAS</strong> e dirigiti verso il <strong>Cancello Gate 4</strong>, tra il Pad. Hall 6/7bis e il Pad. Hall 4.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-white text-[#1B4B93] font-bold text-sm flex items-center justify-center">2</span>
              <span className="text-white/90 text-sm leading-relaxed">
                Attraversa il <strong>Pad. Hall 4</strong> seguendo il percorso tratteggiato fino alla zona tra Hall 4 e Hall 2.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-white text-[#1B4B93] font-bold text-sm flex items-center justify-center">3</span>
              <span className="text-white/90 text-sm leading-relaxed">
                Troverai il nostro <strong>stand A22</strong>, nell&apos;area interna tra il Pad. Hall 2 e il Pad. Hall 1.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-white text-[#1B4B93] font-bold text-sm flex items-center justify-center">4</span>
              <span className="text-white/90 text-sm leading-relaxed">
                Per le <strong>prove pratiche di guida sicura</strong>, torna verso il Cancello Gate 4: l&apos;area esterna dedicata si trova appena fuori, sopra il Pad. Hall 4.
              </span>
            </li>
          </ol>

          <div className="mt-5 bg-white/10 rounded-lg px-4 py-3">
            <p className="text-white/80 text-xs leading-relaxed">
              In alternativa, dall&apos;ingresso principale puoi anche passare per il Foyer e il Pad. Hall 1,
              raggiungendo lo stand A22 da sud (vedi il secondo percorso tratteggiato in piantina).
            </p>
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
