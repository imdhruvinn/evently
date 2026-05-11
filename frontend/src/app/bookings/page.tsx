"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { withAuth } from "@/components/hoc/withAuth";
import { apiClient } from "@/lib/api";
import { Booking } from "@/types";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { Calendar, MapPin, Users, IndianRupee, AlertCircle, Download, XCircle, Ticket, ArrowRight, Eye } from "lucide-react";
import { useToast } from "@/components/Toast";
import CancelBookingModal from "@/components/CancelBookingModal";

function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const { showToast } = useToast();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<{ id: string; eventName: string; quantity: number; totalPrice: number; isSeatLevel: boolean } | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'CONFIRMED' | 'PENDING' | 'CANCELLED'>('ALL');

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const res = await apiClient.getUserBookings(user.id);
        setBookings((res as any)?.data?.bookings || (res as any)?.bookings || []);
      } catch { /* empty */ }
      finally { setLoading(false); }
    };
    load();
  }, [user?.id]);

  const initiateCancelBooking = (b: Booking) => {
    setBookingToCancel({ id: b.id, eventName: b.event.name, quantity: b.quantity, totalPrice: Number(b.totalPrice), isSeatLevel: b.event.seatLevelBooking || false });
    setIsCancelModalOpen(true);
  };

  const handleCancelBooking = async (quantity: number) => {
    if (!bookingToCancel) return;
    try {
      setCancellingId(bookingToCancel.id);
      const res = await apiClient.cancelBooking(bookingToCancel.id, quantity) as any;
      if (user?.id) {
        const br = await apiClient.getUserBookings(user.id);
        setBookings((br as any)?.data?.bookings || (br as any)?.bookings || []);
      }
      showToast(res?.data?.refundAmount ? `Cancelled. ₹${Number(res.data.refundAmount).toFixed(2)} refund initiated.` : "Booking cancelled", "success");
    } catch { showToast("Failed to cancel booking.", "error"); }
    finally { setCancellingId(null); setBookingToCancel(null); }
  };

  const handleDownloadTicket = async (id: string) => {
    try { setDownloadingId(id); await apiClient.downloadTicket(id); showToast("Ticket downloaded", "success"); }
    catch { showToast("Failed to download ticket.", "error"); }
    finally { setDownloadingId(null); }
  };

  const handleViewTicket = async (id: string) => {
    try {
      setViewingId(id);
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/tickets/${id}/download`;
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to load ticket');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      // Revoke after a short delay to allow the new tab to load
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
      showToast("Ticket opened in new tab", "success");
    } catch {
      // Fallback: trigger a normal download
      showToast("Opening failed — downloading instead", "info");
      handleDownloadTicket(id);
    } finally {
      setViewingId(null);
    }
  };

  const isEventPast = (t: string) => new Date(t) < new Date();
  const canCancel = (b: Booking) => b.status === "CONFIRMED" && !isEventPast(b.event.startTime);

  const statusStyle = (s: string) => {
    if (s === 'CONFIRMED') return { color: '#6ee7b7', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' };
    if (s === 'PENDING') return { color: '#fcd34d', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' };
    return { color: '#fca5a5', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' };
  };

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b', fontSize: '14px' }}>Loading your bookings…</p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>
      <Navbar />

      <main style={{ maxWidth: '1024px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', animation: 'fadeInUp 0.4s ease' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#f1f5f9', marginBottom: '6px' }}>My Bookings</h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>Track and manage all your event bookings in one place.</p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total', value: bookings.length, color: '#6366f1' },
            { label: 'Confirmed', value: bookings.filter(b => b.status === 'CONFIRMED').length, color: '#10b981' },
            { label: 'Pending', value: bookings.filter(b => b.status === 'PENDING').length, color: '#f59e0b' },
            { label: 'Cancelled', value: bookings.filter(b => b.status === 'CANCELLED').length, color: '#ef4444' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', fontWeight: 800, color }}>{value}</span>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {(['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none',
              background: filter === f ? 'linear-gradient(135deg, #6366f1, #3b82f6)' : 'rgba(255,255,255,0.05)',
              color: filter === f ? 'white' : '#64748b',
              boxShadow: filter === f ? '0 0 15px rgba(99,102,241,0.3)' : 'none',
              transition: 'all 0.2s ease',
            }}>{f}</button>
          ))}
        </div>

        {/* Bookings List */}
        {filtered.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filtered.map((booking, i) => (
              <div key={booking.id} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '18px', overflow: 'hidden', backdropFilter: 'blur(10px)',
                animation: `fadeInUp 0.4s ease ${i * 50}ms both`,
                transition: 'border-color 0.2s ease',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.2)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'}
              >
                <div style={{ padding: '22px 24px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    {/* Left — Event Info */}
                    <div style={{ flex: '1 1 300px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#f1f5f9' }}>{booking.event.name}</h3>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', letterSpacing: '0.04em', textTransform: 'uppercase', flexShrink: 0, ...statusStyle(booking.status) }}>
                          {booking.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '11px', color: '#475569', marginBottom: '14px', fontFamily: 'monospace' }}>
                        #{booking.id.slice(-10).toUpperCase()}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
                        {[
                          { icon: Calendar, text: new Date(booking.event.startTime).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) },
                          { icon: MapPin, text: booking.event.venue },
                          { icon: Users, text: `${booking.quantity} ${booking.quantity === 1 ? 'ticket' : 'tickets'}` },
                          { icon: IndianRupee, text: `₹${parseFloat(booking.totalPrice).toFixed(2)}` },
                        ].map(({ icon: Icon, text }, j) => (
                          <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: '#94a3b8' }}>
                            <Icon style={{ width: '13px', height: '13px', flexShrink: 0, color: '#6366f1' }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</span>
                          </div>
                        ))}
                      </div>
                      {isEventPast(booking.event.startTime) && (
                        <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                          <AlertCircle style={{ width: '13px', height: '13px', color: '#64748b' }} />
                          <span style={{ fontSize: '12px', color: '#64748b' }}>This event has already occurred</span>
                        </div>
                      )}
                    </div>

                    {/* Right — Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0, minWidth: '165px' }}>
                      <Link href={`/events/${booking.event.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', borderRadius: '9px', fontSize: '12px', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s ease' }}>
                        <ArrowRight style={{ width: '13px', height: '13px' }} /> View Event
                      </Link>
                      {booking.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleViewTicket(booking.id)}
                          disabled={viewingId === booking.id}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 16px', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(59,130,246,0.15))', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc', borderRadius: '9px', fontSize: '12px', fontWeight: 700, cursor: viewingId === booking.id ? 'not-allowed' : 'pointer', opacity: viewingId === booking.id ? 0.6 : 1, transition: 'all 0.2s ease' }}
                        >
                          <Eye style={{ width: '13px', height: '13px' }} />
                          {viewingId === booking.id ? 'Opening…' : 'View Full Ticket'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDownloadTicket(booking.id)}
                        disabled={downloadingId === booking.id}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#6ee7b7', borderRadius: '9px', fontSize: '12px', fontWeight: 600, cursor: downloadingId === booking.id ? 'not-allowed' : 'pointer', opacity: downloadingId === booking.id ? 0.6 : 1, transition: 'all 0.2s ease' }}
                      >
                        <Download style={{ width: '13px', height: '13px' }} />
                        {downloadingId === booking.id ? 'Downloading…' : 'Download Ticket'}
                      </button>
                      {canCancel(booking) && (
                        <button
                          onClick={() => initiateCancelBooking(booking)}
                          disabled={cancellingId === booking.id}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', borderRadius: '9px', fontSize: '12px', fontWeight: 600, cursor: cancellingId === booking.id ? 'not-allowed' : 'pointer', opacity: cancellingId === booking.id ? 0.6 : 1, transition: 'all 0.2s ease' }}
                        >
                          <XCircle style={{ width: '13px', height: '13px' }} />
                          {cancellingId === booking.id ? 'Cancelling…' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ width: '72px', height: '72px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Ticket style={{ width: '32px', height: '32px', color: '#6366f1', opacity: 0.7 }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>No bookings found</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '28px' }}>
              {filter === 'ALL' ? "You haven't made any bookings yet." : `No ${filter.toLowerCase()} bookings.`}
            </p>
            <Link href="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', color: 'white', borderRadius: '10px', fontSize: '14px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 0 20px rgba(99,102,241,0.35)' }}>
              Browse Events <ArrowRight style={{ width: '15px', height: '15px' }} />
            </Link>
          </div>
        )}
      </main>

      <CancelBookingModal
        isOpen={isCancelModalOpen}
        onClose={() => { setIsCancelModalOpen(false); setBookingToCancel(null); }}
        onConfirm={handleCancelBooking}
        booking={bookingToCancel}
      />

      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default withAuth(BookingsPage);
