import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Text,
} from '@react-email/components'

interface DocumentSubmittedEmailProps {
  clientName: string
  clientEmail: string
  docName: string
  caseId: string
  programName: string
  adminUrl: string
  siteName: string
}

export function DocumentSubmittedEmail({
  clientName,
  clientEmail,
  docName,
  programName,
  adminUrl,
  siteName,
}: DocumentSubmittedEmailProps) {
  return (
    <Html>
      <Head>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');`}</style>
      </Head>
      <Preview>{clientName} submitted &quot;{docName}&quot; — needs review.</Preview>
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
            <Text style={titleText}>Document Submitted for Review</Text>
            <Text style={titleSub}>{siteName} &nbsp;&middot;&nbsp; Admin alert</Text>
          </div>

          <div style={bodySection}>
            <Text style={text}>
              <strong style={{ color: '#0B1C3A' }}>{clientName}</strong>{' '}
              <span style={{ color: '#64748b', fontSize: '13px' }}>({clientEmail})</span>{' '}
              has uploaded a document that requires your review:
            </Text>
            <Text style={sectionLabel}>Document Details</Text>
            <table style={table}>
              <tbody>
                <tr><td style={labelCell}>Document</td><td style={valueCell}>{docName}</td></tr>
                <tr><td style={labelCell}>Program</td><td style={valueCell}>{programName}</td></tr>
              </tbody>
            </table>
            <Text style={text}>
              Open the client&apos;s case in the admin dashboard to review, approve, or reject the
              submission.
            </Text>
            <Button href={adminUrl} style={button}>Go to Admin Dashboard</Button>
          </div>

          <div style={footer}>
            <Text style={footerMeta}>
              Automated notification &nbsp;&middot;&nbsp; {siteName}
            </Text>
          </div>

        </Container>
      </Body>
    </Html>
  )
}

export default DocumentSubmittedEmail

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

const sectionLabel: React.CSSProperties = {
  fontFamily: "'Poppins', Arial, sans-serif",
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.8px',
  color: '#C9A84C',
  margin: '0 0 10px',
}

const text: React.CSSProperties = {
  fontFamily: "'Poppins', Arial, sans-serif",
  color: '#374151',
  fontSize: '14px',
  lineHeight: '1.7',
  margin: '0 0 16px',
}

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  border: '1.5px solid #e2e8f0',
  borderRadius: '8px',
  marginBottom: '24px',
}

const labelCell: React.CSSProperties = {
  padding: '11px 14px',
  fontFamily: "'Poppins', Arial, sans-serif",
  fontSize: '13px',
  color: '#64748b',
  fontWeight: 600,
  width: '120px',
  borderBottom: '1px solid #f1f5f9',
  backgroundColor: '#fafbfc',
}

const valueCell: React.CSSProperties = {
  padding: '11px 14px',
  fontFamily: "'Poppins', Arial, sans-serif",
  fontSize: '13px',
  color: '#1e293b',
  borderBottom: '1px solid #f1f5f9',
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
