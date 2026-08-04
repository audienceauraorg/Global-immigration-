import type { Metadata } from 'next'
import { Poppins, Quicksand } from 'next/font/google'
import { Toaster } from 'sonner'
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
        {/* Floating Messenger button */}
        <a
          href="https://m.me/327884021233501"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on Messenger"
          style={{
            position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'linear-gradient(135deg,#0084ff,#00c6ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,132,255,0.45)', textDecoration: 'none',
          }}
        >
          <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.906 1.377 5.504 3.538 7.24V22l3.332-1.83c.89.246 1.833.378 2.13.378 5.522 0 10-4.144 10-9.305C21 6.145 17.523 2 12 2zm1.008 12.535-2.548-2.718-4.976 2.718 5.474-5.813 2.612 2.718 4.91-2.718-5.472 5.813z"/>
          </svg>
        </a>
      </body>
    </html>
  )
}
