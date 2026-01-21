import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tier1 Analytics Dashboard',
  description: 'Analytics dashboard for Tier1 app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-bg-primary text-text-primary">{children}</body>
    </html>
  )
}
