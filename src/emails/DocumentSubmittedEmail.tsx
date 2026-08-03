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
      <Head />
      <Preview>{clientName} submitted "{docName}" — needs review.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>{siteName} — Admin Alert</Heading>
          <Hr style={hr} />
          <Heading as="h2" style={h2}>Document Submitted for Review</Heading>
          <Text style={text}>
            <strong>{clientName}</strong> ({clientEmail}) has uploaded a document that requires
            your review:
          </Text>
          <table style={table}>
            <tbody>
              <tr>
                <td style={labelCell}>Document</td>
                <td style={valueCell}>{docName}</td>
              </tr>
              <tr>
                <td style={labelCell}>Program</td>
                <td style={valueCell}>{programName}</td>
              </tr>
            </tbody>
          </table>
          <Text style={text}>
            Open the client&apos;s case in the admin dashboard to review, approve, or reject the
            submission.
          </Text>
          <Button href={adminUrl} style={button}>Go to Admin Dashboard</Button>
          <Hr style={hr} />
          <Text style={footer}>
            Automated notification from {siteName}. Do not reply to this email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default DocumentSubmittedEmail

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
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 16px',
}

const h2: React.CSSProperties = {
  color: '#0B1C3A',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 20px',
}

const text: React.CSSProperties = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 16px',
}

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: '#f9fafb',
  borderRadius: '6px',
  margin: '16px 0 24px',
}

const labelCell: React.CSSProperties = {
  padding: '10px 16px',
  fontSize: '13px',
  color: '#6b7280',
  fontWeight: '600',
  width: '120px',
  borderBottom: '1px solid #e5e7eb',
}

const valueCell: React.CSSProperties = {
  padding: '10px 16px',
  fontSize: '14px',
  color: '#111827',
  borderBottom: '1px solid #e5e7eb',
}

const button: React.CSSProperties = {
  backgroundColor: '#0B1C3A',
  color: '#C9A84C',
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
