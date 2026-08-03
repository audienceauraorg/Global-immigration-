import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
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
      <Head />
      <Preview>Welcome to {siteName} — your client portal is ready</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <div style={header}>
            <div style={logoText}>{siteName}</div>
            <div style={logoSub}>Client Portal</div>
          </div>

          {/* Body */}
          <Heading style={h1}>Welcome, {firstName}!</Heading>

          <Text style={text}>
            Your enrollment has been confirmed and your client portal is now active. We&apos;re
            excited to support you through your Canadian immigration journey.
          </Text>

          {programName !== 'Not selected' && (
            <div style={programBadge}>
              <span style={programLabel}>Your Program</span>
              <span style={programName_}>{programName}</span>
            </div>
          )}

          <Text style={text}>
            Use the button below to log in to your portal. Your login email is{' '}
            <strong>{clientEmail}</strong>. Use the password you created during registration.
          </Text>

          <div style={{ textAlign: 'center' as const, margin: '32px 0' }}>
            <Button href={portalUrl} style={button}>
              Access Your Portal →
            </Button>
          </div>

          <Hr style={hr} />

          {/* What to expect */}
          <Heading as="h2" style={h2}>What happens next?</Heading>

          <div style={stepList}>
            <div style={step}>
              <span style={stepNum}>1</span>
              <div>
                <strong style={stepTitle}>Review your document checklist</strong>
                <Text style={stepDesc}>
                  Log in and head to the Documents section to see exactly what we need from you to
                  get started.
                </Text>
              </div>
            </div>
            <div style={step}>
              <span style={stepNum}>2</span>
              <div>
                <strong style={stepTitle}>Upload your documents</strong>
                <Text style={stepDesc}>
                  You can upload documents directly through your portal at any time. Our team will
                  review each one and notify you of the status.
                </Text>
              </div>
            </div>
            <div style={step}>
              <span style={stepNum}>3</span>
              <div>
                <strong style={stepTitle}>Track your progress</strong>
                <Text style={stepDesc}>
                  Your portal shows a real-time progress tracker so you always know where your
                  application stands.
                </Text>
              </div>
            </div>
          </div>

          <Hr style={hr} />

          <Text style={text}>
            If you have any questions, reply to this email or reach out to your consultant directly.
            We&apos;re here to help.
          </Text>

          <Text style={footer}>
            — The {siteName} Team
            <br />
            <br />
            This email was sent to {clientEmail} because you registered for a client account.
            Please keep your login credentials safe.
          </Text>

        </Container>
      </Body>
    </Html>
  )
}

export default WelcomeEmail

// ── Styles ────────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: '#EEF0F6',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container: React.CSSProperties = {
  maxWidth: '580px',
  margin: '40px auto',
  backgroundColor: '#ffffff',
  borderRadius: '10px',
  overflow: 'hidden',
}

const header: React.CSSProperties = {
  backgroundColor: '#0B1C3A',
  padding: '28px 40px',
}

const logoText: React.CSSProperties = {
  color: '#C9A84C',
  fontSize: '20px',
  fontWeight: '700',
  letterSpacing: '-0.02em',
}

const logoSub: React.CSSProperties = {
  color: 'rgba(255,255,255,0.45)',
  fontSize: '11px',
  fontWeight: '600',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  marginTop: '2px',
}

const h1: React.CSSProperties = {
  color: '#0B1C3A',
  fontSize: '24px',
  fontWeight: '700',
  margin: '32px 40px 8px',
}

const h2: React.CSSProperties = {
  color: '#0B1C3A',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 40px 16px',
}

const text: React.CSSProperties = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '1.65',
  margin: '0 40px 16px',
}

const programBadge: React.CSSProperties = {
  background: '#F0F4FF',
  border: '1px solid #C7D2FE',
  borderRadius: '8px',
  padding: '14px 20px',
  margin: '0 40px 20px',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '2px',
}

const programLabel: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: '#6366F1',
}

const programName_: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#1E1B4B',
  marginTop: '2px',
}

const button: React.CSSProperties = {
  backgroundColor: '#0B1C3A',
  color: '#C9A84C',
  borderRadius: '6px',
  padding: '14px 36px',
  fontSize: '15px',
  fontWeight: '700',
  textDecoration: 'none',
  display: 'inline-block',
  letterSpacing: '0.02em',
}

const hr: React.CSSProperties = {
  borderColor: '#E5E7EB',
  margin: '24px 40px',
}

const stepList: React.CSSProperties = {
  margin: '0 40px 24px',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '20px',
}

const step: React.CSSProperties = {
  display: 'flex',
  gap: '16px',
  alignItems: 'flex-start',
}

const stepNum: React.CSSProperties = {
  flexShrink: 0,
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  backgroundColor: '#C9A84C',
  color: '#0B1C3A',
  fontSize: '13px',
  fontWeight: '700',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: '28px',
  textAlign: 'center' as const,
}

const stepTitle: React.CSSProperties = {
  fontSize: '14px',
  color: '#111827',
  display: 'block',
  marginBottom: '2px',
}

const stepDesc: React.CSSProperties = {
  color: '#6B7280',
  fontSize: '13px',
  lineHeight: '1.55',
  margin: '0',
}

const footer: React.CSSProperties = {
  color: '#9CA3AF',
  fontSize: '12px',
  lineHeight: '1.6',
  margin: '0 40px 32px',
}
