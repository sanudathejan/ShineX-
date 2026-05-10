import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getAllBookings, updateBookingStatus, getBookingStats } from '../services/bookingService';
import './Admin.css';

const STATUS_COLORS = {
  pending: { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
  confirmed: { bg: '#DBEAFE', color: '#1E40AF', label: 'Confirmed' },
  completed: { bg: '#D1FAE5', color: '#065F46', label: 'Completed' },
  cancelled: { bg: '#FEE2E2', color: '#991B1B', label: 'Cancelled' },
};

export default function Admin() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

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

  const fetchData = async () => {
    setLoading(true);
    const [allBookings, bookingStats] = await Promise.all([
      getAllBookings(),
      getBookingStats(),
    ]);
    setBookings(allBookings);
    setStats(bookingStats);
    setLoading(false);
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

  const handleLogout = () => signOut(auth);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    const result = await updateBookingStatus(bookingId, newStatus);
    if (result.success) {
      setBookings(prev =>
        prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
      );
      // Refresh stats
      const newStats = await getBookingStats();
      setStats(newStats);
    }
    setUpdatingId(null);
  };

  // Filter bookings
  const filteredBookings = bookings
    .filter(b => filter === 'all' || b.status === filter)
    .filter(b => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (b.name || '').toLowerCase().includes(q) ||
        (b.phone || '').toLowerCase().includes(q) ||
        (b.area || '').toLowerCase().includes(q) ||
        (b.serviceName || b.service || '').toLowerCase().includes(q)
      );
    });

  // Auth loading
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

  // Login Screen
  if (!user) {
    return (
      <div className="admin-page">
        <div className="admin-login">
          <div className="admin-login-card">
            <div className="admin-login-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h1>ShineX Admin</h1>
            <p>Sign in to manage your bookings</p>

            <form onSubmit={handleLogin} id="admin-login-form">
              <div className="admin-form-group">
                <label htmlFor="admin-email">Email</label>
                <input
                  id="admin-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label htmlFor="admin-password">Password</label>
                <input
                  id="admin-password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              {loginError && <p className="admin-error">{loginError}</p>}
              <button type="submit" className="admin-login-btn" disabled={loggingIn} id="admin-login-btn">
                {loggingIn ? (
                  <><span className="admin-btn-spinner" /> Signing in...</>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-header-left">
            <h1>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              Dashboard
            </h1>
            <span className="admin-user-badge">{user.email}</span>
          </div>
          <div className="admin-header-right">
            <button className="admin-refresh-btn" onClick={fetchData} title="Refresh data" id="admin-refresh">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </button>
            <button className="admin-logout-btn" onClick={handleLogout} id="admin-logout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="admin-body">
        {/* Stats Cards */}
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
                <span className="stat-card__label">Today</span>
                <strong className="stat-card__value">{stats.todayBookings}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="admin-toolbar">
          <div className="admin-filters">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
              <button
                key={f}
                id={`filter-${f}`}
                className={`admin-filter-btn${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : STATUS_COLORS[f]?.label || f}
                {f !== 'all' && stats && (
                  <span className="filter-count">{stats[f] || 0}</span>
                )}
              </button>
            ))}
          </div>
          <div className="admin-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              id="admin-search"
              type="text"
              placeholder="Search by name, phone, area..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner" />
            <p>Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="admin-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/>
            </svg>
            <h3>No bookings found</h3>
            <p>{filter !== 'all' ? `No ${filter} bookings.` : 'Bookings will appear here when customers book.'}</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table" id="bookings-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Package</th>
                  <th>Area</th>
                  <th>Date & Time</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b => (
                  <tr key={b.id} className={`status-row-${b.status}`}>
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
                        <span>{b.date || '—'}</span>
                        <span>{b.time || '—'}</span>
                      </div>
                    </td>
                    <td><strong className="cell-amount">AED {b.total || 0}</strong></td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          background: STATUS_COLORS[b.status]?.bg || '#F3F4F6',
                          color: STATUS_COLORS[b.status]?.color || '#374151',
                        }}
                      >
                        {STATUS_COLORS[b.status]?.label || b.status}
                      </span>
                    </td>
                    <td>
                      <div className="cell-actions">
                        {updatingId === b.id ? (
                          <span className="admin-btn-spinner" />
                        ) : (
                          <select
                            id={`status-${b.id}`}
                            value={b.status}
                            onChange={e => handleStatusUpdate(b.id, e.target.value)}
                            className="status-select"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Booking count */}
        {!loading && (
          <div className="admin-footer-info">
            Showing <strong>{filteredBookings.length}</strong> of <strong>{bookings.length}</strong> bookings
          </div>
        )}
      </div>
    </div>
  );
}
