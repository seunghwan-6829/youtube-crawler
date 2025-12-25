import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Reboot Crawler | YouTube Data Crawler',
  description: 'Collect and analyze YouTube data easily',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='ko'>
      <body className='min-h-screen'>
        {children}
      </body>
    </html>
  )
}