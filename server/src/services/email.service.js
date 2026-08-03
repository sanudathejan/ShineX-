import { Resend } from 'resend';
import { env } from '../config/env.js';
import {
  renderBookingNotificationEmail,
  renderBookingReceiptEmail,
  renderStatusUpdateEmail,
  plainBookingNotificationText,
  plainReceiptText,
  plainStatusText,
  STATUS_SUBJECT,
} from './emailTemplates.js';

let client;

/**
 * Lazily created (and only required) the first time an email is actually
 * sent — this keeps the API key from blocking server startup the way
 * Firebase Admin credentials do, since the server can still create/list/
 * update bookings perfectly well without it.
 *
 * Uses Resend (HTTPS API) rather than raw SMTP: some networks — university
 * and corporate ones especially — block outbound SMTP ports (465/587)
 * entirely, which no amount of client-side config can work around. HTTPS
 * (443) is essentially never blocked the same way.
 */
function getClient() {
  if (client) return client;

  if (!env.resendApiKey) {
    throw new Error(
      'Missing Resend API key. Set RESEND_API_KEY in server/.env — ' +
      'see server/.env.example for how to get one.'
    );
  }

  client = new Resend(env.resendApiKey);
  return client;
}

async function send({ from, to, replyTo, subject, text, html }) {
  const { error } = await getClient().emails.send({ from, to, replyTo, subject, text, html });
  if (error) {
    throw new Error(`${error.name || 'Resend error'}: ${error.message}`);
  }
}

export async function sendBookingNotification(booking) {
  await send({
    from: `ShineX Bookings <${env.resendFromEmail}>`,
    to: env.bookingNotifyEmail,
    replyTo: booking.email || undefined,
    subject: `New Booking: ${booking.serviceName || booking.service} — ${booking.name}`,
    html: renderBookingNotificationEmail(booking),
    text: plainBookingNotificationText(booking),
  });
}

export async function sendContactNotification(contact) {
  await send({
    from: `ShineX Contact Form <${env.resendFromEmail}>`,
    to: env.contactNotifyEmail,
    replyTo: contact.email || undefined,
    subject: `New Contact Message: ${contact.subject || 'General Inquiry'} — ${contact.name}`,
    text: [
      `From: ${contact.name} (${contact.phone})`,
      contact.email ? `Email: ${contact.email}` : null,
      `Subject: ${contact.subject || 'General Inquiry'}`,
      '',
      contact.message || '',
    ].filter(Boolean).join('\n'),
  });
}

/**
 * Customer-facing receipt, sent right after a booking is created. Silently
 * skipped if the customer didn't provide an email — only phone is required
 * on the booking form.
 *
 * Note: without a verified domain in Resend, sandbox mode only allows
 * sending TO the account's own address — this will fail for real customer
 * addresses until shinex.best (or another domain) is verified there. See
 * server/README.md.
 */
export async function sendCustomerBookingReceipt(booking) {
  if (!booking.email) return;

  await send({
    from: `ShineX <${env.resendFromEmail}>`,
    to: booking.email,
    subject: STATUS_SUBJECT.pending,
    html: renderBookingReceiptEmail(booking),
    text: plainReceiptText(booking),
  });
}

/**
 * Customer-facing status update, sent whenever the admin dashboard changes
 * a booking's status. Same sandbox caveat as above.
 */
export async function sendCustomerStatusUpdate(booking) {
  if (!booking.email) return;

  await send({
    from: `ShineX <${env.resendFromEmail}>`,
    to: booking.email,
    subject: STATUS_SUBJECT[booking.status] || STATUS_SUBJECT.pending,
    html: renderStatusUpdateEmail(booking),
    text: plainStatusText(booking),
  });
}
