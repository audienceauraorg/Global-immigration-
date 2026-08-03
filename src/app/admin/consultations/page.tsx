export const dynamic = 'force-dynamic'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { connectDB } from '@/lib/mongodb'
import { ConsultationBooking } from '@/lib/db/models'
import { CONSULTATION_FEE } from '@/lib/fees'
import { CalendarCheck, Clock, CheckCircle2, AlertCircle, Mail, Phone } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const metadata = { title: 'Consultations | Admin' }

export default async function AdminConsultationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const session = await auth()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session?.user || !['admin', 'staff'].includes((session.user as any).role)) {
    redirect('/login')
  }

  const { status } = await searchParams

  await connectDB()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {}
  if (status === 'pending')  filter.paymentStatus = 'pending'
  if (status === 'received') filter.paymentStatus = 'received'

  const bookings = await ConsultationBooking.find(filter)
    .sort({ createdAt: -1 })
    .limit(200)
    .lean()

  const totalCount    = await ConsultationBooking.countDocuments()
  const pendingCount  = await ConsultationBooking.countDocuments({ paymentStatus: 'pending' })
  const receivedCount = await ConsultationBooking.countDocuments({ paymentStatus: 'received' })

  const tierLabel = (t?: string) =>
    t === 'full_handling' ? 'Full Handling' :
    t === 'filing_only'   ? 'Filing Only'   :
    '—'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-gold" /> Consultation Bookings
          </h1>
          <p className="text-navy/50 text-sm mt-0.5">
            All consultation requests — fee: ${CONSULTATION_FEE} CAD per session
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-navy/40 uppercase tracking-wide mb-1">Total</p>
          <p className="text-2xl font-bold text-navy">{totalCount}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-1">Payment Pending</p>
          <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Receipt Received</p>
          <p className="text-2xl font-bold text-green-700">{receivedCount}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { label: 'All', value: undefined },
          { label: 'Pending',  value: 'pending'  },
          { label: 'Received', value: 'received' },
        ].map(tab => (
          <a
            key={tab.label}
            href={tab.value ? `?status=${tab.value}` : '/admin/consultations'}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              status === tab.value || (!status && !tab.value)
                ? 'bg-navy text-white'
                : 'bg-white border border-slate-200 text-navy/60 hover:border-navy/40'
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {bookings.length === 0 ? (
          <div className="p-10 text-center text-navy/40 text-sm">No bookings found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-semibold text-navy/60 text-xs uppercase tracking-wide">Client</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy/60 text-xs uppercase tracking-wide">Program / Tier</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy/60 text-xs uppercase tracking-wide">Date &amp; Time</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy/60 text-xs uppercase tracking-wide">Payment</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy/60 text-xs uppercase tracking-wide">Receipt</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy/60 text-xs uppercase tracking-wide">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b: any) => (
                  <tr key={b._id.toString()} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy">{b.name}</p>
                      <p className="text-navy/50 text-xs flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        <a href={`mailto:${b.email}`} className="hover:underline">{b.email}</a>
                      </p>
                      {b.phone && (
                        <p className="text-navy/50 text-xs flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {b.phone}
                        </p>
                      )}
                      {b.message && (
                        <p className="text-navy/40 text-xs mt-1 line-clamp-2 max-w-[200px]">{b.message}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy">{b.topic}</p>
                      <p className="text-xs text-navy/50 mt-0.5">{tierLabel(b.serviceTier)}</p>
                    </td>
                    <td className="px-4 py-3">
                      {b.preferredDate ? (
                        <p className="text-navy text-sm">{new Date(b.preferredDate).toLocaleDateString('en-CA', { dateStyle: 'medium' })}</p>
                      ) : (
                        <p className="text-navy/30 text-sm">—</p>
                      )}
                      {b.preferredTime && (
                        <p className="text-navy/50 text-xs flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(`1970-01-01T${b.preferredTime}`).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        b.paymentMethod === 'pay_now'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {b.paymentMethod === 'pay_now' ? 'Paid upfront' : 'Pay when contacted'}
                      </span>
                      <span className={`ml-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        b.paymentStatus === 'received'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {b.paymentStatus === 'received' ? (
                          <><CheckCircle2 className="w-3 h-3" /> Received</>
                        ) : (
                          <><AlertCircle className="w-3 h-3" /> Pending</>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {b.receiptEmailed ? (
                        <span className="inline-flex items-center gap-1 text-green-700 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Emailed ({b.receiptFileName ?? 'receipt'})
                        </span>
                      ) : (
                        <span className="text-navy/30 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-navy/50 text-xs">
                      {formatDate(b.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
