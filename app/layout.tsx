import type { Metadata } from 'next'
import { Oswald, Inter } from 'next/font/google'
import Image from 'next/image'
import './globals.css'

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-oswald',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Bad Drivers of Italy — Invia le tue clip',
  description: 'Carica i tuoi filmati dashcam per Bad Drivers of Italy.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it">
      <body className={`${oswald.variable} ${inter.variable} font-sans antialiased`}>
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <Image
            src="/background.jpg"
            alt=""
            fill
            priority
            className="object-cover"
          />
        </div>
        {children}
      </body>
    </html>
  )
}
