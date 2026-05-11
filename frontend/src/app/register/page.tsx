"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle, Calendar, User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const { register } = useAuth();

  const passwordStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) { setError("Password needs uppercase, lowercase, and a number"); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      setRegistered(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally { setLoading(false); }
  };

  if (registered) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
        </div>
        <div style={{ maxWidth: '440px', width: '100%', textAlign: 'center', animation: 'fadeInUp 0.5s ease', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 0 30px rgba(16,185,129,0.2)' }}>
            <Mail style={{ width: '36px', height: '36px', color: '#10b981' }} />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#f1f5f9', marginBottom: '12px' }}>Check your inbox!</h2>
          <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '6px' }}>We sent a verification link to:</p>
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#6ee7b7', marginBottom: '28px' }}>{email}</p>
          <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '14px', padding: '18px 20px', textAlign: 'left', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <CheckCircle style={{ width: '18px', height: '18px', color: '#10b981', flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontSize: '13px', color: '#6ee7b7', lineHeight: 1.6 }}>
                Click the <strong>Verify Email</strong> button in the email. You <strong>cannot log in</strong> until your email is verified.
              </p>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: '#475569', marginBottom: '20px' }}>
            Didn&apos;t receive it?{' '}
            <button onClick={() => setRegistered(false)} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}>
              Try a different email
            </button>
          </p>
          <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', color: 'white', borderRadius: '11px', fontSize: '14px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 0 25px rgba(99,102,241,0.4)' }}>
            Go to Login <ArrowRight style={{ width: '15px', height: '15px' }} />
          </Link>
        </div>
        <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
      </div>
    );
  }

  const strength = passwordStrength();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div style={{ width: '100%', maxWidth: '440px', animation: 'fadeInUp 0.5s ease', position: 'relative', zIndex: 1 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '40px' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
            <Calendar style={{ width: '20px', height: '20px', color: 'white' }} />
          </div>
          <span style={{ fontSize: '22px', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Evently</span>
        </Link>

        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px' }}>Create your account</h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#a5b4fc', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px', backdropFilter: 'blur(16px)', boxShadow: '0 4px 40px rgba(0,0,0,0.4)' }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '12px 16px', color: '#fca5a5', fontSize: '13px', marginBottom: '20px' }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#64748b' }} />
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="John Doe"
                  style={{ width: '100%', paddingLeft: '42px', paddingRight: '14px', paddingTop: '11px', paddingBottom: '11px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#64748b' }} />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@gmail.com"
                  style={{ width: '100%', paddingLeft: '42px', paddingRight: '14px', paddingTop: '11px', paddingBottom: '11px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <p style={{ fontSize: '11px', color: '#475569', marginTop: '5px' }}>A verification link will be sent. Must verify before login.</p>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#64748b' }} />
                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 chars, uppercase & number"
                  style={{ width: '100%', paddingLeft: '42px', paddingRight: '44px', paddingTop: '11px', paddingBottom: '11px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
                  {showPassword ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                </button>
              </div>
              {password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= strength ? strengthColor[strength] : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
                    ))}
                  </div>
                  <p style={{ fontSize: '11px', color: strengthColor[strength], marginTop: '4px', fontWeight: 600 }}>{strengthLabel[strength]}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#64748b' }} />
                <input type={showPassword ? 'text' : 'password'} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat your password"
                  style={{ width: '100%', paddingLeft: '42px', paddingRight: '14px', paddingTop: '11px', paddingBottom: '11px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #3b82f6)',
              color: 'white', border: 'none', borderRadius: '11px',
              fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 0 25px rgba(99,102,241,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              marginTop: '8px',
            }}>
              {loading ? 'Creating account…' : <><ShieldCheck style={{ width: '15px', height: '15px' }} /> Create Account</>}
            </button>
          </form>
        </div>
      </div>
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
