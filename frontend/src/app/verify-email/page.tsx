'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading'|'success'|'error'>('loading');
  const [message, setMessage] = useState('Verifying your email…');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Invalid or missing verification token.'); return; }
    const verify = async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Verification failed');
        setStatus('success');
        setMessage('Your email has been verified! You can now log in.');
        setTimeout(() => router.push('/login'), 3500);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Verification failed. The link may have expired.');
      }
    };
    verify();
  }, [token, router]);

  return (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      {status === 'loading' && (
        <>
          <div style={{ width: '64px', height: '64px', margin: '0 auto 24px', position: 'relative' }}>
            <div style={{ width: '64px', height: '64px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
          <p style={{ fontSize: '15px', color: '#94a3b8' }}>{message}</p>
        </>
      )}
      {status === 'success' && (
        <>
          <div style={{ width: '72px', height: '72px', background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 30px rgba(16,185,129,0.25)' }}>
            <CheckCircle style={{ width: '32px', height: '32px', color: '#10b981' }} />
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', marginBottom: '10px' }}>Email Verified!</h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '28px' }}>{message}</p>
          <p style={{ fontSize: '12px', color: '#475569' }}>Redirecting to login in 3 seconds…</p>
        </>
      )}
      {status === 'error' && (
        <>
          <div style={{ width: '72px', height: '72px', background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 25px rgba(239,68,68,0.15)' }}>
            <XCircle style={{ width: '32px', height: '32px', color: '#ef4444' }} />
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', marginBottom: '10px' }}>Verification Failed</h3>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '28px' }}>{message}</p>
          <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 24px', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', color: 'white', borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 0 20px rgba(99,102,241,0.35)' }}>
            Go to Login <ArrowRight style={{ width: '14px', height: '14px' }} />
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>
      <div style={{ width: '100%', maxWidth: '440px', animation: 'fadeInUp 0.5s ease', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
              <Calendar style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <span style={{ fontSize: '22px', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Evently</span>
          </Link>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#f1f5f9', marginBottom: '28px', textAlign: 'center' }}>Email Verification</h1>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '40px 32px', backdropFilter: 'blur(16px)', boxShadow: '0 4px 40px rgba(0,0,0,0.4)' }}>
          <Suspense fallback={<div style={{ color: '#64748b', textAlign: 'center' }}>Loading…</div>}>
            <VerifyEmailContent />
          </Suspense>
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
