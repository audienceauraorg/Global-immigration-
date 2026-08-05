import type { Metadata } from 'next'
import { Poppins, Quicksand } from 'next/font/google'
import { Toaster } from 'sonner'
import MessengerButton from '@/components/MessengerButton'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-quicksand',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Global Immigration Hub',
  description: 'CICC regulated immigration consultants — expert guidance for Canada immigration, SINP, Express Entry, Work Permits, and more.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${quicksand.variable}`}>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0B1C3A',
              color: '#fff',
              border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: '12px',
              fontFamily: 'var(--font-poppins), Poppins, system-ui, sans-serif',
            },
          }}
        />
        <MessengerButton />
      </body>
    </html>
  )
}
