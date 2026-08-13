import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json()

    if (!email || !message) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 })
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bad Drivers of Italy <no-reply@baddriversofitaly.it>',
        to: ['baddriversofitaly@gmail.com'],
        reply_to: email,
        subject: 'Nuovo messaggio dal form Contattaci',
        text: `Nome: ${name || 'Non specificato'}\nEmail: ${email}\n\nMessaggio:\n${message}`,
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
