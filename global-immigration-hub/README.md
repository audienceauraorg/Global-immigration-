# Global Immigration Hub — Client Management Dashboard

A full-stack immigration case management platform: admin dashboard + client portal.

---

## 🚀 Getting Started

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) → New project.

Once created, grab from **Project Settings → API**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase values.

### 3. Run the database schema

In your Supabase dashboard → **SQL Editor → New query**, paste and run:

1. `supabase/schema.sql` — creates all tables, RLS policies, and triggers
2. `supabase/seed.sql` — seeds 7 Canadian immigration programs with document checklists

### 4. Create the Storage bucket

In Supabase → **Storage → New bucket**:
- Name: `case-documents`
- Public: **OFF** (private)

### 5. Create your admin account

1. Run the app: `npm run dev`
2. Go to `http://localhost:3000/signup` and create your account
3. Back in Supabase SQL Editor, promote yourself to admin:
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
   ```

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/admin/dashboard`.

---

## 🗺️ Routes

| Route | Who | Description |
|---|---|---|
| `/login` | Everyone | Sign in |
| `/signup` | Everyone | Create client account |
| `/admin/dashboard` | Admin/Staff | Overview, stats, needs-attention |
| `/admin/clients` | Admin/Staff | All clients + search/filter |
| `/admin/clients/[id]` | Admin/Staff | Case detail, doc checklist, timeline |
| `/admin/programs` | Admin/Staff | Manage immigration programs + checklists |
| `/admin/notifications` | Admin/Staff | Pending reviews, deadlines, activity feed |
| `/admin/settings` | Admin only | Site name, email config, RCIC number |
| `/portal` | Clients | Their case, progress tracker, doc uploads |

---

## 👥 Roles

| Role | Access |
|---|---|
| `admin` | Everything including Settings |
| `staff` | All client/case screens, not Settings |
| `client` | Their own portal only |

To change a user's role in Supabase SQL Editor:
```sql
UPDATE public.profiles SET role = 'staff' WHERE email = 'consultant@example.com';
```

---

## 📋 Adding a Client

1. Admin goes to **Clients → Add Client**
2. Fills in name, email, phone, and selects a program
3. System creates the client record, case, and pre-populates the document checklist
4. To link the client's portal login: go to **Supabase SQL Editor** and run:
   ```sql
   UPDATE public.clients
   SET profile_id = (SELECT id FROM public.profiles WHERE email = 'client@email.com')
   WHERE email = 'client@email.com';
   ```
   *(This will be automated in a future update — for now the client must sign up first, then admin links them)*

---

## 📁 Document Upload Flow

1. Client visits `/portal` → sees their checklist
2. Clicks **Upload** on any item → picks PDF/JPG/PNG (max 10MB)
3. File is validated server-side (MIME magic bytes, size)
4. Uploaded to private Supabase Storage bucket
5. Document status → `pending_review`
6. Admin sees it in Client Detail → can Approve or Reject with a note
7. If rejected, client sees the note and can re-upload

---

## 🔧 Seeded Programs

| Country | Program |
|---|---|
| Canada | SINP – Occupations In-Demand |
| Canada | SINP – Saskatchewan Experience Category |
| Canada | ISWC – International Skilled Worker (Canadian Experience) |
| Canada | Spousal / Common-Law Sponsorship |
| Canada | Open Work Permit – Post-Graduate (PGWP) |
| Canada | Permanent Residence – Express Entry (FSW) |
| Canada | Study Permit |

Add more programs anytime via **Admin → Programs**.

---

## ⚙️ Admin Settings

Visit **Admin → Settings** to configure (no code deploy needed):
- Site name & tagline
- RCIC number (shown in client portal footer)
- Contact email
- Email sender name & address (for notifications via Resend)
- Max upload size
- Self-registration on/off

---

## 🚢 Deploy to Vercel

```bash
npx vercel
```

Set all `.env.local` variables in Vercel → Project → Environment Variables.
