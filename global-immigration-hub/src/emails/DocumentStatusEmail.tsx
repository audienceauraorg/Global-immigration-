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

interface DocumentStatusEmailProps {
  clientName: string
  docName: string
  status: 'approved' | 'rejected'
  rejectionNote?: string
  programName: string
  portalUrl: string
  siteName: string
}

export function DocumentStatusEmail({
  clientName,
  docName,
  status,
  rejectionNote,
  programName,
  portalUrl,
  siteName,
}: DocumentStatusEmailProps) {
  const isApproved = status === 'approved'

  return (
    <Html>
      <Head />
      <Preview>
        {isApproved
          ? `Your document "${docName}" has been approved.`
          : `Action required: "${docName}" needs to be resubmitted.`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>{siteName}</Heading>
          <Hr style={hr} />
          <Heading as="h2" style={h2}>
            {isApproved ? 'Document Approved' : 'Document Requires Resubmission'}
          </Heading>
          <Text style={text}>Hi {clientName},</Text>
          {isApproved ? (
            <Text style={text}>
              Good news — your <strong>{docName}</strong> for <strong>{programName}</strong> has
              been reviewed and approved.
            </Text>
          ) : (
            <>
              <Text style={text}>
                Your <strong>{docName}</strong> for <strong>{programName}</strong> could not be
                accepted and needs to be resubmitted.
              </Text>
              {rejectionNote && (
                <Section style={noteBox}>
                  <Text style={noteLabel}>Reason from your consultant:</Text>
                  <Text style={noteText}>{rejectionNote}</Text>
                </Section>
              )}
              <Text style={text}>
                Please log in to your portal, locate the document in your checklist, and upload a
                replacement file.
              </Text>
            </>
          )}
          <Section style={{ textAlign: 'center', marginTop: '24px' }}>
            <Button href={portalUrl} style={button}>
              {isApproved ? 'View My Application' : 'Resubmit Document'}
            </Button>
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

export default DocumentStatusEmail

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

const noteBox: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '6px',
  padding: '16px',
  margin: '16px 0',
}

const noteLabel: React.CSSProperties = {
  color: '#991b1b',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  margin: '0 0 8px',
}

const noteText: React.CSSProperties = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
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
