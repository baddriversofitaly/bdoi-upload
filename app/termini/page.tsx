import Link from 'next/link'

export default function TerminiPage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 md:p-8">
        <Link href="/" className="text-sm text-blue-600 underline">
          &larr; Torna alla pagina di invio
        </Link>

        <h1 className="text-2xl font-semibold mt-4 mb-2">Termini di utilizzo del materiale inviato</h1>
        <p className="text-gray-600 mb-8">
          Prima di inviare un video, leggi con attenzione a cosa acconsenti. Per le regole
          editoriali su cosa viene pubblicato o escluso, vedi la pagina{' '}
          <Link href="/info" className="text-blue-600 underline">Info & Regole</Link>.
        </p>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">1. Proprietà e diritti d&apos;uso</h2>
          <p className="text-gray-700">
            Inviando un video dichiari di esserne il proprietario o comunque di avere il diritto
            di condividerlo, e che il contenuto non viola diritti di terzi (copyright, privacy o
            altro). Con l&apos;invio concedi a Bad Drivers of Italy una licenza gratuita, non
            esclusiva, a utilizzare, modificare e pubblicare il filmato secondo quanto descritto
            in questi termini.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">2. Finalità di utilizzo</h2>
          <p className="text-gray-700">
            I video selezionati potranno essere pubblicati sui canali di Bad Drivers of Italy e
            utilizzati anche per finalità didattiche, ad esempio come materiale di
            sensibilizzazione su comportamenti stradali e sicurezza alla guida.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">3. Modifiche ai contenuti</h2>
          <p className="text-gray-700">
            Ci riserviamo il diritto di modificare, tagliare o censurare i filmati (ad esempio
            targhe, volti, loghi, dati sovraimpressi) secondo i criteri indicati nella pagina
            Info & Regole, e di decidere in autonomia se e quando pubblicarli.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">4. Nessun obbligo di pubblicazione</h2>
          <p className="text-gray-700">
            L&apos;invio di un video non garantisce che venga pubblicato. La selezione avviene
            secondo i criteri editoriali descritti nella pagina Info & Regole.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">5. Compenso</h2>
          <p className="text-gray-700">
            Salvo diversi accordi scritti, l&apos;invio del video è a titolo gratuito e non dà
            diritto ad alcun compenso economico.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">6. Responsabilità sui contenuti</h2>
          <p className="text-gray-700">
            Sei l&apos;unico responsabile del contenuto che invii. Inviando il video dichiari che
            non viola leggi vigenti, diritti di terzi o obblighi di riservatezza, e sollevi Bad
            Drivers of Italy da qualsiasi responsabilità derivante da dichiarazioni non
            veritiere su questi punti.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">7. Richiesta di rimozione</h2>
          <p className="text-gray-700">
            Se un tuo video è già stato pubblicato e desideri richiederne la rimozione, puoi
            contattarci tramite la pagina Contattaci, indicando il video interessato. Valuteremo
            la richiesta caso per caso.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">8. Dati personali</h2>
          <p className="text-gray-700">
            I dati raccolti con l&apos;invio (nickname, località, email) vengono utilizzati solo
            per gestire la selezione e il contatto relativo al tuo filmato, e non vengono
            pubblicati insieme al video salvo tuo consenso esplicito.
          </p>
        </section>
      </div>
    </main>
  )
}
