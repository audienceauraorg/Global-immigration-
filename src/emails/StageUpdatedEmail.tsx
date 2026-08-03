import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
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
      <Head />
      <Preview>Your {country} immigration application has moved to the {newStage} stage.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>{siteName}</Heading>
          <Hr style={hr} />
          <Heading as="h2" style={h2}>Application Update</Heading>
          <Text style={text}>Hi {clientName},</Text>
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
          <Section style={{ textAlign: 'center', marginTop: '24px' }}>
            <Button href={portalUrl} style={button}>View My Application</Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            This is an automated message from {siteName}. If you have questions, please contact
            your consultant directly.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default StageUpdatedEmail

const body: React.CSSProperties = {
  backgroundColor: '#f4f6f9',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container: React.CSSProperties = {
  maxWidth: '560px',
  margin: '40px auto',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '40px',
}

const h1: React.CSSProperties = {
  color: '#0B1C3A',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 16px',
}

const h2: React.CSSProperties = {
  color: '#0B1C3A',
  fontSize: '22px',
  fontWeight: '600',
  margin: '0 0 20px',
}

const text: React.CSSProperties = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 16px',
}

const stageBox: React.CSSProperties = {
  backgroundColor: '#0B1C3A',
  borderRadius: '6px',
  padding: '16px 24px',
  margin: '24px 0',
  textAlign: 'center',
}

const stageName: React.CSSProperties = {
  color: '#C9A84C',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0',
  letterSpacing: '0.5px',
}

const button: React.CSSProperties = {
  backgroundColor: '#C9A84C',
  color: '#0B1C3A',
  borderRadius: '6px',
  padding: '12px 28px',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
}

const hr: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const footer: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '0',
}
