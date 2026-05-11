'use client';

import { useAuth } from '@/contexts/AuthContext';
import { withAuth } from '@/components/hoc/withAuth';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Event, Booking } from '@/types';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Calendar, Ticket, IndianRupee, CheckCircle, ArrowRight, Clock, MapPin, TrendingUp } from 'lucide-react';

function DashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const [eventsRes, bookingsRes] = await Promise.all([
          apiClient.getEvents(),
          apiClient.getUserBookings(user.id),
        ]);
        setEvents((eventsRes as any)?.data?.events || []);
        setBookings((bookingsRes as any)?.data?.bookings || []);
      } catch { setEvents([]); setBookings([]); }
      finally { setLoading(false); }
    };
    load();
  }, [user?.id]);

  const upcomingEvents = events.filter(e => e?.startTime && new Date(e.startTime) > new Date()).slice(0, 3);
  const recentBookings = bookings.filter(b => b?.createdAt).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  const totalSpent = bookings.filter(b => b?.totalPrice).reduce((s, b) => s + parseFloat(b.totalPrice || '0'), 0);
  const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;

  const statusStyle = (s: string) => {
    if (s === 'CONFIRMED') return { color: '#6ee7b7', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' };
    if (s === 'PENDING') return { color: '#fcd34d', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' };
    return { color: '#fca5a5', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' };
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#64748b', fontSize: '14px' }}>Loading your dashboard…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <Navbar />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>
        {/* Welcome Header */}
        <div style={{ marginBottom: '36px', animation: 'fadeInUp 0.4s ease' }}>
          <p style={{ fontSize: '13px', color: '#6366f1', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px' }}>Welcome back</p>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#f1f5f9', marginBottom: '6px' }}>
            Hello, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>Here&apos;s an overview of your activity on Evently.</p>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { icon: Calendar, color: '#6366f1', label: 'Total Events', value: events.length, bg: 'rgba(99,102,241,0.1)' },
            { icon: Ticket, color: '#3b82f6', label: 'My Bookings', value: bookings.length, bg: 'rgba(59,130,246,0.1)' },
            { icon: CheckCircle, color: '#10b981', label: 'Confirmed', value: confirmed, bg: 'rgba(16,185,129,0.1)' },
            { icon: IndianRupee, color: '#f59e0b', label: 'Total Spent', value: `₹${totalSpent.toFixed(0)}`, bg: 'rgba(245,158,11,0.1)' },
          ].map(({ icon: Icon, color, label, value, bg }, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '22px', backdropFilter: 'blur(10px)', transition: 'all 0.25s ease', animation: `fadeInUp 0.4s ease ${i * 60}ms both` }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${color}30`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', background: bg, border: `1px solid ${color}30`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon style={{ width: '20px', height: '20px', color }} />
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginBottom: '2px' }}>{label}</p>
                  <p style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', color: 'white', borderRadius: '10px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
            <Calendar style={{ width: '14px', height: '14px' }} /> Browse Events
          </Link>
          <Link href="/bookings" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
            <Ticket style={{ width: '14px', height: '14px' }} /> My Bookings
          </Link>
          {user?.role === 'ADMIN' && (
            <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#fcd34d', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
              <TrendingUp style={{ width: '14px', height: '14px' }} /> Admin Panel
            </Link>
          )}
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {/* Upcoming Events */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
            <div style={{ padding: '22px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9' }}>Upcoming Events</h2>
              <Link href="/events" style={{ fontSize: '12px', color: '#6366f1', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                View all <ArrowRight style={{ width: '12px', height: '12px' }} />
              </Link>
            </div>
            <div style={{ padding: '16px' }}>
              {upcomingEvents.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {upcomingEvents.map(event => (
                    <Link key={event.id} href={`/events/${event.id}`} style={{ display: 'block', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', textDecoration: 'none', transition: 'all 0.2s ease' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.2)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
                    >
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9', marginBottom: '6px' }}>{event.name}</p>
                      <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock style={{ width: '11px', height: '11px' }} />{new Date(event.startTime).toLocaleDateString('en-IN')}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin style={{ width: '11px', height: '11px' }} />{event.venue?.slice(0, 20) || 'TBD'}</span>
                        <span style={{ marginLeft: 'auto', color: '#a5b4fc', fontWeight: 600 }}>₹{event.price}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: '#475569' }}>
                  <Calendar style={{ width: '32px', height: '32px', margin: '0 auto 10px', opacity: 0.4 }} />
                  <p style={{ fontSize: '13px' }}>No upcoming events</p>
                  <Link href="/events" style={{ fontSize: '12px', color: '#6366f1', textDecoration: 'none' }}>Browse events →</Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
            <div style={{ padding: '22px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9' }}>Recent Bookings</h2>
              <Link href="/bookings" style={{ fontSize: '12px', color: '#6366f1', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                View all <ArrowRight style={{ width: '12px', height: '12px' }} />
              </Link>
            </div>
            <div style={{ padding: '16px' }}>
              {recentBookings.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recentBookings.map(booking => (
                    <div key={booking.id} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>{booking.event?.name || 'Event'}</p>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', letterSpacing: '0.04em', textTransform: 'uppercase', ...statusStyle(booking.status) }}>
                          {booking.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '12px' }}>
                        <span>{booking.quantity} {booking.quantity === 1 ? 'ticket' : 'tickets'}</span>
                        <span style={{ color: '#a5b4fc', fontWeight: 600 }}>₹{parseFloat(booking.totalPrice).toFixed(0)}</span>
                        <span style={{ marginLeft: 'auto' }}>{new Date(booking.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: '#475569' }}>
                  <Ticket style={{ width: '32px', height: '32px', margin: '0 auto 10px', opacity: 0.4 }} />
                  <p style={{ fontSize: '13px' }}>No bookings yet</p>
                  <Link href="/events" style={{ fontSize: '12px', color: '#6366f1', textDecoration: 'none' }}>Book an event →</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

export default withAuth(DashboardPage);
