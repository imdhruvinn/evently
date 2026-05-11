"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { Event } from "@/types";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Users, Search, Filter, Tag, X, IndianRupee, ChevronLeft, ChevronRight, Ticket } from "lucide-react";

const CATEGORY_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  CONFERENCE:    { bg: 'rgba(59,130,246,0.12)',  color: '#93c5fd', border: 'rgba(59,130,246,0.3)' },
  WORKSHOP:      { bg: 'rgba(16,185,129,0.12)',  color: '#6ee7b7', border: 'rgba(16,185,129,0.3)' },
  NETWORKING:    { bg: 'rgba(139,92,246,0.12)',  color: '#c4b5fd', border: 'rgba(139,92,246,0.3)' },
  SOCIAL:        { bg: 'rgba(236,72,153,0.12)',  color: '#f9a8d4', border: 'rgba(236,72,153,0.3)' },
  BUSINESS:      { bg: 'rgba(99,102,241,0.12)',  color: '#a5b4fc', border: 'rgba(99,102,241,0.3)' },
  ENTERTAINMENT: { bg: 'rgba(245,158,11,0.12)',  color: '#fcd34d', border: 'rgba(245,158,11,0.3)' },
  SPORTS:        { bg: 'rgba(239,68,68,0.12)',   color: '#fca5a5', border: 'rgba(239,68,68,0.3)'  },
  EDUCATION:     { bg: 'rgba(6,182,212,0.12)',   color: '#67e8f9', border: 'rgba(6,182,212,0.3)'  },
  CULTURAL:      { bg: 'rgba(251,113,133,0.12)', color: '#fda4af', border: 'rgba(251,113,133,0.3)'},
  OTHER:         { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8', border: 'rgba(100,116,139,0.3)'},
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("startTime");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showFilters, setShowFilters] = useState(false);

  const categoryOptions = [
    { value: "", label: "All Categories" },
    { value: "CONFERENCE", label: "Conference" },
    { value: "WORKSHOP", label: "Workshop" },
    { value: "NETWORKING", label: "Networking" },
    { value: "SOCIAL", label: "Social" },
    { value: "BUSINESS", label: "Business" },
    { value: "ENTERTAINMENT", label: "Entertainment" },
    { value: "SPORTS", label: "Sports" },
    { value: "EDUCATION", label: "Education" },
    { value: "CULTURAL", label: "Cultural" },
    { value: "OTHER", label: "Other" },
  ];

  const loadEvents = async (
    page = 1, searchQuery = search, category = selectedCategory,
    minPrice = priceRange.min, maxPrice = priceRange.max,
    currentSortBy = sortBy, currentSortOrder = sortOrder
  ) => {
    setLoading(true);
    try {
      const response = await apiClient.getEvents(page, 12, searchQuery, category, minPrice, maxPrice, currentSortBy, currentSortOrder);
      const data = (response as any)?.data;
      if (data) {
        setEvents(data.events || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setCurrentPage(data.pagination?.currentPage || 1);
      }
    } catch { setEvents([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadEvents(); }, [sortBy, sortOrder]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setCurrentPage(1); loadEvents(1, search, selectedCategory, priceRange.min, priceRange.max); };
  const handleCategoryChange = (cat: string) => { setSelectedCategory(cat); setCurrentPage(1); loadEvents(1, search, cat, priceRange.min, priceRange.max); };
  const handlePriceFilter = () => { setCurrentPage(1); loadEvents(1, search, selectedCategory, priceRange.min, priceRange.max); };
  const clearFilters = () => { setSelectedCategory(""); setPriceRange({ min: "", max: "" }); setSearch(""); setCurrentPage(1); setSortBy("startTime"); setSortOrder("asc"); loadEvents(1, "", "", "", "", "startTime", "asc"); };
  const handlePageChange = (page: number) => { loadEvents(page, search, selectedCategory, priceRange.min, priceRange.max); };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const formatPrice = (p: string) => parseFloat(p) === 0 ? "Free" : `₹${parseFloat(p).toFixed(0)}`;
  const catStyle = (cat: string) => CATEGORY_COLORS[cat] || CATEGORY_COLORS.OTHER;
  const hasActiveFilters = selectedCategory || search || priceRange.min || priceRange.max;

  const inputStyle = { width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>
      <Navbar />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '13px', color: '#6366f1', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px' }}>Explore</p>
          <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px' }}>Discover Events</h1>
          <p style={{ fontSize: '16px', color: '#64748b' }}>Find and book amazing events happening around you</p>
        </div>

        {/* Search & Filters */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '24px', marginBottom: '28px', backdropFilter: 'blur(16px)' }}>
          <form onSubmit={handleSearch} style={{ marginBottom: '16px' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '17px', height: '17px', color: '#64748b' }} />
              <input type="text" placeholder="Search events by name, venue, or description…" value={search} onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '44px', paddingRight: '120px' }}
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
              <button type="submit" style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', padding: '7px 16px', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', color: 'white', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Search</button>
            </div>
          </form>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <select value={selectedCategory} onChange={e => handleCategoryChange(e.target.value)}
                style={{ ...inputStyle, width: 'auto', padding: '8px 12px' }}>
                {categoryOptions.map(o => <option key={o.value} value={o.value} style={{ background: '#0d1424' }}>{o.label}</option>)}
              </select>

              <button onClick={() => setShowFilters(!showFilters)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: showFilters ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${showFilters ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '9px', color: showFilters ? '#a5b4fc' : '#94a3b8', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                <Filter style={{ width: '14px', height: '14px' }} /> Filters
              </button>

              {hasActiveFilters && (
                <button onClick={clearFilters}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '9px', color: '#fca5a5', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                  <X style={{ width: '14px', height: '14px' }} /> Clear All
                </button>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Sort:</span>
              <select value={`${sortBy}-${sortOrder}`} onChange={e => { const [f, o] = e.target.value.split("-"); setSortBy(f); setSortOrder(o); }}
                style={{ ...inputStyle, width: 'auto', padding: '8px 12px', fontSize: '13px' }}>
                <option value="startTime-asc" style={{ background: '#0d1424' }}>Date (Earliest)</option>
                <option value="startTime-desc" style={{ background: '#0d1424' }}>Date (Latest)</option>
                <option value="price-asc" style={{ background: '#0d1424' }}>Price ↑</option>
                <option value="price-desc" style={{ background: '#0d1424' }}>Price ↓</option>
                <option value="name-asc" style={{ background: '#0d1424' }}>Name A–Z</option>
                <option value="name-desc" style={{ background: '#0d1424' }}>Name Z–A</option>
              </select>
            </div>
          </div>

          {showFilters && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Price Range (₹)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '320px' }}>
                <input type="number" placeholder="Min" value={priceRange.min} onChange={e => setPriceRange(p => ({ ...p, min: e.target.value }))}
                  style={inputStyle} onFocus={e => { e.target.style.borderColor = '#6366f1'; }} onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
                <span style={{ color: '#64748b', flexShrink: 0 }}>to</span>
                <input type="number" placeholder="Max" value={priceRange.max} onChange={e => setPriceRange(p => ({ ...p, max: e.target.value }))}
                  style={inputStyle} onFocus={e => { e.target.style.borderColor = '#6366f1'; }} onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
                <button onClick={handlePriceFilter} style={{ padding: '10px 18px', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', color: 'white', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Apply</button>
              </div>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
              <p style={{ color: '#64748b', fontSize: '14px' }}>Loading events…</p>
            </div>
          </div>
        )}

        {/* Events Grid */}
        {!loading && events.length > 0 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              {events.map((event, i) => {
                const cs = catStyle(event.category);
                const fillPct = event.capacity ? Math.round(((event.capacity - (event.availableCapacity ?? event.capacity)) / event.capacity) * 100) : 0;
                return (
                  <div key={event.id} className="event-card" style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '18px', overflow: 'hidden', backdropFilter: 'blur(10px)',
                    animation: `fadeInUp 0.4s ease ${(i % 6) * 60}ms both`,
                  }}
                  >
                    {/* Image */}
                    <div className="event-card-img-wrap" style={{ width: '100%', height: '180px', position: 'relative' }}>
                      {event.imageUrl ? (
                        <Image src={event.imageUrl} alt={event.name} fill style={{ objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(59,130,246,0.2) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Calendar style={{ width: '40px', height: '40px', color: 'rgba(165,180,252,0.6)' }} />
                        </div>
                      )}
                      {/* Overlay gradient */}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(transparent, rgba(10,15,30,0.8))' }} />
                      {/* Fill bar */}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.1)' }}>
                        <div style={{ height: '100%', width: `${fillPct}%`, background: fillPct > 80 ? '#ef4444' : fillPct > 50 ? '#f59e0b' : '#10b981', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>

                    <div style={{ padding: '18px' }}>
                      {/* Category + Tags */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', letterSpacing: '0.05em', textTransform: 'uppercase', background: cs.bg, color: cs.color, border: `1px solid ${cs.border}` }}>
                          {event.category}
                        </span>
                        {event.tags && event.tags.length > 0 && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b' }}>
                            <Tag style={{ width: '10px', height: '10px' }} />
                            {event.tags.slice(0, 2).join(", ")}
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', marginBottom: '6px', lineHeight: 1.35 }} className="line-clamp-2">{event.name}</h3>
                      {event.description && <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px', lineHeight: 1.5 }} className="line-clamp-2">{event.description}</p>}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                        {[
                          { icon: Calendar, text: `${formatDate(event.startTime)} · ${formatTime(event.startTime)}` },
                          { icon: MapPin, text: event.venue },
                          { icon: Users, text: `${event.availableCapacity ?? '?'} / ${event.capacity} spots left` },
                        ].map(({ icon: Icon, text }, j) => (
                          <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
                            <Icon style={{ width: '13px', height: '13px', color: '#6366f1', flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                          {formatPrice(event.price)}
                        </div>
                        <Link href={`/events/${event.id}`} className="btn-glow" style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '8px 18px',
                          background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                          color: 'white', borderRadius: '9px',
                          fontSize: '13px', fontWeight: 700, textDecoration: 'none',
                          boxShadow: '0 0 15px rgba(99,102,241,0.25)',
                        }}>
                          <Ticket style={{ width: '13px', height: '13px' }} /> Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}
                  style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', color: '#94a3b8', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', opacity: currentPage <= 1 ? 0.4 : 1 }}>
                  <ChevronLeft style={{ width: '16px', height: '16px' }} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => handlePageChange(page)}
                    style={{ padding: '8px 14px', background: currentPage === page ? 'linear-gradient(135deg, #6366f1, #3b82f6)' : 'rgba(255,255,255,0.05)', border: currentPage === page ? 'none' : '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', color: currentPage === page ? 'white' : '#94a3b8', fontSize: '14px', fontWeight: currentPage === page ? 700 : 400, cursor: 'pointer', boxShadow: currentPage === page ? '0 0 12px rgba(99,102,241,0.3)' : 'none' }}>
                    {page}
                  </button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}
                  style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', color: '#94a3b8', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', opacity: currentPage >= totalPages ? 0.4 : 1 }}>
                  <ChevronRight style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && events.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px' }}>
            <div style={{ width: '72px', height: '72px', background: 'rgba(99,102,241,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Calendar style={{ width: '32px', height: '32px', color: '#6366f1', opacity: 0.7 }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9', marginBottom: '10px' }}>No events found</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '28px' }}>
              {hasActiveFilters ? "Try adjusting your search filters." : "No events are currently available. Check back soon!"}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} style={{ padding: '11px 24px', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
