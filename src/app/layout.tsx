import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '由щ????щ·??| YouTube Data Crawler',
  description: '?좏뒠釉??곗씠?곕? ?쎄쾶 ?섏쭛?섍퀬 遺꾩꽍?섏꽭??,
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