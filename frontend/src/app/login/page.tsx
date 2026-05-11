"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Mail, Lock, Eye, EyeOff, ArrowRight, Zap } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/events");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', position: 'relative', overflow: 'hidden' }}>

      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      {/* Left — Branding Panel */}
      <div style={{
        flex: '0 0 45%', display: 'none',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(59,130,246,0.08) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        padding: '48px',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }} className="lg-flex">
        {/* This panel shows on large screens — kept as placeholder for responsive; CSS media query would activate it */}
      </div>

      {/* Right — Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeInUp 0.5s ease' }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '40px' }}>
            <div style={{
              width: '40px', height: '40px',
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              borderRadius: '11px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99,102,241,0.4)',
            }}>
              <Calendar style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <span style={{ fontSize: '22px', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Evently</span>
          </Link>

          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px' }}>Welcome back</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '36px' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: '#a5b4fc', fontWeight: 600, textDecoration: 'none' }}>Create one free</Link>
          </p>

          {/* Card */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '32px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 4px 40px rgba(0,0,0,0.4)',
          }}>
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '10px', padding: '12px 16px',
                color: '#fca5a5', fontSize: '13px', marginBottom: '20px',
              }}>{error}</div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#64748b', pointerEvents: 'none' }} />
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{ width: '100%', paddingLeft: '44px', paddingRight: '14px', paddingTop: '12px', paddingBottom: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>Password</label>
                  <Link href="/forgot-password" style={{ fontSize: '12px', color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#64748b', pointerEvents: 'none' }} />
                  <input
                    type={showPassword ? 'text' : 'password'} required value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ width: '100%', paddingLeft: '44px', paddingRight: '44px', paddingTop: '12px', paddingBottom: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
                    {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '13px',
                  background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #3b82f6)',
                  color: 'white', border: 'none', borderRadius: '11px',
                  fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 0 25px rgba(99,102,241,0.4)',
                  transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  marginTop: '4px',
                }}
              >
                {loading ? 'Signing in…' : <><ArrowRight style={{ width: '16px', height: '16px' }} /> Sign In</>}
              </button>
            </form>
          </div>

          {/* Tagline */}
          <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Zap style={{ width: '12px', height: '12px', color: '#6366f1' }} />
            Secured with email verification & JWT authentication
          </p>
        </div>
      </div>
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
