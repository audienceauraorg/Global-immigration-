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

interface NewClientEmailProps {
  clientName: string
  clientEmail: string
  programName: string
  clientId: string
  source: 'self-registered' | 'admin-created'
  adminUrl: string
  siteName: string
}

export function NewClientEmail({
  clientName,
  clientEmail,
  programName,
  source,
  adminUrl,
  siteName,
}: NewClientEmailProps) {
  const isNew = source === 'self-registered'

  return (
    <Html>
      <Head />
      <Preview>
        {isNew ? `New client self-registered: ${clientName}` : `New client added: ${clientName}`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>{siteName} — Admin Alert</Heading>
          <Hr style={hr} />
          <Heading as="h2" style={h2}>
            {isNew ? 'New Client Registration' : 'New Client Added'}
          </Heading>
          <Text style={text}>
            {isNew
              ? 'A new client has self-registered through the client portal:'
              : 'A new client has been added to the system:'}
          </Text>
          <table style={table}>
            <tbody>
              <tr>
                <td style={labelCell}>Name</td>
                <td style={valueCell}>{clientName}</td>
              </tr>
              <tr>
                <td style={labelCell}>Email</td>
                <td style={valueCell}>{clientEmail}</td>
              </tr>
              <tr>
                <td style={labelCell}>Program</td>
                <td style={valueCell}>{programName}</td>
              </tr>
              <tr>
                <td style={labelCell}>Source</td>
                <td style={valueCell}>{isNew ? 'Self-registered' : 'Admin-created'}</td>
              </tr>
            </tbody>
          </table>
          {isNew && (
            <Text style={text}>
              Review their case in the admin dashboard to verify their program selection and begin
              the document collection process.
            </Text>
          )}
          <Button href={adminUrl} style={button}>View Client in Dashboard</Button>
          <Hr style={hr} />
          <Text style={footer}>
            Automated notification from {siteName}. Do not reply to this email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default NewClientEmail

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
