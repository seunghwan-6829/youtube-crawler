import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '리부트 크롤러 | YouTube Data Crawler',
  description: '유튜브 데이터를 쉽게 수집하고 분석하세요',
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