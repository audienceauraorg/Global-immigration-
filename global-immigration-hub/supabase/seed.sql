-- Run this AFTER schema.sql in your Supabase SQL Editor

INSERT INTO public.programs (country, name, checklist) VALUES

('Canada', 'SINP – Occupations In-Demand', '["Valid Passport (all pages)", "IELTS/CELPIP Language Test Results", "Educational Credential Assessment (ECA)", "Proof of Work Experience (reference letters, T4s)", "Job Offer Letter (if applicable)", "Proof of Settlement Funds", "Police Certificate (Canada + country of residence)", "Medical Exam Results (IMM 1017B)", "Completed IMM 0008 Application Forms", "Two Passport-Sized Photos"]'::jsonb),

('Canada', 'SINP – Saskatchewan Experience Category', '["Valid Passport (all pages)", "Employment Contract or Letter from SK Employer", "Proof of 6+ Months SK Work Experience (pay stubs, T4s)", "IELTS/CELPIP Language Test Results", "Educational Credential Assessment (ECA) if applicable", "Police Certificate (Canada + country of residence)", "Medical Exam Results", "Proof of Settlement Funds", "Two Passport-Sized Photos"]'::jsonb),

('Canada', 'ISWC – International Skilled Worker (Canadian Experience)', '["Valid Passport (all pages)", "Canadian Work Permit (copy)", "IELTS/CELPIP Language Test Results (CLB 7+)", "Proof of 1 Year Canadian Skilled Work Experience", "Employment Letter from Canadian Employer", "Notice of Assessment (CRA)", "Police Certificate", "Medical Exam Results", "Two Passport-Sized Photos"]'::jsonb),

('Canada', 'Spousal / Common-Law Sponsorship', '["Sponsor Proof of Canadian Citizenship or PR", "Sponsor Proof of Income (NOA, T4, pay stubs)", "Marriage Certificate (notarized) or Proof of Common-Law", "Joint Financial Documents (bank accounts, lease, bills)", "Relationship Photos (chronological)", "Communication Evidence (messages, call logs)", "IMM 1344 – Sponsorship Application", "IMM 0008 – Generic Application Form", "Both Passports (all pages)", "Police Certificate (both parties)", "Medical Exam (sponsored person)", "Two Passport-Sized Photos (each)"]'::jsonb),

('Canada', 'Open Work Permit – Post-Graduate (PGWP)', '["Valid Passport", "Graduation Letter / Transcripts from Canadian Institution", "Study Permit (copy)", "Proof of Full-Time Study Completion", "IMM 1295 – Work Permit Application", "Two Passport-Sized Photos", "IRCC Fee Payment Receipt"]'::jsonb),

('Canada', 'Permanent Residence – Express Entry (FSW)', '["Valid Passport (all pages)", "IELTS General Training Results (CLB 7+)", "Educational Credential Assessment (ECA – WES)", "Proof of Skilled Work Experience (reference letters, pay stubs)", "Police Certificate (all countries of residence 6+ months)", "Medical Exam (IMM 1017B, authorized panel physician)", "Proof of Settlement Funds", "Job Offer (LMIA-exempt or LMIA-supported, if applicable)", "Express Entry Profile Number & ITA Letter", "Two Passport-Sized Photos", "IMM 0008, IMM 5669, IMM 5406 Forms"]'::jsonb),

('Canada', 'Study Permit', '["Valid Passport", "Letter of Acceptance from Canadian DLI", "Proof of Financial Support (tuition + living costs)", "Bank Statements (last 6 months)", "Study Plan / Purpose of Study Letter", "Police Certificate", "IMM 1294 – Study Permit Application", "Quebec CAQ (if studying in Quebec)", "Biometrics (if required)", "Two Passport-Sized Photos"]'::jsonb);

-- ============================================================
-- Create your first admin account:
-- 1. Sign up via the app UI (/signup) with your email
-- 2. Then run this SQL to promote yourself to admin:
--    UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
-- ============================================================
