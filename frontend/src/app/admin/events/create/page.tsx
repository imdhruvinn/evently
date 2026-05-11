'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { withAdminAuth } from '@/components/hoc/withAuth';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import {
  ArrowLeft, Calendar, MapPin, Users, FileText, Tag, Image as ImageIcon,
  Sparkles, Clock, IndianRupee, LayoutGrid, Plus, Trash2, AlertCircle, CheckCircle2
} from 'lucide-react';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px', color: '#f1f5f9', fontSize: '14px',
  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '6px',
  fontSize: '13px', fontWeight: 600, color: '#94a3b8',
  marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em',
};

const sectionCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px', padding: '20px',
  marginBottom: '28px',
};

const sectionTitle: React.CSSProperties = {
  fontSize: '13px', fontWeight: 700, color: '#6366f1',
  textTransform: 'uppercase', letterSpacing: '0.08em',
  marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
};

function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState('');

  const categoryOptions = [
    { value: 'CONFERENCE', label: '🎤 Conference' },
    { value: 'WORKSHOP', label: '🛠️ Workshop' },
    { value: 'NETWORKING', label: '🤝 Networking' },
    { value: 'SOCIAL', label: '🎉 Social' },
    { value: 'BUSINESS', label: '💼 Business' },
    { value: 'ENTERTAINMENT', label: '🎭 Entertainment' },
    { value: 'SPORTS', label: '⚽ Sports' },
    { value: 'EDUCATION', label: '📚 Education' },
    { value: 'CULTURAL', label: '🎨 Cultural' },
    { value: 'OTHER', label: '✨ Other' },
  ];

  const [formData, setFormData] = useState({
    name: '', description: '', startTime: '', endTime: '',
    venue: '', capacity: '', price: '', category: 'OTHER' as const,
    tags: '', imageUrl: '', seatLevelBooking: false,
  });

  const [sectionConfig, setSectionConfig] = useState([
    { name: 'General', capacity: 100, price: 500, seatsPerRow: 10, seatType: 'REGULAR' as const },
    { name: 'VIP', capacity: 50, price: 1500, seatsPerRow: 10, seatType: 'VIP' as const },
  ]);

  const addSection = () => setSectionConfig([...sectionConfig, { name: 'New Section', capacity: 50, price: 1000, seatsPerRow: 10, seatType: 'REGULAR' as const }]);
  const updateSection = (index: number, field: string, value: string | number) => {
    const n = [...sectionConfig]; n[index] = { ...n[index], [field]: value }; setSectionConfig(n as any);
  };
  const removeSection = (index: number) => { if (sectionConfig.length <= 1) return; setSectionConfig(sectionConfig.filter((_, i) => i !== index)); };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) || 0 : value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    if (!formData.name.trim()) { setError('Event name is required'); setLoading(false); return; }
    if (!formData.venue.trim()) { setError('Venue is required'); setLoading(false); return; }
    if (!formData.startTime) { setError('Start time is required'); setLoading(false); return; }
    const totalCapacity = formData.seatLevelBooking ? sectionConfig.reduce((s, x) => s + x.capacity, 0) : parseInt(formData.capacity);
    const minPrice = formData.seatLevelBooking ? (sectionConfig.length ? Math.min(...sectionConfig.map(s => s.price)) : 0) : parseFloat(formData.price as any);
    if (!totalCapacity || totalCapacity <= 0) { setError('Valid capacity is required'); setLoading(false); return; }
    if (minPrice === undefined || isNaN(minPrice) || minPrice < 0) { setError('Valid price is required'); setLoading(false); return; }
    if (formData.endTime && new Date(formData.endTime) <= new Date(formData.startTime)) { setError('End time must be after start time'); setLoading(false); return; }
    try {
      await apiClient.createEvent({
        name: formData.name.trim(), description: formData.description.trim() || undefined,
        venue: formData.venue.trim(), startTime: new Date(formData.startTime).toISOString(),
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : undefined,
        capacity: totalCapacity, price: String(minPrice), category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        imageUrl: formData.imageUrl.trim() || undefined, seatLevelBooking: formData.seatLevelBooking,
        sectionConfig: formData.seatLevelBooking ? sectionConfig : undefined,
      } as any);
      router.push('/admin/events');
    } catch (err: any) { setError(err.message || 'Failed to create event'); }
    finally { setLoading(false); }
  };

  const formatDateTimeLocal = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const minDateTime = formatDateTimeLocal(new Date());

  const getFocusStyle = (field: string): React.CSSProperties => focusedField === field
    ? { borderColor: 'rgba(99,102,241,0.6)', boxShadow: '0 0 0 3px rgba(99,102,241,0.15)' } : {};

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #13131f 50%, #0a0a14 100%)', fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Back Button */}
        <Link href="/admin/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontSize: '14px', fontWeight: 500, marginBottom: '32px', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#a5b4fc')}
          onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}>
          <ArrowLeft style={{ width: '16px', height: '16px' }} /> Back to Events
        </Link>

        {/* Page Header */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(99,102,241,0.4)' }}>
              <Sparkles style={{ width: '22px', height: '22px', color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f1f5f9', margin: 0, lineHeight: 1.2 }}>Create New Event</h1>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>Fill in the details to publish a new event for attendees</p>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', marginBottom: '24px' }}>
            <AlertCircle style={{ width: '18px', height: '18px', color: '#f87171', flexShrink: 0 }} />
            <span style={{ color: '#fca5a5', fontSize: '14px' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* ── Section 1: Basic Info ─────────────────────────────── */}
          <div style={sectionCard}>
            <div style={sectionTitle}><FileText style={{ width: '14px', height: '14px' }} /> Basic Information</div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}><FileText style={{ width: '13px', height: '13px' }} /> Event Name *</label>
              <input type="text" name="name" required value={formData.name} onChange={handleInputChange}
                onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField('')}
                style={{ ...inputStyle, ...getFocusStyle('name') }} placeholder="e.g. Tech Summit 2025" />
            </div>

            <div>
              <label style={labelStyle}><FileText style={{ width: '13px', height: '13px' }} /> Description</label>
              <textarea name="description" rows={4} value={formData.description} onChange={handleInputChange}
                onFocus={() => setFocusedField('desc')} onBlur={() => setFocusedField('')}
                style={{ ...inputStyle, ...getFocusStyle('desc'), resize: 'vertical', lineHeight: 1.6 }}
                placeholder="Describe your event — what will attendees experience?" />
            </div>
          </div>

          {/* ── Section 2: Location & Category ───────────────────── */}
          <div style={sectionCard}>
            <div style={sectionTitle}><MapPin style={{ width: '14px', height: '14px' }} /> Location & Category</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={labelStyle}><MapPin style={{ width: '13px', height: '13px' }} /> Venue *</label>
                <input type="text" name="venue" required value={formData.venue} onChange={handleInputChange}
                  onFocus={() => setFocusedField('venue')} onBlur={() => setFocusedField('')}
                  style={{ ...inputStyle, ...getFocusStyle('venue') }} placeholder="Venue name or address" />
              </div>
              <div>
                <label style={labelStyle}><Tag style={{ width: '13px', height: '13px' }} /> Category *</label>
                <select name="category" required value={formData.category} onChange={handleInputChange}
                  onFocus={() => setFocusedField('cat')} onBlur={() => setFocusedField('')}
                  style={{ ...inputStyle, ...getFocusStyle('cat'), cursor: 'pointer' }}>
                  {categoryOptions.map(o => <option key={o.value} value={o.value} style={{ background: '#1e1e2e' }}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── Section 3: Date & Time ────────────────────────────── */}
          <div style={sectionCard}>
            <div style={sectionTitle}><Calendar style={{ width: '14px', height: '14px' }} /> Date & Time</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={labelStyle}><Calendar style={{ width: '13px', height: '13px' }} /> Start Date & Time *</label>
                <input type="datetime-local" name="startTime" required min={minDateTime}
                  value={formData.startTime} onChange={handleInputChange}
                  onFocus={() => setFocusedField('start')} onBlur={() => setFocusedField('')}
                  style={{ ...inputStyle, ...getFocusStyle('start'), colorScheme: 'dark' }} />
              </div>
              <div>
                <label style={labelStyle}><Clock style={{ width: '13px', height: '13px' }} /> End Date & Time</label>
                <input type="datetime-local" name="endTime" min={formData.startTime || minDateTime}
                  value={formData.endTime} onChange={handleInputChange}
                  onFocus={() => setFocusedField('end')} onBlur={() => setFocusedField('')}
                  style={{ ...inputStyle, ...getFocusStyle('end'), colorScheme: 'dark' }} />
                <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#475569' }}>Leave blank for open-ended events</p>
              </div>
            </div>
          </div>

          {/* ── Section 4: Capacity & Pricing ────────────────────── */}
          <div style={sectionCard}>
            <div style={sectionTitle}><Users style={{ width: '14px', height: '14px' }} /> Capacity & Pricing</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}><Users style={{ width: '13px', height: '13px' }} /> Total Capacity *</label>
                <input type="number" name="capacity" min="1"
                  value={formData.seatLevelBooking ? sectionConfig.reduce((s, x) => s + x.capacity, 0) : formData.capacity}
                  onChange={handleInputChange} disabled={formData.seatLevelBooking}
                  onFocus={() => setFocusedField('cap')} onBlur={() => setFocusedField('')}
                  style={{ ...inputStyle, ...getFocusStyle('cap'), opacity: formData.seatLevelBooking ? 0.5 : 1, cursor: formData.seatLevelBooking ? 'not-allowed' : 'text' }}
                  placeholder="Maximum attendees" />
              </div>
              <div>
                <label style={labelStyle}><IndianRupee style={{ width: '13px', height: '13px' }} /> Price (₹) *</label>
                <input type="number" name="price" min="0" step="0.01"
                  value={formData.seatLevelBooking ? (sectionConfig.length ? Math.min(...sectionConfig.map(s => s.price)) : 0) : formData.price}
                  onChange={handleInputChange} disabled={formData.seatLevelBooking}
                  onFocus={() => setFocusedField('price')} onBlur={() => setFocusedField('')}
                  style={{ ...inputStyle, ...getFocusStyle('price'), opacity: formData.seatLevelBooking ? 0.5 : 1, cursor: formData.seatLevelBooking ? 'not-allowed' : 'text' }}
                  placeholder="0.00" />
              </div>
            </div>

            {/* Seat-level toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '14px 16px', background: formData.seatLevelBooking ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${formData.seatLevelBooking ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '10px', transition: 'all 0.2s' }}>
              <div style={{ position: 'relative', width: '42px', height: '24px', flexShrink: 0 }}>
                <input type="checkbox" name="seatLevelBooking" checked={formData.seatLevelBooking} onChange={handleCheckboxChange} style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer', margin: 0 }} />
                <div style={{ width: '42px', height: '24px', borderRadius: '12px', background: formData.seatLevelBooking ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.1)', transition: 'background 0.2s', boxShadow: formData.seatLevelBooking ? '0 0 12px rgba(99,102,241,0.5)' : 'none' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: formData.seatLevelBooking ? '21px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>Enable Assigned Seating</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Let attendees pick their exact seat from a map</div>
              </div>
              {formData.seatLevelBooking && <CheckCircle2 style={{ width: '18px', height: '18px', color: '#6366f1', marginLeft: 'auto' }} />}
            </label>
          </div>

          {/* ── Seat Section Config (conditional) ────────────────── */}
          {formData.seatLevelBooking && (
            <div style={sectionCard}>
              <div style={sectionTitle}><LayoutGrid style={{ width: '14px', height: '14px' }} /> Seat Section Configuration</div>
              {sectionConfig.map((section, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.2fr auto', gap: '10px', alignItems: 'end', marginBottom: '12px', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {[
                    { label: 'Section Name', field: 'name', type: 'text', value: section.name },
                    { label: 'Capacity', field: 'capacity', type: 'number', value: section.capacity },
                    { label: 'Price (₹)', field: 'price', type: 'number', value: section.price },
                    { label: 'Seats/Row', field: 'seatsPerRow', type: 'number', value: section.seatsPerRow },
                  ].map(f => (
                    <div key={f.field}>
                      <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '5px' }}>{f.label}</label>
                      <input type={f.type} value={f.value}
                        onChange={e => updateSection(index, f.field, f.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '5px' }}>Type</label>
                    <select value={section.seatType} onChange={e => updateSection(index, 'seatType', e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9', fontSize: '13px', outline: 'none' }}>
                      <option value="REGULAR">Regular</option>
                      <option value="VIP">VIP</option>
                      <option value="PREMIUM">Premium</option>
                    </select>
                  </div>
                  <button type="button" onClick={() => removeSection(index)} disabled={sectionConfig.length <= 1}
                    style={{ padding: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', cursor: sectionConfig.length <= 1 ? 'not-allowed' : 'pointer', opacity: sectionConfig.length <= 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'end' }}>
                    <Trash2 style={{ width: '15px', height: '15px', color: '#f87171' }} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addSection}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '9px', color: '#a5b4fc', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                <Plus style={{ width: '15px', height: '15px' }} /> Add Section
              </button>
            </div>
          )}

          {/* ── Section 5: Tags & Image ───────────────────────────── */}
          <div style={sectionCard}>
            <div style={sectionTitle}><Tag style={{ width: '14px', height: '14px' }} /> Tags & Media</div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}><Tag style={{ width: '13px', height: '13px' }} /> Tags</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleInputChange}
                onFocus={() => setFocusedField('tags')} onBlur={() => setFocusedField('')}
                style={{ ...inputStyle, ...getFocusStyle('tags') }} placeholder="tech, innovation, startup  (comma-separated)" />
            </div>
            <div>
              <label style={labelStyle}><ImageIcon style={{ width: '13px', height: '13px' }} /> Event Banner Image URL</label>
              <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange}
                onFocus={() => setFocusedField('img')} onBlur={() => setFocusedField('')}
                style={{ ...inputStyle, ...getFocusStyle('img') }} placeholder="https://example.com/banner.jpg" />
              {formData.imageUrl && (
                <div style={{ marginTop: '12px', borderRadius: '10px', overflow: 'hidden', height: '140px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <img src={formData.imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
            </div>
          </div>

          {/* ── Action Buttons ────────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
            <Link href="/admin/events"
              style={{ padding: '12px 28px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '11px', color: '#94a3b8', fontSize: '14px', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center' }}>
              Cancel
            </Link>
            <button type="submit" disabled={loading}
              style={{ padding: '12px 36px', background: loading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '11px', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 0 24px rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {loading ? (
                <><span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Creating...</>
              ) : (
                <><Sparkles style={{ width: '16px', height: '16px' }} /> Create Event</>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: invert(0.6) brightness(1.5); cursor: pointer; }
        select option { background: #1e1e2e; color: #f1f5f9; }
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder, textarea::placeholder { color: #475569; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { opacity: 0.4; }
      `}</style>
    </div>
  );
}

export default withAdminAuth(CreateEventPage);
