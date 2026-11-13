import { NextRequest, NextResponse } from 'next/server'

// I nomi dei file li sceglie l'utente: vanno "ripuliti" prima di finire nell'HTML dell'email
function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(request: NextRequest) {
  try {
    const { email, fileNames } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email mancante' }, { status: 400 })
    }

    // Elenco clip ricevute (massimo 10 nomi, ciascuno accorciato se troppo lungo)
    const safeNames: string[] = Array.isArray(fileNames)
      ? fileNames
          .filter((n: unknown): n is string => typeof n === 'string' && n.trim().length > 0)
          .slice(0, 10)
          .map((n: string) => escapeHtml(n.length > 120 ? `${n.slice(0, 117)}...` : n))
      : []

    const filesBlock =
      safeNames.length > 0
        ? `<tr>
                  <td align="center" style="padding-bottom: 22px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(255,255,255,0.12); border-radius:10px;">
                      <tr>
                        <td style="padding: 12px 16px;">
                          <span style="color:rgba(255,255,255,0.85); font-size:12px; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px; font-family: Arial, Helvetica, sans-serif;">${safeNames.length === 1 ? 'Clip ricevuta' : 'Clip ricevute'}</span>
                          ${safeNames
                            .map(
                              (n) =>
                                `<div style="color:#FFFFFF; font-size:14px; line-height:1.5; padding-top:6px; word-break:break-all; font-family: Arial, Helvetica, sans-serif;">&bull; ${n}</div>`
                            )
                            .join('')}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`
        : ''

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bad Drivers of Italy <no-reply@baddriversofitaly.it>',
        to: [email],
        subject: 'Abbiamo ricevuto il tuo materiale!',
        html: `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Grazie per il tuo contributo a Bad Drivers of Italy</title>
</head>
<body style="margin:0; padding:0; background-color:#EEF1F5; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EEF1F5;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="100%" style="max-width:520px;" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <img src="https://baddriversofitaly.it/logo.png" width="220" alt="Bad Drivers of Italy" style="display:block; width:220px; max-width:60%; height:auto; border:0;" />
            </td>
          </tr>
          <tr>
            <td style="background-color:#1B4B93; border:4px solid #FFFFFF; border-radius:16px; padding: 32px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <span style="display:inline-block; width:56px; height:56px; background-color:#FFFFFF; border-radius:50%; text-align:center; line-height:56px; font-size:28px; color:#1B4B93; font-weight:bold;">&#10003;</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 18px;">
                    <span style="color:#FFFFFF; font-size:20px; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px; line-height:1.3; font-family: Arial, Helvetica, sans-serif;">Grazie per il tuo contributo<br />a Bad Drivers of Italy!</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 14px;">
                    <span style="color:#FFFFFF; font-size:15px; line-height:1.6; font-family: Arial, Helvetica, sans-serif;">Abbiamo ricevuto il tuo materiale e lo analizzeremo a breve.</span>
                  </td>
                </tr>
                ${filesBlock}
                <tr>
                  <td align="center" style="padding-bottom: 22px;">
                    <span style="color:#FFFFFF; font-size:15px; line-height:1.6; font-family: Arial, Helvetica, sans-serif;">Tempi e modalità di selezione sono consultabili nella pagina <a href="https://baddriversofitaly.it/info" style="color:#FFFFFF; font-weight:bold; text-decoration:underline;">Info &amp; Regole</a>.</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 18px;">
                    <hr style="border:none; border-top:1px solid rgba(255,255,255,0.3); margin:0;" />
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <span style="color:rgba(255,255,255,0.85); font-size:13px; line-height:1.6; font-family: Arial, Helvetica, sans-serif;">Se hai bisogno, puoi contattarci attraverso il <a href="https://baddriversofitaly.it/contatti" style="color:#FFFFFF; font-weight:bold; text-decoration:underline;">form di contatto</a>.</span>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <span style="color:#FFFFFF; font-size:15px; font-weight:bold; font-family: Arial, Helvetica, sans-serif;">Buona strada!</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 20px;">
              <span style="color:#123769; opacity:0.6; font-size:11px; font-family: Arial, Helvetica, sans-serif;">Bad Drivers of Italy — baddriversofitaly.it</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
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
