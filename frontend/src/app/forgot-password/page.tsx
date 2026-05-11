'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Calendar, SendHorizonal } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');
      setStatus('success');
      setMessage(data.message || 'If an account exists, a reset link was sent.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Failed to send reset link');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeInUp 0.5s ease', position: 'relative', zIndex: 1 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '40px' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(99,102,241,0.35)' }}>
            <Calendar style={{ width: '18px', height: '18px', color: 'white' }} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Evently</span>
        </Link>

        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px' }}>Forgot password?</h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>No worries — enter your email and we&apos;ll send a reset link.</p>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px', backdropFilter: 'blur(16px)', boxShadow: '0 4px 40px rgba(0,0,0,0.4)' }}>
          {status === 'success' ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: '64px', height: '64px', background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 25px rgba(16,185,129,0.2)' }}>
                <Mail style={{ width: '28px', height: '28px', color: '#10b981' }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginBottom: '10px' }}>Check your inbox</h3>
              <p style={{ fontSize: '14px', color: '#64748b' }}>{message}</p>
            </div>
          ) : (
            <>
              {status === 'error' && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '12px 16px', color: '#fca5a5', fontSize: '13px', marginBottom: '20px' }}>{message}</div>
              )}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#64748b' }} />
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                      style={{ width: '100%', paddingLeft: '42px', paddingRight: '14px', paddingTop: '12px', paddingBottom: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>
                <button type="submit" disabled={status === 'loading'} style={{
                  width: '100%', padding: '13px',
                  background: status === 'loading' ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #3b82f6)',
                  color: 'white', border: 'none', borderRadius: '11px',
                  fontSize: '14px', fontWeight: 700, cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  boxShadow: status === 'loading' ? 'none' : '0 0 25px rgba(99,102,241,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}>
                  {status === 'loading' ? 'Sending…' : <><SendHorizonal style={{ width: '15px', height: '15px' }} /> Send Reset Link</>}
                </button>
              </form>
            </>
          )}
        </div>

        <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '24px', fontSize: '13px', color: '#64748b', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to login
        </Link>
      </div>
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
