import { auth } from '../config/firebaseAdmin.js';

/**
 * Protects admin-only routes. The frontend signs in with Firebase Auth
 * (unchanged) and sends the resulting ID token as `Authorization: Bearer <token>`;
 * this verifies it server-side via the Admin SDK before allowing access to
 * booking data.
 */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Missing Authorization bearer token' });
  }

  try {
    req.user = await auth.verifyIdToken(token);
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired session — please sign in again' });
  }
}
