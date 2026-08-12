import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface WelcomeEmailProps {
  clientName: string
  clientEmail: string
  programName: string
  portalUrl: string
  siteName: string
}

export function WelcomeEmail({
  clientName,
  clientEmail,
  programName,
  portalUrl,
  siteName,
}: WelcomeEmailProps) {
  const firstName = clientName.split(' ')[0]

  return (
    <Html>
      <Head>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');`}</style>
      </Head>
      <Preview>Welcome to {siteName} — your client portal is ready</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Logo header */}
          <div style={logoHeader}>
            <Img
              src="https://www.immigrationdepot.online/wp-content/uploads/2020/06/logo_dark-300x82.png"
              alt="The Immigration Depot"
              width={180}
              style={{ display: 'block', margin: '0 auto', height: 'auto' }}
            />
          </div>

          {/* Title bar */}
          <div style={titleBar}>
            <Text style={titleText}>Welcome, {firstName}!</Text>
            <Text style={titleSub}>Your client portal is now active</Text>
          </div>

          {/* Body */}
          <div style={bodySection}>

            <Text style={text}>
              Your enrollment has been confirmed and your client portal is now active. We&apos;re
              excited to support you through your Canadian immigration journey.
            </Text>

            {programName !== 'Not selected' && (
              <div style={programBadge}>
                <Text style={programLabel}>Your Program</Text>
                <Text style={programValue}>{programName}</Text>
              </div>
            )}

            <Text style={text}>
              Use the button below to log in to your portal. Your login email is{' '}
              <strong>{clientEmail}</strong>. Use the password you created during registration.
            </Text>

            <Section style={{ textAlign: 'center' as const, margin: '28px 0' }}>
              <Button href={portalUrl} style={button}>
                Access Your Portal →
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={sectionLabel}>What happens next?</Text>

            <div style={stepRow}>
              <div style={stepCircle}>1</div>
              <div>
                <Text style={stepTitle}>Review your document checklist</Text>
                <Text style={stepDesc}>
                  Log in and head to the Documents section to see exactly what we need from you to
                  get started.
                </Text>
              </div>
            </div>
            <div style={stepRow}>
              <div style={stepCircle}>2</div>
              <div>
                <Text style={stepTitle}>Upload your documents</Text>
                <Text style={stepDesc}>
                  You can upload documents directly through your portal at any time. Our team will
                  review each one and notify you of the status.
                </Text>
              </div>
            </div>
            <div style={stepRow}>
              <div style={stepCircle}>3</div>
              <div>
                <Text style={stepTitle}>Track your progress</Text>
                <Text style={stepDesc}>
                  Your portal shows a real-time progress tracker so you always know where your
                  application stands.
                </Text>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div style={footer}>
            <Text style={footerText}>
              Questions? Reply to this email or reach out to your consultant directly.
            </Text>
            <div style={{ margin: '10px 0' }}>
              <a
                href="https://wa.me/12368799173"
                style={waButton}
              >
                WhatsApp: +1 (236) 879-9173
              </a>
            </div>
            <Text style={footerMeta}>
              Sent to {clientEmail} &nbsp;&middot;&nbsp; &copy; {new Date().getFullYear()} {siteName}
            </Text>
          </div>

        </Container>
      </Body>
    </Html>
  )
}

export default WelcomeEmail

// ── Styles ────────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: '#eef0f4',
  fontFamily: "'Poppins', Arial, sans-serif",
  margin: 0,
  padding: 0,
}

const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '32px auto',
}

const logoHeader: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '24px 40px 20px',
  borderRadius: '12px 12px 0 0',
  textAlign: 'center' as const,
  borderBottom: '4px solid #C9A84C',
}

const titleBar: React.CSSProperties = {
  backgroundColor: '#0B1C3A',
  padding: '22px 40px',
}

const titleText: React.CSSProperties = {
  margin: '0 0 3px',
  fontFamily: "'Poppins', Arial, sans-serif",
  fontSize: '18px',
  fontWeight: 700,
  color: '#C9A84C',
}

const titleSub: React.CSSProperties = {
  margin: 0,
  fontFamily: "'Poppins', Arial, sans-serif",
  fontSize: '12px',
  color: '#94a3b8',
}

const bodySection: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '32px 40px',
}

const text: React.CSSProperties = {
  fontFamily: "'Poppins', Arial, sans-serif",
  color: '#374151',
  fontSize: '14px',
  lineHeight: '1.7',
  margin: '0 0 16px',
}

const programBadge: React.CSSProperties = {
  backgroundColor: '#fffbeb',
  border: '1.5px solid #fde68a',
  borderLeft: '4px solid #C9A84C',
  borderRadius: '8px',
  padding: '14px 18px',
  marginBottom: '20px',
}

const programLabel: React.CSSProperties = {
  fontFamily: "'Poppins', Arial, sans-serif",
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: '#C9A84C',
  margin: '0 0 4px',
}

const programValue: React.CSSProperties = {
  fontFamily: "'Poppins', Arial, sans-serif",
  fontSize: '15px',
  fontWeight: 600,
  color: '#0B1C3A',
  margin: 0,
}

const button: React.CSSProperties = {
  backgroundColor: '#0B1C3A',
  color: '#C9A84C',
  borderRadius: '6px',
  padding: '12px 32px',
  fontSize: '14px',
  fontWeight: 700,
  textDecoration: 'none',
  display: 'inline-block',
  fontFamily: "'Poppins', Arial, sans-serif",
  letterSpacing: '0.3px',
}

const hr: React.CSSProperties = {
  borderColor: '#e2e8f0',
  margin: '24px 0',
}

const sectionLabel: React.CSSProperties = {
  fontFamily: "'Poppins', Arial, sans-serif",
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.8px',
  color: '#C9A84C',
  margin: '0 0 14px',
}

const stepRow: React.CSSProperties = {
  display: 'flex',
  gap: '14px',
  alignItems: 'flex-start',
  marginBottom: '16px',
}

const stepCircle: React.CSSProperties = {
  flexShrink: 0,
  width: '26px',
  height: '26px',
  borderRadius: '50%',
  backgroundColor: '#0B1C3A',
  color: '#C9A84C',
  fontSize: '11px',
  fontWeight: 700,
  fontFamily: "'Poppins', Arial, sans-serif",
  lineHeight: '26px',
  textAlign: 'center' as const,
  marginTop: '2px',
}

const stepTitle: React.CSSProperties = {
  fontFamily: "'Poppins', Arial, sans-serif",
  fontSize: '13px',
  fontWeight: 600,
  color: '#0B1C3A',
  margin: '0 0 3px',
}

const stepDesc: React.CSSProperties = {
  fontFamily: "'Poppins', Arial, sans-serif",
  color: '#64748b',
  fontSize: '12px',
  lineHeight: '1.6',
  margin: 0,
}

const footer: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  padding: '20px 40px',
  borderRadius: '0 0 12px 12px',
  borderTop: '1px solid #e2e8f0',
  textAlign: 'center' as const,
}

const footerText: React.CSSProperties = {
  fontFamily: "'Poppins', Arial, sans-serif",
  fontSize: '12px',
  color: '#64748b',
  margin: '0 0 4px',
}

const footerMeta: React.CSSProperties = {
  fontFamily: "'Poppins', Arial, sans-serif",
  fontSize: '11px',
  color: '#94a3b8',
  margin: 0,
}

const waButton: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#25D366',
  color: '#ffffff',
  borderRadius: '20px',
  padding: '7px 16px',
  fontFamily: "'Poppins', Arial, sans-serif",
  fontSize: '12px',
  fontWeight: 600,
  textDecoration: 'none',
}
