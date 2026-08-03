import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getAllBookings, updateBookingStatus, getBookingStats } from '../services/bookingService';
import './Admin.css';

const STATUSES = {
  pending:   { label: 'Pending',   bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
  confirmed: { label: 'Confirmed', bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6' },
  completed: { label: 'Completed', bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
  cancelled: { label: 'Cancelled', bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
};

const STATUS_ORDER = ['pending', 'confirmed', 'completed', 'cancelled'];

const SORTS = [
  { id: 'newest',      label: 'Newest first' },
  { id: 'oldest',      label: 'Oldest first' },
  { id: 'date-asc',    label: 'Service date (soonest)' },
  { id: 'amount-desc', label: 'Amount (high to low)' },
  { id: 'amount-asc',  label: 'Amount (low to high)' },
];

/* ── helpers ── */

// Bookings store the local part only (form shows a +971 prefix), so normalise
// anything the customer typed into a full international number.
function intlPhone(phone) {
  let d = String(phone || '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('971')) return d;
  return '971' + d.replace(/^0+/, '');
}

function formatCreated(date) {
  if (!(date instanceof Date) || isNaN(date)) return '—';
  return date.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatServiceDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d)) return value;
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
}

function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

const DD_OPTION_HEIGHT = 38;

/**
 * Status picker that replaces the native <select>.
 * The menu is positioned `fixed` off the trigger's rect so it isn't clipped by
 * the table wrapper's `overflow: hidden`.
 */
function StatusDropdown({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const current = STATUSES[value] || { label: value || '—', dot: '#94A3B8' };

  const place = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const menuHeight = STATUS_ORDER.length * DD_OPTION_HEIGHT + 10;
    const spaceBelow = window.innerHeight - rect.bottom;
    const flipUp = spaceBelow < menuHeight + 16 && rect.top > menuHeight;
    setCoords({
      top: flipUp ? rect.top - menuHeight - 6 : rect.bottom + 6,
      left: rect.left,
      minWidth: Math.max(rect.width, 168),
    });
  };

  const toggle = () => {
    if (disabled) return;
    if (!open) {
      place();
      setActiveIndex(Math.max(0, STATUS_ORDER.indexOf(value)));
    }
    setOpen(o => !o);
  };

  const select = (status) => {
    setOpen(false);
    if (status !== value) onChange(status);
  };

  // Close on outside click, or when the page moves under the fixed menu
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (triggerRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const close = () => setOpen(false);
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [open]);

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
      return;
    }
    if (e.key === 'Escape') {
      e.stopPropagation(); // don't also close the detail drawer
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % STATUS_ORDER.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i - 1 + STATUS_ORDER.length) % STATUS_ORDER.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(STATUS_ORDER.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      select(STATUS_ORDER[activeIndex]);
    }
  };

  return (
    <div className="ui-dropdown">
      <button
        ref={triggerRef}
        type="button"
        className={`ui-dd-trigger${open ? ' open' : ''}`}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="ui-dd-dot" style={{ background: current.dot }} />
        <span className="ui-dd-label">{current.label}</span>
        <svg className="ui-dd-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && coords && (
        <div
          ref={menuRef}
          className="ui-dd-menu"
          role="listbox"
          aria-activedescendant={`ui-dd-opt-${STATUS_ORDER[activeIndex]}`}
          style={{ top: coords.top, left: coords.left, minWidth: coords.minWidth }}
        >
          {STATUS_ORDER.map((status, i) => (
            <button
              key={status}
              id={`ui-dd-opt-${status}`}
              type="button"
              role="option"
              aria-selected={status === value}
              className={`ui-dd-option${status === value ? ' selected' : ''}${i === activeIndex ? ' active' : ''}`}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => select(status)}
            >
              <span className="ui-dd-dot" style={{ background: STATUSES[status].dot }} />
              <span className="ui-dd-option-label">{STATUSES[status].label}</span>
              {status === value && (
                <svg className="ui-dd-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState(null);

  // Listen for auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Fetch bookings when logged in
  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  // Auto-dismiss toasts
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  // Close the detail drawer on Escape
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e) => { if (e.key === 'Escape') setSelectedId(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selectedId]);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);

    // Fresh ID token so the API can verify this request is really an admin.
    const idToken = await user.getIdToken();
    const [allBookings, bookingStats] = await Promise.all([
      getAllBookings(idToken),
      getBookingStats(idToken),
    ]);
    setBookings(allBookings);
    setStats(bookingStats);
    setLoading(false);
    setRefreshing(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setLoginError(
        err.code === 'auth/invalid-credential'
          ? 'Invalid email or password'
          : err.code === 'auth/too-many-requests'
          ? 'Too many attempts. Please try again later.'
          : 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setSelectedId(null);
    signOut(auth);
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);

    const idToken = await user.getIdToken();
    const result = await updateBookingStatus(bookingId, newStatus, idToken);
    if (result.success) {
      setBookings(prev =>
        prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
      );
      setStats(await getBookingStats(idToken));
      setToast({ type: 'success', message: `Booking marked as ${STATUSES[newStatus]?.label || newStatus}` });
    } else {
      setToast({ type: 'error', message: 'Could not update the booking. Please try again.' });
    }
    setUpdatingId(null);
  };

  // Distinct services present in the data, for the service filter
  const services = useMemo(() => {
    const found = new Set();
    bookings.forEach(b => {
      const name = b.serviceName || b.service;
      if (name) found.add(name);
    });
    return [...found].sort();
  }, [bookings]);

  const visibleBookings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = bookings
      .filter(b => filter === 'all' || b.status === filter)
      .filter(b => serviceFilter === 'all' || (b.serviceName || b.service) === serviceFilter)
      .filter(b => {
        if (!q) return true;
        return [b.name, b.phone, b.email, b.area, b.address, b.package, b.serviceName || b.service]
          .some(field => (field || '').toString().toLowerCase().includes(q));
      });

    const byCreated = (b) => (b.createdAt instanceof Date ? b.createdAt.getTime() : 0);

    return [...list].sort((a, b) => {
      switch (sort) {
        case 'oldest':      return byCreated(a) - byCreated(b);
        case 'date-asc':    return String(a.date || '').localeCompare(String(b.date || ''));
        case 'amount-desc': return (b.total || 0) - (a.total || 0);
        case 'amount-asc':  return (a.total || 0) - (b.total || 0);
        default:            return byCreated(b) - byCreated(a);
      }
    });
  }, [bookings, filter, serviceFilter, sort, searchQuery]);

  const selected = bookings.find(b => b.id === selectedId) || null;

  const resetFilters = () => {
    setFilter('all');
    setServiceFilter('all');
    setSearchQuery('');
    setSort('newest');
  };

  const exportCSV = () => {
    const headers = ['Booking ID', 'Created', 'Name', 'Phone', 'Email', 'Service', 'Package',
      'Area', 'Address', 'Date', 'Time', 'Amount (AED)', 'Status', 'Notes'];

    const rows = visibleBookings.map(b => [
      b.id, formatCreated(b.createdAt), b.name, b.phone, b.email,
      b.serviceName || b.service, b.package, b.area, b.address,
      b.date, b.time, b.total || 0, b.status, b.notes,
    ]);

    const csv = [headers, ...rows].map(r => r.map(csvCell).join(',')).join('\r\n');
    // BOM keeps Arabic/accented names readable when opened in Excel
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shinex-bookings-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setToast({ type: 'success', message: `Exported ${visibleBookings.length} bookings` });
  };

  /* ── Auth loading ── */
  if (authLoading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  /* ── Login screen ── */
  if (!user) {
    return (
      <div className="admin-login">
        <div className="admin-login-glow" aria-hidden="true" />
        <div className="admin-login-card">
          <img
            className="admin-login-logo"
            src={`${import.meta.env.BASE_URL}logo.jpeg`}
            alt="ShineX"
          />
          <h1>ShineX Admin</h1>
          <p>Sign in to manage your bookings</p>

          <form onSubmit={handleLogin} id="admin-login-form">
            <div className="admin-form-group">
              <label htmlFor="admin-email">Email</label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="admin-password">Password</label>
              <div className="admin-password-wrap">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  id="admin-password-toggle"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {loginError && (
              <p className="admin-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {loginError}
              </p>
            )}

            <button type="submit" className="admin-login-btn" disabled={loggingIn} id="admin-login-btn">
              {loggingIn ? (
                <><span className="admin-btn-spinner" /> Signing in...</>
              ) : (
                <>
                  Sign In
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <Link to="/" className="admin-back-link" id="admin-back-to-site">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to website
          </Link>
        </div>
      </div>
    );
  }

  /* ── Dashboard ── */
  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-header-left">
            <Link to="/" className="admin-brand" title="Back to website">
              <img src={`${import.meta.env.BASE_URL}logo.jpeg`} alt="ShineX" />
              <span>Shine<strong>X</strong></span>
            </Link>
            <span className="admin-brand-divider" aria-hidden="true" />
            <h1>Bookings Dashboard</h1>
          </div>

          <div className="admin-header-right">
            <div className="admin-user">
              <span className="admin-user-avatar">{(user.email || '?')[0].toUpperCase()}</span>
              <span className="admin-user-email">{user.email}</span>
            </div>
            <button
              className={`admin-refresh-btn${refreshing ? ' spinning' : ''}`}
              onClick={() => fetchData(true)}
              title="Refresh data"
              id="admin-refresh"
              disabled={refreshing}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </button>
            <button className="admin-logout-btn" onClick={handleLogout} id="admin-logout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="admin-body">
        {/* Stats */}
        {stats && (
          <div className="stats-cards">
            <div className="stat-card total">
              <div className="stat-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <div>
                <span className="stat-card__label">Total Bookings</span>
                <strong className="stat-card__value">{stats.total}</strong>
              </div>
            </div>

            <div className="stat-card pending">
              <div className="stat-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div>
                <span className="stat-card__label">Pending</span>
                <strong className="stat-card__value">{stats.pending}</strong>
                {stats.pending > 0 && <span className="stat-card__hint">Needs attention</span>}
              </div>
            </div>

            <div className="stat-card completed">
              <div className="stat-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div>
                <span className="stat-card__label">Completed</span>
                <strong className="stat-card__value">{stats.completed}</strong>
              </div>
            </div>

            <div className="stat-card revenue">
              <div className="stat-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div>
                <span className="stat-card__label">Revenue</span>
                <strong className="stat-card__value">AED {stats.totalRevenue.toLocaleString()}</strong>
                <span className="stat-card__hint">Excludes cancelled</span>
              </div>
            </div>

            <div className="stat-card today">
              <div className="stat-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div>
                <span className="stat-card__label">Booked Today</span>
                <strong className="stat-card__value">{stats.todayBookings}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="admin-toolbar">
          <div className="admin-filters">
            {['all', ...STATUS_ORDER].map(f => (
              <button
                key={f}
                id={`filter-${f}`}
                className={`admin-filter-btn${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f !== 'all' && (
                  <span className="filter-dot" style={{ background: STATUSES[f].dot }} />
                )}
                {f === 'all' ? 'All' : STATUSES[f].label}
                <span className="filter-count">
                  {f === 'all' ? (stats?.total ?? bookings.length) : (stats?.[f] ?? 0)}
                </span>
              </button>
            ))}
          </div>

          <div className="admin-toolbar-right">
            <div className="admin-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                id="admin-search"
                type="search"
                placeholder="Search name, phone, area, package..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              id="admin-service-filter"
              className="admin-select"
              value={serviceFilter}
              onChange={e => setServiceFilter(e.target.value)}
              aria-label="Filter by service"
            >
              <option value="all">All services</option>
              {services.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              id="admin-sort"
              className="admin-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
              aria-label="Sort bookings"
            >
              {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>

            <button
              className="admin-export-btn"
              onClick={exportCSV}
              disabled={visibleBookings.length === 0}
              id="admin-export"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* Bookings */}
        {loading ? (
          <div className="admin-skeletons">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="admin-skeleton-row" style={{ animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
        ) : visibleBookings.length === 0 ? (
          <div className="admin-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/>
            </svg>
            <h3>No bookings found</h3>
            <p>
              {bookings.length === 0
                ? 'Bookings will appear here as soon as customers book.'
                : 'No bookings match your current filters.'}
            </p>
            {bookings.length > 0 && (
              <button className="admin-reset-btn" onClick={resetFilters} id="admin-reset-filters">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="admin-table-wrap">
              <table className="admin-table" id="bookings-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Package</th>
                    <th>Location</th>
                    <th>Date &amp; Time</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleBookings.map(b => (
                    <tr
                      key={b.id}
                      className={`status-row-${b.status}${selectedId === b.id ? ' is-selected' : ''}`}
                      onClick={() => setSelectedId(b.id)}
                    >
                      <td>
                        <div className="cell-customer">
                          <strong>{b.name || '—'}</strong>
                          <span>{b.phone || '—'}</span>
                          {b.email && <span className="cell-email">{b.email}</span>}
                        </div>
                      </td>
                      <td><span className="cell-service">{b.serviceName || b.service || '—'}</span></td>
                      <td>{b.package || '—'}</td>
                      <td>
                        <div className="cell-area">
                          <span>{b.area || '—'}</span>
                          {b.address && <small>{b.address}</small>}
                        </div>
                      </td>
                      <td>
                        <div className="cell-datetime">
                          <span>{formatServiceDate(b.date)}</span>
                          <span>{b.time || '—'}</span>
                        </div>
                      </td>
                      <td><strong className="cell-amount">AED {b.total || 0}</strong></td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            background: STATUSES[b.status]?.bg || '#F3F4F6',
                            color: STATUSES[b.status]?.color || '#374151',
                          }}
                        >
                          {STATUSES[b.status]?.label || b.status}
                        </span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className="cell-actions">
                          {updatingId === b.id ? (
                            <span className="admin-btn-spinner dark" />
                          ) : (
                            <StatusDropdown
                              value={b.status}
                              onChange={status => handleStatusUpdate(b.id, status)}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="admin-cards">
              {visibleBookings.map(b => (
                <button
                  key={b.id}
                  className="admin-card"
                  onClick={() => setSelectedId(b.id)}
                  id={`booking-card-${b.id}`}
                >
                  <div className="admin-card__top">
                    <div>
                      <strong>{b.name || '—'}</strong>
                      <span className="admin-card__phone">{b.phone || '—'}</span>
                    </div>
                    <span
                      className="status-badge"
                      style={{
                        background: STATUSES[b.status]?.bg || '#F3F4F6',
                        color: STATUSES[b.status]?.color || '#374151',
                      }}
                    >
                      {STATUSES[b.status]?.label || b.status}
                    </span>
                  </div>

                  <div className="admin-card__meta">
                    <span className="cell-service">{b.serviceName || b.service || '—'}</span>
                    {b.package && <span className="admin-card__pkg">{b.package}</span>}
                  </div>

                  <div className="admin-card__rows">
                    <div><span>Location</span><strong>{b.area || '—'}</strong></div>
                    <div><span>Date</span><strong>{formatServiceDate(b.date)} · {b.time || '—'}</strong></div>
                    <div><span>Amount</span><strong className="cell-amount">AED {b.total || 0}</strong></div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {!loading && visibleBookings.length > 0 && (
          <div className="admin-footer-info">
            Showing <strong>{visibleBookings.length}</strong> of <strong>{bookings.length}</strong> bookings
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="admin-drawer-backdrop" onClick={() => setSelectedId(null)}>
          <aside
            className="admin-drawer"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-label="Booking details"
          >
            <div className="admin-drawer__header">
              <div>
                <span className="admin-drawer__eyebrow">Booking details</span>
                <h2>{selected.name || 'Unnamed customer'}</h2>
                <span className="admin-drawer__created">Received {formatCreated(selected.createdAt)}</span>
              </div>
              <button
                className="admin-drawer__close"
                onClick={() => setSelectedId(null)}
                aria-label="Close details"
                id="admin-drawer-close"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="admin-drawer__body">
              {/* Quick contact */}
              <div className="admin-drawer__actions">
                <a className="drawer-action call" href={`tel:+${intlPhone(selected.phone)}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.4 2 2 0 0 1 3.62 1.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  Call
                </a>
                <a
                  className="drawer-action whatsapp"
                  href={`https://wa.me/${intlPhone(selected.phone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/>
                  </svg>
                  WhatsApp
                </a>
                {selected.email && (
                  <a className="drawer-action email" href={`mailto:${selected.email}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Email
                  </a>
                )}
                {selected.latitude != null && selected.longitude != null && (
                  <a
                    className="drawer-action directions"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    Get Directions
                  </a>
                )}
              </div>

              {/* Status switcher */}
              <div className="admin-drawer__section">
                <h3>Status</h3>
                <div className="drawer-status-group">
                  {STATUS_ORDER.map(s => (
                    <button
                      key={s}
                      id={`drawer-status-${s}`}
                      className={`drawer-status-btn${selected.status === s ? ' active' : ''}`}
                      style={selected.status === s
                        ? { background: STATUSES[s].bg, color: STATUSES[s].color, borderColor: STATUSES[s].dot }
                        : undefined}
                      onClick={() => handleStatusUpdate(selected.id, s)}
                      disabled={updatingId === selected.id || selected.status === s}
                    >
                      <span className="filter-dot" style={{ background: STATUSES[s].dot }} />
                      {STATUSES[s].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="admin-drawer__section">
                <h3>Service</h3>
                <dl className="drawer-list">
                  <div><dt>Service</dt><dd>{selected.serviceName || selected.service || '—'}</dd></div>
                  <div><dt>Package</dt><dd>{selected.package || '—'}</dd></div>
                  <div><dt>Date</dt><dd>{formatServiceDate(selected.date)}</dd></div>
                  <div><dt>Time</dt><dd>{selected.time || '—'}</dd></div>
                  <div className="drawer-total"><dt>Total</dt><dd>AED {selected.total || 0}</dd></div>
                </dl>
              </div>

              <div className="admin-drawer__section">
                <h3>Customer</h3>
                <dl className="drawer-list">
                  <div><dt>Name</dt><dd>{selected.name || '—'}</dd></div>
                  <div><dt>Phone</dt><dd>{selected.phone || '—'}</dd></div>
                  <div><dt>Email</dt><dd>{selected.email || '—'}</dd></div>
                  <div><dt>Area</dt><dd>{selected.area || '—'}</dd></div>
                  <div><dt>Address</dt><dd>{selected.address || '—'}</dd></div>
                </dl>
              </div>

              {selected.notes && (
                <div className="admin-drawer__section">
                  <h3>Customer notes</h3>
                  <p className="drawer-notes">{selected.notes}</p>
                </div>
              )}

              <p className="drawer-id">Booking ID · {selected.id}</p>
            </div>
          </aside>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`admin-toast ${toast.type}`} role="status">
          {toast.type === 'success' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}
