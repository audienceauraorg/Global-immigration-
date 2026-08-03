export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import {
  Users, Award, Clock, Globe, ArrowRight, CheckCircle,
  FileText, Briefcase, Heart, GraduationCap, BookOpen, Building2,
  Shield, Star, ChevronRight, MapPin,
} from 'lucide-react'

export default async function HomePage() {
  const session = await auth()

  // Redirect logged-in users to their appropriate dashboard
  if (session?.user) {
    redirect(session.user.role === 'client' ? '/dashboard' : '/admin/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8F7F4' }}>
      <SiteHeader variant="public" />
      <main className="flex-1">

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #071428 0%, #0B1C3A 60%, #0f2650 100%)' }}
        >
          {/* Background grid pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'linear-gradient(rgba(201,168,76,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
          {/* Glowing orb */}
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-10" style={{
            background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)',
          }} />
          <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-5" style={{
            background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)',
          }} />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-36">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/10 mb-7 animate-fade-in">
                <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                <span className="text-gold text-xs font-semibold tracking-wider uppercase">CICC Regulated · Global Immigration Hub</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6 animate-fade-in" style={{ animationDelay: '0.05s' }}>
                Your Path to Canada
                <span className="block mt-1" style={{ color: '#C9A84C' }}>
                  Starts Here
                </span>
              </h1>

              {/* Subtext */}
              <p className="text-lg sm:text-xl text-white/60 leading-relaxed mb-10 max-w-2xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Expert, CICC-regulated immigration consulting for individuals, families, and employers.
                From Saskatchewan to the world — we handle every form, deadline, and detail so you can focus on your future.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 animate-fade-in" style={{ animationDelay: '0.15s' }}>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-bold text-navy transition-all hover:opacity-90 shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #C9A84C, #e8c76a)', boxShadow: '0 0 40px rgba(201,168,76,0.25)' }}
                >
                  Start Your Application
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-semibold text-white/80 hover:text-white transition-all hover:bg-white/10"
                  style={{ border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  Client Login
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Trust line */}
              <p className="mt-7 text-white/35 text-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
                No obligation — book a free consultation, or enroll directly online.
              </p>
            </div>
          </div>

          {/* Hero bottom wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', height: '60px', width: '100%' }}>
              <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z" fill="#F8F7F4" />
            </svg>
          </div>
        </section>

        {/* ── STATS BAR ──────────────────────────────────────────────────────── */}
        <section className="py-8 sm:py-12" style={{ background: '#F8F7F4' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Users, value: '500+', label: 'Clients Served', color: '#C9A84C' },
                { icon: Award, value: '95%', label: 'Success Rate', color: '#C9A84C' },
                { icon: Clock, value: '15+', label: 'Years Experience', color: '#C9A84C' },
                { icon: Globe, value: '10+', label: 'Programs Offered', color: '#C9A84C' },
              ].map(stat => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center text-center p-6 rounded-2xl bg-white shadow-sm border transition-shadow hover:shadow-md"
                  style={{ borderColor: 'rgba(11,28,58,0.06)' }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(201,168,76,0.12)' }}>
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <p className="text-3xl font-bold text-navy">{stat.value}</p>
                  <p className="text-sm text-navy/50 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ABOUT ────────────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20" style={{ background: '#ffffff' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
              {/* Left text */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy/5 mb-5">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                  <span className="text-navy text-xs font-semibold tracking-wider uppercase">About Us</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-navy leading-tight mb-5">
                  Commitment &amp; Integrity — Every File, Every Time
                </h2>
                <p className="text-navy/60 text-base leading-relaxed mb-4">
                  Canada accepts over 220,000 individuals in various categories every year.
                  Because of the complex forms, documents, and procedures that must be completed
                  in full, having a professional who is knowledgeable in Immigration Law is essential.
                </p>
                <p className="text-navy/60 text-base leading-relaxed mb-6">
                  You can trust that your business and personal matters will be handled with
                  professionalism, integrity, and the utmost discretion. The end result will be
                  an application that is accurate, on time, and will get you great results.
                </p>
                <Link
                  href="/#contact"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:opacity-80 transition-opacity"
                >
                  Book a free consultation
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Center image placeholder */}
              <div className="flex justify-center">
                <div
                  className="w-full max-w-sm aspect-[4/5] rounded-3xl flex items-center justify-center relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #0B1C3A, #1a3560)' }}
                >
                  {/* Pattern overlay */}
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'linear-gradient(rgba(201,168,76,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.5) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }} />
                  <div className="relative z-10 text-center p-8">
                    <div className="w-20 h-20 rounded-2xl bg-gold/20 border border-gold/30 flex items-center justify-center mx-auto mb-5">
                      <Globe className="w-10 h-10 text-gold" />
                    </div>
                    <p className="text-white font-bold text-lg mb-2">Global Immigration Hub</p>
                    <p className="text-white/50 text-sm">Prince Albert · Saskatchewan · Canada</p>
                  </div>
                </div>
              </div>

              {/* Right quote */}
              <div className="space-y-6">
                <div className="p-6 rounded-2xl border-l-4" style={{ borderColor: '#C9A84C', background: 'rgba(201,168,76,0.05)' }}>
                  <p className="text-navy/70 text-base leading-relaxed italic">
                    &ldquo;Global Immigration Hub has a very high success rate. We will help you choose
                    the correct admission category into Canada. We will then prepare all the necessary
                    documents to ensure your speedy and successful admission.&rdquo;
                  </p>
                </div>
                <div className="space-y-3">
                  {[
                    'Licensed RCIC (CICC Regulated)',
                    'End-to-end application management',
                    'Fast, reliable, and transparent',
                    'Serving individuals, families & employers',
                  ].map(point => (
                    <div key={point} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                      <span className="text-navy/70 text-sm">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PROGRAMS ─────────────────────────────────────────────────────── */}
        <section id="programs" className="py-16 sm:py-24" style={{ background: '#F8F7F4' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Section header */}
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy/5 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span className="text-navy text-xs font-semibold tracking-wider uppercase">Immigration Programs</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">
                How We Can Help You
              </h2>
              <p className="text-navy/50 text-base max-w-xl mx-auto">
                We guide you through the right Canadian immigration pathway for your unique situation.
              </p>
            </div>

            {/* Program cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  icon: MapPin,
                  tag: 'Provincial Nominee',
                  title: 'SINP – Saskatchewan',
                  desc: 'Saskatchewan Immigration Nominee Program for skilled workers and those with Saskatchewan experience.',
                  href: '/signup',
                },
                {
                  icon: Globe,
                  tag: 'Federal',
                  title: 'Express Entry / PR',
                  desc: 'Permanent residence through Express Entry, FSW, and Federal Skilled Trades programs.',
                  href: '/signup',
                },
                {
                  icon: Briefcase,
                  tag: 'Temporary',
                  title: 'Work Permits',
                  desc: 'Open, closed, and PGWP work permits for foreign nationals and post-graduate students.',
                  href: '/signup',
                },
                {
                  icon: Heart,
                  tag: 'Family',
                  title: 'Spousal Sponsorship',
                  desc: 'Sponsor your spouse or common-law partner for permanent residence in Canada.',
                  href: '/signup',
                },
                {
                  icon: GraduationCap,
                  tag: 'Study',
                  title: 'Study Permits',
                  desc: 'Study permit applications for international students attending Canadian institutions.',
                  href: '/signup',
                },
                {
                  icon: Building2,
                  tag: 'Employers',
                  title: 'Employer Services',
                  desc: 'LMIA applications, foreign worker recruitment, and employer compliance support.',
                  href: '/#employers',
                },
              ].map(prog => (
                <Link
                  key={prog.title}
                  href={prog.href}
                  className="group bg-white rounded-2xl p-7 border transition-all hover:shadow-lg hover:-translate-y-1"
                  style={{ borderColor: 'rgba(11,28,58,0.08)' }}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(11,28,58,0.06)' }}>
                      <prog.icon className="w-5 h-5 text-navy" />
                    </div>
                    <span className="text-xs font-semibold text-gold bg-gold/10 px-2.5 py-1 rounded-full">{prog.tag}</span>
                  </div>
                  <h3 className="text-navy font-bold text-lg mb-2 group-hover:text-gold transition-colors">{prog.title}</h3>
                  <p className="text-navy/55 text-sm leading-relaxed mb-4">{prog.desc}</p>
                  <div className="flex items-center gap-1.5 text-gold text-sm font-semibold">
                    Get started
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── EMPLOYER SECTION ─────────────────────────────────────────────── */}
        <section id="employers" className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="rounded-3xl p-10 sm:p-14 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0B1C3A, #0f2650)' }}>
              {/* BG decoration */}
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10" style={{
                background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)',
                transform: 'translate(30%, -30%)',
              }} />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/10 mb-5">
                    <Building2 className="w-3.5 h-3.5 text-gold" />
                    <span className="text-gold text-xs font-semibold tracking-wider uppercase">For Employers</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight">
                    Bring the Right Talent to Canada
                  </h2>
                  <p className="text-white/60 text-base leading-relaxed mb-6">
                    We assist companies of all sizes throughout the entire immigration process —
                    proposing the most suitable pathway for bringing skilled foreign workers into Canada,
                    handling LMIA applications, compliance, and more.
                  </p>
                  <div className="space-y-3">
                    {[
                      'Labour Market Impact Assessments (LMIA)',
                      'Temporary Foreign Worker Program',
                      'International Mobility Program',
                      'Employer compliance and record-keeping',
                    ].map(item => (
                      <div key={item} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                        <span className="text-white/70 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <Link
                    href="/signup"
                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-navy text-base transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #C9A84C, #e8c76a)' }}
                  >
                    Start Your File Today
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/#contact"
                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-white text-base transition-all hover:bg-white/10"
                    style={{ border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    Book a Consultation
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SERVICES ──────────────────────────────────────────────────────── */}
        <section id="services" className="py-16 sm:py-24" style={{ background: '#F8F7F4' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy/5 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span className="text-navy text-xs font-semibold tracking-wider uppercase">Our Services</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">More Ways We Help</h2>
              <p className="text-navy/50 text-base max-w-xl mx-auto">
                Beyond immigration consulting, we offer a suite of complementary professional services.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  icon: Shield,
                  title: 'Mobile Notary',
                  desc: 'Certified mobile notary services for documents, contracts, and official declarations.',
                },
                {
                  icon: FileText,
                  title: 'Translation Services',
                  desc: 'Accurate document translation for immigration and legal purposes, certified where required.',
                },
                {
                  icon: Users,
                  title: 'Seminar Consultations',
                  desc: 'Group immigration seminars for employers, community organizations, and newcomer groups.',
                },
                {
                  icon: BookOpen,
                  title: 'Other Services',
                  desc: 'A full range of support services to help newcomers settle and thrive in Canada.',
                },
              ].map(svc => (
                <div
                  key={svc.title}
                  className="bg-white rounded-2xl p-7 border text-center transition-all hover:shadow-md"
                  style={{ borderColor: 'rgba(11,28,58,0.08)' }}
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(11,28,58,0.06)' }}>
                    <svc.icon className="w-6 h-6 text-navy" />
                  </div>
                  <h3 className="text-navy font-bold text-base mb-2">{svc.title}</h3>
                  <p className="text-navy/55 text-sm leading-relaxed">{svc.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
        <section id="team" className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy/5 mb-4">
                <Star className="w-3.5 h-3.5 text-gold" />
                <span className="text-navy text-xs font-semibold tracking-wider uppercase">Client Stories</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">Real People, Real Results</h2>
              <p className="text-navy/50 text-base max-w-xl mx-auto">
                Hundreds of individuals and families have trusted us with their most important journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Manmeet Sidhu',
                  program: 'Permanent Residency',
                  quote: 'A very big thanks to the team for helping me get my permanent residency. Just because of them my dream to become a permanent resident of Canada came true. They are surely the best and honest ones in business. I highly recommend their services.',
                  initial: 'M',
                },
                {
                  name: 'Client — Saskatchewan',
                  program: 'Work Permit',
                  quote: 'We have a very high success rate and our highly qualified professionals fulfilled all the necessary steps to obtain fast and reliable results. Professional, thorough, and genuinely invested in our success.',
                  initial: 'S',
                },
                {
                  name: 'Client — Spousal Sponsorship',
                  program: 'Family Sponsorship',
                  quote: 'They handled everything with professionalism and integrity. The process was complex but they guided us step by step. Our family is together in Canada now — we could not be more grateful.',
                  initial: 'F',
                },
              ].map(t => (
                <div
                  key={t.name}
                  className="rounded-2xl p-8 border relative"
                  style={{ background: '#F8F7F4', borderColor: 'rgba(11,28,58,0.08)' }}
                >
                  {/* Quote mark */}
                  <div className="absolute top-6 right-7 text-6xl font-serif leading-none" style={{ color: 'rgba(201,168,76,0.15)' }}>&ldquo;</div>

                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" style={{ color: '#C9A84C' }} />
                    ))}
                  </div>

                  <p className="text-navy/65 text-sm leading-relaxed mb-6 italic relative z-10">&ldquo;{t.quote}&rdquo;</p>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-navy font-bold text-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg, #C9A84C, #e8c76a)' }}>
                      {t.initial}
                    </div>
                    <div>
                      <p className="text-navy font-semibold text-sm">{t.name}</p>
                      <p className="text-gold text-xs font-medium">{t.program}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ENROLL CTA ───────────────────────────────────────────────────── */}
        <section
          className="py-16 sm:py-24 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #071428, #0B1C3A)' }}
        >
          <div className="absolute top-[-30%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-10" style={{
            background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)',
          }} />
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/10 mb-7">
              <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-gold text-xs font-semibold tracking-wider uppercase">Start Today — Free Consultation</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-5 leading-tight">
              Ready to Begin Your
              <span className="block" style={{ color: '#C9A84C' }}>Immigration Journey?</span>
            </h2>
            <p className="text-white/55 text-lg mb-10 leading-relaxed">
              Create your client account, select your program, and start uploading documents —
              all in one place. Our consultants will guide you every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-navy transition-all hover:opacity-90 shadow-xl w-full sm:w-auto justify-center"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #e8c76a)', boxShadow: '0 0 40px rgba(201,168,76,0.3)' }}
              >
                Enroll Now — It&apos;s Free to Start
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-medium text-white/70 hover:text-white transition-all hover:bg-white/10 w-full sm:w-auto justify-center"
                style={{ border: '1px solid rgba(255,255,255,0.2)' }}
              >
                Already enrolled? Sign in
              </Link>
            </div>
          </div>
        </section>

        {/* ── CONTACT ──────────────────────────────────────────────────────── */}
        <section id="contact" className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy/5 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span className="text-navy text-xs font-semibold tracking-wider uppercase">Contact Us</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">Get in Touch</h2>
              <p className="text-navy/50 text-base leading-relaxed mb-8">
                Have questions before you commit? Book a free consultation call and speak directly
                with a CICC-regulated immigration consultant.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-navy transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #C9A84C, #e8c76a)' }}
                >
                  Book a Consultation →
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-navy/70 hover:text-navy transition-colors border border-navy/15 hover:border-navy/30"
                >
                  Client Portal Login
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  )
}
