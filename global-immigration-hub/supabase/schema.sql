-- Copy and run this in your Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Site-wide settings (single row)
CREATE TABLE public.site_settings (
  id              INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_name       TEXT NOT NULL DEFAULT 'Global Immigration Hub',
  site_tagline    TEXT NOT NULL DEFAULT 'Your trusted immigration partner',
  rcic_number     TEXT,
  contact_email   TEXT,
  email_from_name TEXT NOT NULL DEFAULT 'Global Immigration Hub',
  email_from_addr TEXT,
  max_upload_mb   INT NOT NULL DEFAULT 10,
  self_register   BOOLEAN NOT NULL DEFAULT true,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.site_settings DEFAULT VALUES;

-- Profiles (one per auth user)
CREATE TABLE public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  email      TEXT,
  phone      TEXT,
  role       TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'staff', 'client')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Programs
CREATE TABLE public.programs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country    TEXT NOT NULL,
  name       TEXT NOT NULL,
  checklist  JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Clients
CREATE TABLE public.clients (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name           TEXT NOT NULL,
  email          TEXT NOT NULL UNIQUE,
  phone          TEXT,
  notes          TEXT,
  account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('pending','invited','active')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cases
CREATE TABLE public.cases (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id      UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  program_id     UUID NOT NULL REFERENCES public.programs(id),
  checklist      JSONB NOT NULL DEFAULT '[]',
  stage          TEXT NOT NULL DEFAULT 'Intake'
                   CHECK (stage IN ('Intake','Docs Collection','Review','Submitted','Decision','Closed')),
  assigned_to    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  important_date TIMESTAMPTZ,
  opened_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Documents
CREATE TABLE public.documents (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id        UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'not_submitted'
                   CHECK (status IN ('not_submitted','pending_review','approved','rejected')),
  storage_path   TEXT,
  file_name      TEXT,
  file_size      BIGINT,
  version        INT NOT NULL DEFAULT 1,
  uploaded_by    TEXT CHECK (uploaded_by IN ('client','admin')),
  uploaded_at    TIMESTAMPTZ,
  reviewed_at    TIMESTAMPTZ,
  rejection_note TEXT,
  is_scanned     BOOLEAN NOT NULL DEFAULT false,
  is_infected    BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activity log
CREATE TABLE public.activity_log (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id           UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  description       TEXT NOT NULL,
  visible_to_client BOOLEAN NOT NULL DEFAULT false,
  created_by        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Role helper
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Profiles
CREATE POLICY "profiles_access" ON public.profiles FOR ALL TO authenticated
  USING (id = auth.uid() OR public.get_my_role() IN ('admin','staff'));

-- Programs (read-only for clients, write for staff/admin)
CREATE POLICY "programs_read" ON public.programs FOR SELECT TO authenticated USING (true);
CREATE POLICY "programs_write" ON public.programs FOR ALL TO authenticated
  USING (public.get_my_role() IN ('admin','staff'));

-- Clients
CREATE POLICY "clients_read" ON public.clients FOR SELECT TO authenticated
  USING (profile_id = (SELECT auth.uid()) OR public.get_my_role() IN ('admin','staff'));
CREATE POLICY "clients_write" ON public.clients FOR ALL TO authenticated
  USING (public.get_my_role() IN ('admin','staff'));

-- Cases
CREATE POLICY "cases_read" ON public.cases FOR SELECT TO authenticated
  USING (
    client_id IN (SELECT id FROM public.clients WHERE profile_id = (SELECT auth.uid()))
    OR public.get_my_role() IN ('admin','staff')
  );
CREATE POLICY "cases_write" ON public.cases FOR ALL TO authenticated
  USING (public.get_my_role() IN ('admin','staff'));

-- Documents (clients can read own + insert; staff/admin full access)
CREATE POLICY "documents_read" ON public.documents FOR SELECT TO authenticated
  USING (
    case_id IN (
      SELECT c.id FROM public.cases c
      JOIN public.clients cl ON cl.id = c.client_id
      WHERE cl.profile_id = (SELECT auth.uid())
    )
    OR public.get_my_role() IN ('admin','staff')
  );
CREATE POLICY "documents_client_upload" ON public.documents FOR INSERT TO authenticated
  WITH CHECK (
    uploaded_by = 'client'
    AND case_id IN (
      SELECT c.id FROM public.cases c
      JOIN public.clients cl ON cl.id = c.client_id
      WHERE cl.profile_id = (SELECT auth.uid())
    )
  );
CREATE POLICY "documents_client_update" ON public.documents FOR UPDATE TO authenticated
  USING (
    uploaded_by = 'client'
    AND case_id IN (
      SELECT c.id FROM public.cases c
      JOIN public.clients cl ON cl.id = c.client_id
      WHERE cl.profile_id = (SELECT auth.uid())
    )
  );
CREATE POLICY "documents_staff_all" ON public.documents FOR ALL TO authenticated
  USING (public.get_my_role() IN ('admin','staff'));

-- Activity log
CREATE POLICY "activity_read" ON public.activity_log FOR SELECT TO authenticated
  USING (
    (visible_to_client = true AND case_id IN (
      SELECT c.id FROM public.cases c
      JOIN public.clients cl ON cl.id = c.client_id
      WHERE cl.profile_id = (SELECT auth.uid())
    ))
    OR public.get_my_role() IN ('admin','staff')
  );
CREATE POLICY "activity_write" ON public.activity_log FOR ALL TO authenticated
  USING (public.get_my_role() IN ('admin','staff'));
CREATE POLICY "activity_client_insert" ON public.activity_log FOR INSERT TO authenticated
  WITH CHECK (
    case_id IN (
      SELECT c.id FROM public.cases c
      JOIN public.clients cl ON cl.id = c.client_id
      WHERE cl.profile_id = (SELECT auth.uid())
    )
  );

-- Site settings
CREATE POLICY "settings_read" ON public.site_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "settings_write" ON public.site_settings FOR ALL TO authenticated
  USING (public.get_my_role() = 'admin');

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_clients_profile_id ON public.clients(profile_id);
CREATE INDEX idx_cases_client_id ON public.cases(client_id);
CREATE INDEX idx_documents_case_id ON public.documents(case_id);
CREATE INDEX idx_activity_case_id ON public.activity_log(case_id);
