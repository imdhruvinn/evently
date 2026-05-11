"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Calendar, Users, CreditCard, Shield, Zap, Star, TrendingUp, ArrowRight, CheckCircle, BarChart3, Ticket } from "lucide-react";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/events");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{
          width: '48px', height: '48px',
          border: '3px solid rgba(99,102,241,0.2)',
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>

      {/* Background Orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: '800px', height: '400px', background: 'radial-gradient(ellipse, rgba(99,102,241,0.05) 0%, transparent 60%)' }} />
      </div>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,15,30,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 15px rgba(99,102,241,0.35)',
            }}>
              <Calendar style={{ width: '18px', height: '18px', color: 'white' }} />
            </div>
            <span style={{ fontSize: '20px', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Evently</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/login" style={{ padding: '8px 16px', color: 'rgba(148,163,184,0.85)', fontSize: '14px', fontWeight: 500, textDecoration: 'none', borderRadius: '8px', transition: 'color 0.2s' }}>Sign In</Link>
            <Link href="/register" style={{ padding: '9px 22px', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', color: 'white', borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main style={{ position: 'relative', zIndex: 1 }}>
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '100px 24px 80px', textAlign: 'center' }}>
          <div className="animate-fadeInUp">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '999px', fontSize: '12px', fontWeight: 600, color: '#a5b4fc', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '28px' }}>
              <Zap style={{ width: '11px', height: '11px' }} /> Next-Gen Event Management Platform
            </span>
            <h1 style={{ fontSize: 'clamp(42px, 7vw, 80px)', fontWeight: 900, lineHeight: 1.05, marginBottom: '24px', color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              Manage Events with<br />
              <span style={{ background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 60%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Confidence & Control
              </span>
            </h1>
            <p style={{ fontSize: '18px', color: '#94a3b8', maxWidth: '580px', margin: '0 auto 48px', lineHeight: 1.7 }}>
              From intimate gatherings to large conferences — create, manage, and track events with real-time analytics, secure payments, and seamless seat booking.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                color: 'white', borderRadius: '12px',
                fontSize: '15px', fontWeight: 700, textDecoration: 'none',
                boxShadow: '0 0 30px rgba(99,102,241,0.4)',
                transition: 'all 0.2s ease',
              }}>
                Start For Free <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>
              <Link href="/events" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 32px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f1f5f9', borderRadius: '12px',
                fontSize: '15px', fontWeight: 600, textDecoration: 'none',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease',
              }}>
                <Ticket style={{ width: '16px', height: '16px' }} /> Browse Events
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', maxWidth: '560px', margin: '72px auto 0' }}>
            {[
              { value: '10K+', label: 'Events Created' },
              { value: '50K+', label: 'Happy Attendees' },
              { value: '₹2M+', label: 'Revenue Processed' },
            ].map((stat, i) => (
              <div key={i} style={{
                padding: '20px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px',
                backdropFilter: 'blur(10px)',
              }}>
                <div style={{ fontSize: '26px', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#f1f5f9', marginBottom: '14px' }}>
              Everything you need in{' '}
              <span style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>one platform</span>
            </h2>
            <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '480px', margin: '0 auto' }}>
              Powerful tools designed for modern event organizers and attendees.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {[
              { icon: Calendar, color: '#6366f1', title: 'Event Management', desc: 'Create events in minutes. Set dates, venues, custom seat sections, pricing, and capacity limits effortlessly.' },
              { icon: Users, color: '#10b981', title: 'Smart Booking System', desc: 'Real-time seat selection with live availability. Queue management for high-demand events.' },
              { icon: CreditCard, color: '#3b82f6', title: 'Secure UPI Payments', desc: 'Razorpay-powered UPI payments. Instant confirmations, refund management, and payment tracking.' },
              { icon: BarChart3, color: '#f59e0b', title: 'Advanced Analytics', desc: 'Deep insights with revenue trends, user segments, booking peaks, and exportable Excel reports.' },
              { icon: Shield, color: '#ef4444', title: 'Email Verification', desc: 'Real email authentication ensures only verified users access the platform. Secure and trustworthy.' },
              { icon: TrendingUp, color: '#8b5cf6', title: 'Growth Tracking', desc: 'Monitor conversion rates, retention, cancellation trends, and projected revenue in real time.' },
            ].map((feature, i) => (
              <FeatureCard key={i} {...feature} delay={i * 80} />
            ))}
          </div>
        </section>

        {/* Trust Section */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '60px 24px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#f1f5f9', marginBottom: '36px' }}>Why Evently stands out</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              {[
                'Email-verified authentication',
                'Real-time seat reservation',
                'UPI & card payments via Razorpay',
                'Exportable analytics reports',
                'Waitlist & queue management',
                'Role-based admin dashboard',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                  <CheckCircle style={{ width: '16px', height: '16px', color: '#10b981', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <div style={{
            padding: '64px 40px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(59,130,246,0.08) 100%)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '24px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 60px rgba(99,102,241,0.1)',
          }}>
            <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#f1f5f9', marginBottom: '16px' }}>Ready to get started?</h2>
            <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '36px' }}>Join thousands of event organizers using Evently.</p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 36px',
                background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                color: 'white', borderRadius: '12px',
                fontSize: '15px', fontWeight: 700, textDecoration: 'none',
                boxShadow: '0 0 30px rgba(99,102,241,0.4)',
              }}>
                Create Account <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>
              <Link href="/login" style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '14px 32px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#f1f5f9', borderRadius: '12px',
                fontSize: '15px', fontWeight: 600, textDecoration: 'none',
              }}>
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '36px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar style={{ width: '14px', height: '14px', color: 'white' }} />
          </div>
          <span style={{ fontWeight: 700, color: '#f1f5f9' }}>Evently</span>
        </div>
        <p style={{ fontSize: '13px', color: '#475569' }}>Built with Next.js, TypeScript, Node.js & PostgreSQL &bull; BTP Project</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, color, title, desc, delay }: { icon: any; color: string; title: string; desc: string; delay: number }) {
  return (
    <div style={{
      padding: '28px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '16px',
      transition: 'all 0.25s ease',
      backdropFilter: 'blur(10px)',
      animation: `fadeInUp 0.5s ease ${delay}ms both`,
    }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = `${color}30`;
        el.style.transform = 'translateY(-4px)';
        el.style.boxShadow = `0 8px 30px ${color}20`;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'rgba(255,255,255,0.07)';
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = 'none';
      }}
    >
      <div style={{
        width: '48px', height: '48px',
        background: `${color}18`,
        border: `1px solid ${color}30`,
        borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '18px',
      }}>
        <Icon style={{ width: '22px', height: '22px', color }} />
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', marginBottom: '10px' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.65 }}>{desc}</p>
    </div>
  );
}
