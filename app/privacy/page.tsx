import Link from 'next/link'
import SocialIcons from '../components/SocialIcons'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 md:p-8">
        <Link href="/" className="text-sm text-blue-600 underline">
          &larr; Torna alla pagina di invio
        </Link>

        <h1 className="text-2xl font-semibold mt-4 mb-2">Informativa sulla privacy e sui cookie</h1>
        <p className="text-gray-600 mb-8">
          Informativa ai sensi degli artt. 13 e 14 del Regolamento UE 2016/679 (GDPR) per chi
          utilizza il sito baddriversofitaly.it. Per le condizioni di utilizzo del materiale
          inviato vedi la pagina{' '}
          <Link href="/termini" className="text-blue-600 underline">Termini di utilizzo</Link>.
        </p>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">1. Titolare del trattamento</h2>
          <p className="text-gray-700">
            Il titolare del trattamento è Sicurisullastrada. Per qualsiasi richiesta relativa ai
            tuoi dati puoi scrivere a{' '}
            <a href="mailto:feedback@baddriversofitaly.it" className="text-blue-600 underline">
              feedback@baddriversofitaly.it
            </a>
            .
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">2. Quali dati raccogliamo</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>
              <strong>Invio di video:</strong> email, nickname (facoltativo), località e
              provincia, eventuali note, il file video e il suo nome, data e ora dell&apos;invio.
            </li>
            <li>
              <strong>Modulo di contatto e segnalazioni:</strong> nome o nickname, email,
              messaggio ed eventuale screenshot allegato.
            </li>
            <li>
              <strong>Dati presenti nei video:</strong> i filmati possono riprendere veicoli,
              targhe o persone. Per questo ci riserviamo di oscurare o tagliare tali elementi
              secondo i criteri della pagina{' '}
              <Link href="/info" className="text-blue-600 underline">Info & Regole</Link>.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">3. Perché usiamo i dati e su quale base</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>
              Valutare e, se selezionato, pubblicare il video inviato, e comunicare con te
              (inviarti la conferma di ricezione, rispondere a messaggi e segnalazioni): è
              necessario per dare seguito alla tua richiesta e si basa sul tuo consenso, che
              dai spuntando le caselle prima dell&apos;invio.
            </li>
            <li>
              Tenere un registro interno dei materiali ricevuti, per gestire la selezione,
              evitare duplicati e rispondere a eventuali richieste di rimozione: si basa sul
              legittimo interesse del titolare.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">4. Per quanto tempo conserviamo i dati</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>
              <strong>File video:</strong> vengono eliminati dopo la valutazione. Se il video
              viene selezionato e pubblicato, resta sui canali di Bad Drivers of Italy fino a
              una tua richiesta di rimozione.
            </li>
            <li>
              <strong>Registro dei materiali ricevuti</strong> (numero progressivo, nickname,
              località, nome del file, email, classificazione): conservato per il tempo
              necessario alla gestione del progetto e delle eventuali richieste degli
              interessati.
            </li>
            <li>
              <strong>Messaggi e segnalazioni:</strong> per il tempo necessario a rispondere e
              gestire la richiesta.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">5. Chi tratta i dati per nostro conto</h2>
          <p className="text-gray-700 mb-2">
            Per far funzionare il sito ci affidiamo a fornitori che trattano i dati solo per
            conto nostro:
          </p>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>Supabase: database e archiviazione dei file inviati;</li>
            <li>Vercel: hosting del sito;</li>
            <li>Resend: invio delle email di conferma, contatto e segnalazione.</li>
          </ul>
          <p className="text-gray-700 mt-2">
            Alcuni di questi fornitori possono avere sedi fuori dallo Spazio Economico Europeo e
            operano con le garanzie previste dal GDPR. I dati non vengono venduti né ceduti a
            terzi per finalità commerciali.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">6. Cookie</h2>
          <p className="text-gray-700">
            Questo sito utilizza solo cookie tecnici, necessari al funzionamento (ad esempio
            l&apos;accesso all&apos;area riservata). Non usiamo cookie di profilazione né
            strumenti di analisi o di tracciamento di terze parti, quindi non è richiesto un
            banner di consenso. I link ai nostri profili social (YouTube, Instagram, Facebook,
            LinkedIn) portano a siti esterni, che hanno proprie informative.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">7. I tuoi diritti</h2>
          <p className="text-gray-700">
            Puoi chiedere in ogni momento l&apos;accesso ai tuoi dati, la rettifica, la
            cancellazione, la limitazione del trattamento, la portabilità e opporti al
            trattamento. Puoi anche revocare il consenso, senza effetti sul trattamento già
            avvenuto, e chiedere la rimozione di un video già pubblicato. Scrivi a{' '}
            <a href="mailto:feedback@baddriversofitaly.it" className="text-blue-600 underline">
              feedback@baddriversofitaly.it
            </a>{' '}
            o usa il{' '}
            <Link href="/contatti" className="text-blue-600 underline">modulo di contatto</Link>.
            Hai inoltre il diritto di presentare reclamo al Garante per la protezione dei dati
            personali (garanteprivacy.it).
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">8. Aggiornamenti</h2>
          <p className="text-gray-700">
            Questa informativa può essere aggiornata. La versione in vigore è sempre quella
            pubblicata in questa pagina.
          </p>
        </section>

        <p className="text-center text-sm text-gray-500 mt-8">
          Hai bisogno di ulteriori informazioni?{' '}
          <Link href="/contatti" className="text-blue-600 underline">Contattaci</Link>
        </p>
      </div>

      <div className="max-w-2xl mx-auto mt-6">
        <p className="text-center text-xs text-[#123769]/70 mb-2">Seguici su</p>
        <SocialIcons variant="dark" />
      </div>
    </main>
  )
}
