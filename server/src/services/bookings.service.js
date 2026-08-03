import { db, FieldValue } from '../config/firebaseAdmin.js';

const COLLECTION = 'bookings';

export async function createBooking(data) {
  const docRef = await db.collection(COLLECTION).add({
    name: data.name,
    phone: data.phone,
    email: data.email || '',
    service: data.service,
    serviceName: data.serviceName || data.service,
    package: data.package,
    area: data.area,
    address: data.address,
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
    date: data.date,
    time: data.time,
    total: Number(data.total) || 0,
    notes: data.notes || '',
    status: 'pending',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return docRef.id;
}

function toBooking(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || null,
    updatedAt: data.updatedAt?.toDate?.() || null,
  };
}

/**
 * Filtering/sorting happens in memory after one ordered fetch, same as the
 * client used to do it — this dataset is small enough that it doesn't need
 * Firestore composite indexes for combined filters (status + service +
 * search all at once).
 */
export async function listBookings({ status, service, search, sort } = {}) {
  const snapshot = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
  let bookings = snapshot.docs.map(toBooking);

  if (status && status !== 'all') {
    bookings = bookings.filter(b => b.status === status);
  }
  if (service && service !== 'all') {
    bookings = bookings.filter(b => (b.serviceName || b.service) === service);
  }
  if (search) {
    const q = search.toLowerCase();
    bookings = bookings.filter(b =>
      [b.name, b.phone, b.email, b.area, b.address, b.package, b.serviceName || b.service]
        .some(field => (field || '').toString().toLowerCase().includes(q))
    );
  }

  const byCreated = (b) => (b.createdAt ? b.createdAt.getTime() : 0);
  if (sort) {
    bookings = [...bookings].sort((a, b) => {
      switch (sort) {
        case 'oldest': return byCreated(a) - byCreated(b);
        case 'date-asc': return String(a.date || '').localeCompare(String(b.date || ''));
        case 'amount-desc': return (b.total || 0) - (a.total || 0);
        case 'amount-asc': return (a.total || 0) - (b.total || 0);
        default: return byCreated(b) - byCreated(a);
      }
    });
  }

  return bookings;
}

export async function getStats() {
  const bookings = await listBookings();
  const isToday = (b) => b.createdAt && b.createdAt.toDateString() === new Date().toDateString();

  return {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    totalRevenue: bookings
      .filter(b => b.status !== 'cancelled')
      .reduce((sum, b) => sum + (b.total || 0), 0),
    todayBookings: bookings.filter(isToday).length,
  };
}

export async function updateStatus(id, status) {
  const ref = db.collection(COLLECTION).doc(id);
  await ref.update({ status, updatedAt: FieldValue.serverTimestamp() });
  // Returned so the caller can email the customer about the change without
  // a second round trip — they only sent { status } in the request body.
  return toBooking(await ref.get());
}
