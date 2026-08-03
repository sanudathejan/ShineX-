import { api } from '../config/api';

/**
 * Save a new booking. The API saves it to Firestore and emails the
 * notification server-side — this used to be two separate client calls
 * (Firestore write + EmailJS send); now it's one request.
 */
export async function createBooking(bookingData) {
  try {
    const result = await api.post('/bookings', bookingData);
    return { success: true, id: result.id };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get bookings (admin use only). Accepts a Firebase ID token and optional
 * filters — omitting all filters returns everything, same as before.
 */
export async function getAllBookings(idToken, { status, service, search, sort } = {}) {
  try {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (service) params.set('service', service);
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);
    const qs = params.toString();

    const result = await api.get(`/bookings${qs ? `?${qs}` : ''}`, idToken);
    return result.bookings.map(b => ({
      ...b,
      createdAt: b.createdAt ? new Date(b.createdAt) : new Date(),
      updatedAt: b.updatedAt ? new Date(b.updatedAt) : new Date(),
    }));
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

/**
 * Update booking status (admin use only).
 */
export async function updateBookingStatus(bookingId, newStatus, idToken) {
  try {
    await api.patch(`/bookings/${bookingId}/status`, { status: newStatus }, idToken);
    return { success: true };
  } catch (error) {
    console.error('Error updating booking:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get booking statistics (admin use only).
 */
export async function getBookingStats(idToken) {
  try {
    const result = await api.get('/bookings/stats', idToken);
    return result.stats;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, totalRevenue: 0, todayBookings: 0 };
  }
}
