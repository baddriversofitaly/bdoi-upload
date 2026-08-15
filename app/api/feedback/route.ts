import { NextRequest, NextResponse } from 'next/server'

const MAX_ATTACHMENT_MB = 8

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const type = formData.get('type') as string | null
    const description = formData.get('description') as string | null
    const email = formData.get('email') as string | null
    const screenshot = formData.get('screenshot') as File | null

    if (!description || !email) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 })
    }

    const attachments: { filename: string; content: string }[] = []

    if (screenshot && screenshot.size > 0) {
      if (screenshot.size > MAX_ATTACHMENT_MB * 1024 * 1024) {
        return NextResponse.json({ error: 'Screenshot troppo grande' }, { status: 400 })
      }
      const buffer = Buffer.from(await screenshot.arrayBuffer())
      attachments.push({
        filename: screenshot.name || 'screenshot.png',
        content: buffer.toString('base64'),
      })
    }

    const typeLabel =
      type === 'bug' ? 'Bug / malfunzionamento' : type === 'suggerimento' ? 'Suggerimento' : 'Altro'

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bad Drivers of Italy <no-reply@baddriversofitaly.it>',
        to: ['feedback@baddriversofitaly.it'],
        reply_to: email,
        subject: `Nuova segnalazione: ${typeLabel}`,
        text: `Tipo: ${typeLabel}\nEmail: ${email}\n\nDescrizione:\n${description}`,
        attachments: attachments.length > 0 ? attachments : undefined,
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
