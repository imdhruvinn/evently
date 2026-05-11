'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, Calendar, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Invalid or missing reset token.'); }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setStatus('error'); setMessage('Passwords do not match'); return; }
    if (password.length < 8) { setStatus('error'); setMessage('Password must be at least 8 characters'); return; }
    setStatus('loading');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');
      setStatus('success');
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) { setStatus('error'); setMessage(err.message || 'Reset failed'); }
  };

  if (status === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <div style={{ width: '64px', height: '64px', background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 25px rgba(16,185,129,0.2)' }}>
          <CheckCircle style={{ width: '28px', height: '28px', color: '#10b981' }} />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginBottom: '10px' }}>Password Reset!</h3>
        <p style={{ fontSize: '14px', color: '#64748b' }}>{message}</p>
      </div>
    );
  }

  return (
    <>
      {status === 'error' && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '12px 16px', color: '#fca5a5', fontSize: '13px', marginBottom: '20px' }}>{message}</div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[
          { label: 'New Password', value: password, onChange: setPassword },
          { label: 'Confirm Password', value: confirmPassword, onChange: setConfirmPassword },
        ].map(({ label, value, onChange }, i) => (
          <div key={i}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>{label}</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#64748b' }} />
              <input type={showPassword ? 'text' : 'password'} required value={value} onChange={e => onChange(e.target.value)} placeholder="••••••••"
                style={{ width: '100%', paddingLeft: '42px', paddingRight: i === 0 ? '44px' : '14px', paddingTop: '12px', paddingBottom: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
              {i === 0 && (
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
                  {showPassword ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                </button>
              )}
            </div>
          </div>
        ))}
        <button type="submit" disabled={status === 'loading' || !token} style={{
          width: '100%', padding: '13px',
          background: (status === 'loading' || !token) ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #3b82f6)',
          color: 'white', border: 'none', borderRadius: '11px',
          fontSize: '14px', fontWeight: 700, cursor: (status === 'loading' || !token) ? 'not-allowed' : 'pointer',
          boxShadow: (status === 'loading' || !token) ? 'none' : '0 0 25px rgba(99,102,241,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          marginTop: '4px',
        }}>
          {status === 'loading' ? 'Resetting…' : <><ArrowRight style={{ width: '15px', height: '15px' }} /> Reset Password</>}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>
      <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeInUp 0.5s ease', position: 'relative', zIndex: 1 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '40px' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(99,102,241,0.35)' }}>
            <Calendar style={{ width: '18px', height: '18px', color: 'white' }} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Evently</span>
        </Link>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px' }}>Set new password</h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>Choose a strong new password for your account.</p>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px', backdropFilter: 'blur(16px)', boxShadow: '0 4px 40px rgba(0,0,0,0.4)' }}>
          <Suspense fallback={<div style={{ color: '#64748b', textAlign: 'center' }}>Loading…</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
