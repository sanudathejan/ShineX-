import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

const BOOKINGS_COLLECTION = 'bookings';

/**
 * Save a new booking to Firestore
 */
export async function createBooking(bookingData) {
  try {
    const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), {
      ...bookingData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all bookings (admin use only)
 */
export async function getAllBookings() {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    }));
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

/**
 * Get bookings filtered by status
 */
export async function getBookingsByStatus(status) {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    }));
  } catch (error) {
    console.error('Error fetching bookings by status:', error);
    return [];
  }
}

/**
 * Update booking status (admin use)
 */
export async function updateBookingStatus(bookingId, newStatus) {
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await updateDoc(bookingRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating booking:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get booking statistics
 */
export async function getBookingStats() {
  try {
    const allBookings = await getAllBookings();

    const stats = {
      total: allBookings.length,
      pending: allBookings.filter(b => b.status === 'pending').length,
      confirmed: allBookings.filter(b => b.status === 'confirmed').length,
      completed: allBookings.filter(b => b.status === 'completed').length,
      cancelled: allBookings.filter(b => b.status === 'cancelled').length,
      totalRevenue: allBookings
        .filter(b => b.status !== 'cancelled')
        .reduce((sum, b) => sum + (b.total || 0), 0),
      todayBookings: allBookings.filter(b => {
        const today = new Date();
        const bookingDate = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return bookingDate.toDateString() === today.toDateString();
      }).length,
    };

    return stats;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, totalRevenue: 0, todayBookings: 0 };
  }
}
