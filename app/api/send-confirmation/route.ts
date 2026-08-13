import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email mancante' }, { status: 400 })
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bad Drivers of Italy <no-reply@baddriversofitaly.it>',
        to: [email],
        subject: 'Abbiamo ricevuto le tue clip!',
        html: `
          <div style="font-family: sans-serif; color: #123769; line-height: 1.6;">
            <p>Ciao,</p>
            <p>Grazie! Abbiamo ricevuto le tue clip e le analizzeremo a breve.</p>
            <p>
              Le pubblicheremo secondo le tempistiche riportate nella pagina
              <a href="https://baddriversofitaly.it/info" style="color:#1B4B93;">Info &amp; Regole</a>.
            </p>
            <p>Grazie per il tuo contributo a Bad Drivers of Italy!</p>
          </div>
        `,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Resend error:', errText)
      return NextResponse.json({ error: 'Invio fallito' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Invio fallito' }, { status: 500 })
  }
}
