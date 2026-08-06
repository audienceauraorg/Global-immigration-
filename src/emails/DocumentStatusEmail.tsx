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
      <Head>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');`}</style>
      </Head>
      <Preview>
        {isApproved
          ? `Your document "${docName}" has been approved.`
          : `Action required: "${docName}" needs to be resubmitted.`}
      </Preview>
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
            <Text style={titleText}>
              {isApproved ? 'Document Approved' : 'Action Required'}
            </Text>
            <Text style={titleSub}>
              {isApproved ? 'Great news — your document passed review' : 'Your document needs to be resubmitted'}
            </Text>
          </div>

          <div style={bodySection}>
            <Text style={text}>Hi <strong style={{ color: '#0B1C3A' }}>{clientName}</strong>,</Text>

            {isApproved ? (
              <Text style={text}>
                Good news — your <strong>{docName}</strong> for <strong>{programName}</strong> has
                been reviewed and approved. Keep up the great work!
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

            <Section style={{ textAlign: 'center' as const, marginTop: '24px' }}>
              <Button href={portalUrl} style={button}>
                {isApproved ? 'View My Application' : 'Resubmit Document'}
              </Button>
            </Section>
          </div>

          <div style={footer}>
            <Text style={footerMeta}>
              Automated message from {siteName} &nbsp;&middot;&nbsp; Contact your consultant for questions
            </Text>
          </div>

        </Container>
      </Body>
    </Html>
  )
}

export default DocumentStatusEmail

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

const noteBox: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  border: '1.5px solid #fecaca',
  borderLeft: '4px solid #ef4444',
  borderRadius: '8px',
  padding: '14px 18px',
  margin: '0 0 16px',
}

const noteLabel: React.CSSProperties = {
  fontFamily: "'Poppins', Arial, sans-serif",
  color: '#991b1b',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.8px',
  margin: '0 0 6px',
}

const noteText: React.CSSProperties = {
  fontFamily: "'Poppins', Arial, sans-serif",
  color: '#374151',
  fontSize: '13px',
  lineHeight: '1.6',
  margin: 0,
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
