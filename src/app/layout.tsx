import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OneTeam - Soccer Training Management',
  description: 'Manage private soccer training sessions, bookings, and player development with ease',
  keywords: ['soccer', 'training', 'coaching', 'sports', 'management'],
  authors: [{ name: 'OneTeam' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
          {children}
        </div>
      </body>
    </html>
  )
}