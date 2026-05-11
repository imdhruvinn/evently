'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { Calendar, LayoutDashboard, BookOpen, LogOut, Settings, Ticket } from 'lucide-react';

interface NavbarProps {
  transparent?: boolean;
}

export function Navbar({ transparent = false }: NavbarProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <nav style={{
      background: transparent ? 'transparent' : 'rgba(10,15,30,0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: transparent ? 'none' : '1px solid rgba(255,255,255,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 15px rgba(99,102,241,0.35)'
            }}>
              <Calendar style={{ width: '18px', height: '18px', color: 'white' }} />
            </div>
            <span style={{
              fontSize: '20px', fontWeight: 800,
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Evently</span>
          </Link>

          {/* Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {isAuthenticated ? (
              <>
                <NavLink href="/events" active={isActive('/events') && !isActive('/admin')}>
                  <Ticket style={{ width: '15px', height: '15px' }} /> Events
                </NavLink>
                <NavLink href="/bookings" active={isActive('/bookings')}>
                  <BookOpen style={{ width: '15px', height: '15px' }} /> My Bookings
                </NavLink>
                <NavLink href="/dashboard" active={isActive('/dashboard')}>
                  <LayoutDashboard style={{ width: '15px', height: '15px' }} /> Dashboard
                </NavLink>
                {user?.role === 'ADMIN' && (
                  <Link href="/admin" style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '7px 16px',
                    background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                    color: 'white', borderRadius: '8px',
                    fontSize: '13px', fontWeight: 600, textDecoration: 'none',
                    boxShadow: '0 0 15px rgba(99,102,241,0.3)',
                    transition: 'opacity 0.2s ease',
                    marginLeft: '4px',
                  }}>
                    <Settings style={{ width: '14px', height: '14px' }} /> Admin
                  </Link>
                )}
                <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', margin: '0 6px' }} />
                <button
                  onClick={logout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px',
                    background: 'rgba(239,68,68,0.1)',
                    color: '#fca5a5',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '8px',
                    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.2)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.4)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.2)';
                  }}
                >
                  <LogOut style={{ width: '14px', height: '14px' }} /> Logout
                </button>
              </>
            ) : (
              <>
                <NavLink href="/events" active={isActive('/events')}>Events</NavLink>
                <NavLink href="/login" active={isActive('/login')}>Sign In</NavLink>
                <Link href="/register" style={{
                  display: 'flex', alignItems: 'center',
                  padding: '8px 20px',
                  background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                  color: 'white', borderRadius: '8px',
                  fontSize: '13px', fontWeight: 600, textDecoration: 'none',
                  boxShadow: '0 0 15px rgba(99,102,241,0.3)',
                  marginLeft: '4px',
                }}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', gap: '5px',
      padding: '7px 12px',
      color: active ? '#a5b4fc' : 'rgba(148,163,184,0.85)',
      background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
      borderRadius: '8px',
      fontSize: '13px', fontWeight: active ? 600 : 500,
      textDecoration: 'none',
      border: active ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
      transition: 'all 0.2s ease',
    }}>
      {children}
    </Link>
  );
}
