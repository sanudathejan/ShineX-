import { api } from '../config/api';

/**
 * Send a contact form message. The API emails it server-side — replaces the
 * old direct EmailJS call (see server/src/services/email.service.js).
 */
export async function sendContactMessage(contactData) {
  await api.post('/contact', contactData);
  return { success: true };
}
