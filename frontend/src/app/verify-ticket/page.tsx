'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calendar, MapPin, User, Ticket, CheckCircle, XCircle, Clock } from 'lucide-react';

function VerifyTicketInner() {
  const params = useSearchParams();
  const bookingId = params.get('bookingId');
  const token = params.get('token');
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [data, setData] = useState<any>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!bookingId || !token) { setStatus('invalid'); setMessage('Invalid QR code — missing parameters.'); return; }
    fetch(`/api/tickets/verify/${bookingId}?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(res => {
        // API returns { status:'success', message, data:{booking} } on valid
        // or { status:'error', message } on invalid
        const isValid = res.status === 'success';
        if (isValid && res.data?.booking) {
          setStatus('valid');
          setData(res.data.booking);
          setMessage(res.message || 'Ticket verified successfully.');
        } else {
          setStatus('invalid');
          setMessage(res.message || 'Ticket verification failed.');
        }
      })
      .catch(() => { setStatus('invalid'); setMessage('Network error. Please try again.'); });
  }, [bookingId, token]);

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fmtT = (d: string) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg,#6366f1,#3b82f6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'white', fontWeight: 900, fontSize: '20px' }}>E</span>
        </div>
        <span style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9' }}>Evently</span>
      </div>

      <div style={{ width: '100%', maxWidth: '420px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
        {/* Status Header */}
        <div style={{
          padding: '28px 24px', textAlign: 'center',
          background: status === 'loading' ? 'rgba(99,102,241,0.1)' : status === 'valid' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          borderBottom: `1px solid ${status === 'loading' ? 'rgba(99,102,241,0.2)' : status === 'valid' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
        }}>
          {status === 'loading' && (
            <>
              <div style={{ width: '52px', height: '52px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
              <p style={{ color: '#a5b4fc', fontSize: '15px', margin: 0 }}>Verifying ticket…</p>
            </>
          )}
          {status === 'valid' && (
            <>
              <CheckCircle style={{ width: '52px', height: '52px', color: '#10b981', margin: '0 auto 12px', display: 'block' }} />
              <h1 style={{ color: '#6ee7b7', fontSize: '22px', fontWeight: 800, margin: '0 0 4px' }}>Ticket Valid</h1>
              <p style={{ color: '#34d399', fontSize: '13px', margin: 0 }}>{message}</p>
            </>
          )}
          {status === 'invalid' && (
            <>
              <XCircle style={{ width: '52px', height: '52px', color: '#ef4444', margin: '0 auto 12px', display: 'block' }} />
              <h1 style={{ color: '#fca5a5', fontSize: '22px', fontWeight: 800, margin: '0 0 4px' }}>Invalid Ticket</h1>
              <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{message}</p>
            </>
          )}
        </div>

        {/* Booking Details */}
        {status === 'valid' && data && (
          <div style={{ padding: '24px' }}>
            <h2 style={{ color: '#f1f5f9', fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>{data.event?.name}</h2>
            {[
              { icon: User, label: 'Attendee', value: data.user?.name },
              { icon: Calendar, label: 'Date', value: fmt(data.event?.startTime) },
              { icon: Clock, label: 'Time', value: fmtT(data.event?.startTime) },
              { icon: MapPin, label: 'Venue', value: data.event?.venue },
              { icon: Ticket, label: 'Booking ID', value: `#${data.id?.slice(-10).toUpperCase()}` },
            ].map(({ icon: Icon, label, value }) => value ? (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                <div style={{ width: '32px', height: '32px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: '14px', height: '14px', color: '#6366f1' }} />
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px' }}>{label}</p>
                  <p style={{ fontSize: '14px', color: '#f1f5f9', margin: 0 }}>{value}</p>
                </div>
              </div>
            ) : null)}

            <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', textAlign: 'center' }}>
              <p style={{ color: '#6ee7b7', fontSize: '12px', fontWeight: 600, margin: 0 }}>CONFIRMED — ALLOW ENTRY</p>
            </div>
          </div>
        )}

        {status === 'invalid' && (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6' }}>
              This ticket could not be verified. It may be expired, already used, or invalid. Contact event support if this is unexpected.
            </p>
          </div>
        )}
      </div>

      <p style={{ color: '#334155', fontSize: '12px', marginTop: '20px' }}>Evently Ticket Verification System</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}

export default function VerifyTicketPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'#0a0f1e', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:'40px', height:'40px', border:'3px solid rgba(99,102,241,0.2)', borderTopColor:'#6366f1', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    }>
      <VerifyTicketInner />
    </Suspense>
  );
}
