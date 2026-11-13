import Link from 'next/link'
import SocialIcons from '../components/SocialIcons'

export default function InfoPage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 md:p-8">
        <Link href="/" className="text-sm text-blue-600 underline">
          &larr; Torna alla pagina di invio
        </Link>

        <h1 className="text-2xl font-semibold mt-4 mb-2">Regole e informazioni sulle clip</h1>
        <p className="text-gray-600 mb-8">
          Qui trovi info e regole utili per quanto riguarda le clip che vengono pubblicate.
        </p>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">Selezione</h2>
          <p className="text-gray-700">
            Inviare le clip non vuol dire vederle caricate nel video successivo: tutte le clip
            ricevute sono soggette a selezione di un insegnante di scuola guida. Vengono
            pubblicati il 20-25% dei video che riceviamo. Se vuoi vedere tutte le tue clip
            pubblicate, ti consigliamo di aprire un tuo canale.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">Tempo di pubblicazione</h2>
          <p className="text-gray-700">
            Se il video viene selezionato, il tempo dal caricamento alla pubblicazione va da 1 a
            3 mesi, a seconda di quante clip riceve il canale in quel periodo.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">Consigli per la tua privacy</h2>
          <p className="text-gray-700 mb-2">
            Per tutelare la tua privacy ed evitare inconvenienti, ti sconsigliamo di inviare clip
            nei seguenti casi:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>ingressi della tua casa/azienda visibili;</li>
            <li>
              audio con conversazioni private oppure altre persone presenti in auto non a
              conoscenza della dashcam;
            </li>
            <li>incidenti/episodi per cui sono in corso cause legali o accertamenti assicurativi.</li>
          </ul>
          <p className="text-gray-700 mt-2">
            Lo staff modifica sempre le clip escludendo dall&apos;inquadratura tutte le
            informazioni in sovrimpressione (data, ora, targa, GPS ecc.). Per legge vengono
            inoltre censurate le targhe dei veicoli in movimento coinvolti nelle scene riprese,
            oltre ai volti riconoscibili e ai loghi presenti sui mezzi commerciali.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">Criteri di esclusione</h2>
          <p className="text-gray-700 mb-2">
            Salvo casi di pericolo imminente, le clip riguardanti le seguenti situazioni non
            vengono pubblicate perché troppo frequenti:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>incidenti già avvenuti con soccorritori sul posto, o dove non ci si ferma per aiutare;</li>
            <li>striscia continua con visibilità e senza veicoli in senso opposto (solo extraurbane);</li>
            <li>precedenze in rotonda;</li>
            <li>ciclisti che fanno cose (doppia fila, attraversare in sella, contromano...);</li>
            <li>curve strette/allargate in senso opposto;</li>
            <li>attraversamenti con il rosso in assenza di altri veicoli o pedoni;</li>
            <li>corsia di emergenza, senza cartelli oltre i 500 mt dalla prima uscita;</li>
            <li>animali sgranati o poco visibili (salvo fauna selvatica rara).</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">Altri motivi di esclusione</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>video registrati con il cellulare invece che con una dashcam;</li>
            <li>chi registra commette infrazioni (velocità, precedenza, guida pericolosa...);</li>
            <li>censura di targhe o volti troppo complessa;</li>
            <li>durata troppo breve (meno di 6 secondi);</li>
            <li>qualità video bassa o filmato instabile;</li>
            <li>segnaletica assente che non permette di capire la dinamica;</li>
            <li>inquadratura o settaggio scorretto della dashcam;</li>
            <li>modifiche invasive come scritte o animazioni.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">Nickname</h2>
          <p className="text-gray-700 mb-2">Il nickname viene modificato per la pubblicazione se risulta:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>ambiguo oppure offensivo;</li>
            <li>un marchio o slogan pubblicitario;</li>
            <li>troppo lungo;</li>
            <li>una sequenza casuale di lettere e numeri.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">Commenti</h2>
          <p className="text-gray-700">
            Lo staff revisiona quotidianamente i commenti, rimuovendo quelli con offese razziali,
            etniche o geografiche, incitamenti alla violenza, iniziative pubblicitarie non
            richieste, o mancanza di rispetto verso chi registra le clip o verso il lavoro del
            canale. Se un commento andrebbe rimosso, o se un tuo commento è stato rimosso senza
            apparente motivo, contattaci indicando il video interessato.
          </p>
        </section>

        <p className="text-center text-sm text-gray-500 mt-8">
          Hai bisogno di ulteriori informazioni?{' '}
          <Link href="/contatti" className="text-blue-600 underline">Contattaci</Link>
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          Hai un consiglio o hai trovato un problema?{' '}
          <Link href="/feedback" className="text-blue-600 underline">Segnalacelo</Link>
        </p>
      </div>

      <div className="max-w-2xl mx-auto mt-6">
        <p className="text-center text-xs text-[#123769]/70 mb-2">Seguici su</p>
        <SocialIcons variant="dark" />
      </div>
    </main>
  )
}
