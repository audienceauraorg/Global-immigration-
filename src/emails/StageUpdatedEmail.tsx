import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface StageUpdatedEmailProps {
  clientName: string
  newStage: string
  programName: string
  country: string
  portalUrl: string
  siteName: string
}

export function StageUpdatedEmail({
  clientName,
  newStage,
  programName,
  country,
  portalUrl,
  siteName,
}: StageUpdatedEmailProps) {
  return (
    <Html>
      <Head>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');`}</style>
      </Head>
      <Preview>Your {country} immigration application has moved to the {newStage} stage.</Preview>
      <Body style={body}>
        <Container style={container}>

          <div style={logoHeader}>
            <Img
              src="https://www.immigrationdepot.online/wp-content/uploads/2020/06/logo_dark-300x82.png"
              alt="The Immigration Depot"
              width={180}
              style={{ display: 'block', margin: '0 auto', height: 'auto' }}
            />
          </div>

          <div style={titleBar}>
            <Text style={titleText}>Application Update</Text>
            <Text style={titleSub}>Your {programName} application has a new status</Text>
          </div>

          <div style={bodySection}>
            <Text style={text}>Hi <strong style={{ color: '#0B1C3A' }}>{clientName}</strong>,</Text>
            <Text style={text}>
              Your immigration application for <strong>{programName}</strong> ({country}) has been
              updated to the following stage:
            </Text>

            <Section style={stageBox}>
              <Text style={stageName}>{newStage}</Text>
            </Section>

            <Text style={text}>
              Log in to your client portal to see your full checklist, document statuses, and
              important dates.
            </Text>

            <Section style={{ textAlign: 'center' as const, marginTop: '24px' }}>
              <Button href={portalUrl} style={button}>View My Application</Button>
            </Section>
          </div>

          <div style={footer}>
            <div style={{ marginBottom: '10px' }}>
              <a href="https://wa.me/12368799173" style={waButton}>
                WhatsApp: +1 (236) 879-9173
              </a>
            </div>
            <Text style={footerMeta}>
              Automated message from {siteName} &nbsp;&middot;&nbsp; Contact your consultant for questions
            </Text>
          </div>

        </Container>
      </Body>
    </Html>
  )
}

export default StageUpdatedEmail

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

const stageBox: React.CSSProperties = {
  backgroundColor: '#0B1C3A',
  borderRadius: '8px',
  padding: '18px 24px',
  margin: '20px 0',
  textAlign: 'center' as const,
}

const stageName: React.CSSProperties = {
  fontFamily: "'Poppins', Arial, sans-serif",
  color: '#C9A84C',
  fontSize: '18px',
  fontWeight: 700,
  margin: 0,
  letterSpacing: '0.5px',
}

const button: React.CSSProperties = {
  backgroundColor: '#0B1C3A',
  color: '#C9A84C',
  borderRadius: '6px',
  padding: '11px 28px',
  fontSize: '13px',
  fontWeight: 600,
  textDecoration: 'none',
  display: 'inline-block',
  fontFamily: "'Poppins', Arial, sans-serif",
  letterSpacing: '0.3px',
}

const footer: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  padding: '18px 40px',
  borderRadius: '0 0 12px 12px',
  borderTop: '1px solid #e2e8f0',
  textAlign: 'center' as const,
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
