// Branded HTML for customer-facing emails (booking receipt + status updates).
// Deliberately table-based with inline styles throughout — <style> blocks
// and flexbox/grid are unreliable across email clients (Outlook desktop in
// particular), so this sticks to the lowest-common-denominator markup that
// renders consistently everywhere.

const BRAND = {
  primary: '#43A047',
  primaryDark: '#2E7D32',
  primaryLight: '#E8F5E9',
  gray900: '#0F172A',
  gray700: '#334155',
  gray500: '#64748B',
  gray200: '#E2E8F0',
  gray50: '#F8FAFC',
  white: '#FFFFFF',
};

const LOGO_URL = 'https://shinex.best/logo.jpeg';

const STATUS_COPY = {
  pending: {
    label: 'Processing',
    badgeBg: '#FEF3C7',
    badgeColor: '#92400E',
    heading: 'Your booking is being processed',
    message: 'We’ve received your request and our team is reviewing it now. You’ll get another email as soon as it’s confirmed.',
  },
  confirmed: {
    label: 'Confirmed',
    badgeBg: '#DBEAFE',
    badgeColor: '#1E40AF',
    heading: 'Your booking is confirmed! 🎉',
    message: 'Great news — your cleaning is booked in. Our professional team will arrive at the scheduled time.',
  },
  completed: {
    label: 'Completed',
    badgeBg: '#D1FAE5',
    badgeColor: '#065F46',
    heading: 'All done — thank you! ✨',
    message: 'Your service has been completed. We hope your space is sparkling! If anything isn’t right, just reply to this email.',
  },
  cancelled: {
    label: 'Cancelled',
    badgeBg: '#FEE2E2',
    badgeColor: '#991B1B',
    heading: 'Your booking was cancelled',
    message: 'This booking has been cancelled. If you weren’t expecting this or have questions, please get in touch.',
  },
};

// Bookings store the local part only (the form shows a +971 prefix
// separately), so normalise whatever the customer typed into a full
// international number for tel:/wa.me links.
function intlPhone(phone) {
  let d = String(phone || '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('971')) return d;
  return '971' + d.replace(/^0+/, '');
}

// No API key needed — this is a plain link into Google's own Maps site,
// not a call to the Maps JavaScript/Directions API.
function directionsUrl(booking) {
  if (booking.latitude == null || booking.longitude == null) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${booking.latitude},${booking.longitude}`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function formatServiceDate(value) {
  if (!value) return 'N/A';
  const d = new Date(value);
  if (isNaN(d)) return escapeHtml(value);
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

function detailRow(label, value) {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid ${BRAND.gray200};font-size:13px;color:${BRAND.gray500};">${label}</td>
    <td style="padding:10px 0;border-bottom:1px solid ${BRAND.gray200};font-size:14px;color:${BRAND.gray900};font-weight:600;text-align:right;">${escapeHtml(value)}</td>
  </tr>`;
}

function detailsTable(booking) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
    ${detailRow('Service', booking.serviceName || booking.service || 'N/A')}
    ${detailRow('Package', booking.package || 'N/A')}
    ${detailRow('Location', booking.area || 'N/A')}
    ${detailRow('Address', booking.address || 'N/A')}
    ${detailRow('Date', formatServiceDate(booking.date))}
    ${detailRow('Time', booking.time || 'N/A')}
  </table>`;
}

function priceBox(total) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.primaryLight};border-radius:12px;margin:20px 0;">
    <tr>
      <td style="padding:18px 20px;font-size:14px;color:${BRAND.primaryDark};font-weight:600;">Total Amount</td>
      <td style="padding:18px 20px;font-size:22px;color:${BRAND.primaryDark};font-weight:800;text-align:right;">AED ${Number(total) || 0}</td>
    </tr>
  </table>`;
}

function statusBadge(status) {
  const s = STATUS_COPY[status] || STATUS_COPY.pending;
  return `<span style="display:inline-block;padding:6px 16px;border-radius:999px;background-color:${s.badgeBg};color:${s.badgeColor};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">${s.label}</span>`;
}

function actionButtonsRow(buttons) {
  const cells = buttons.map(({ href, label, bg, color }) => `
    <td style="padding-right:8px;">
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="border-radius:10px;background-color:${bg};">
            <a href="${href}" target="_blank" style="display:inline-block;padding:12px 20px;font-size:13px;font-weight:700;color:${color};text-decoration:none;border-radius:10px;white-space:nowrap;">${label}</a>
          </td>
        </tr>
      </table>
    </td>`).join('');
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;"><tr>${cells}</tr></table>`;
}

function emailShell({ preheader, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ShineX</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.gray50};font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.gray50};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:${BRAND.white};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND.primary},${BRAND.primaryDark});padding:32px 32px 28px;text-align:center;">
              <img src="${LOGO_URL}" alt="ShineX" width="56" height="56" style="border-radius:50%;display:block;margin:0 auto 12px;border:3px solid rgba(255,255,255,0.4);">
              <div style="color:#ffffff;font-size:24px;font-weight:800;letter-spacing:0.5px;">Shine<span style="color:#C8E6C9;">X</span></div>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="background-color:${BRAND.gray50};padding:24px 32px;text-align:center;border-top:1px solid ${BRAND.gray200};">
              <p style="margin:0 0 8px;font-size:13px;color:${BRAND.gray500};">Need help? We're here 7 days a week.</p>
              <p style="margin:0 0 4px;font-size:13px;">
                <a href="tel:+971556645537" style="color:${BRAND.primaryDark};text-decoration:none;font-weight:600;">+971 55 664 5537</a>
                &nbsp;&middot;&nbsp;
                <a href="https://wa.me/971556645537" style="color:${BRAND.primaryDark};text-decoration:none;font-weight:600;">WhatsApp</a>
              </p>
              <p style="margin:12px 0 0;font-size:12px;color:#94A3B8;">&copy; ${new Date().getFullYear()} ShineX &middot; Dubai, UAE</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderBookingNotificationEmail(booking) {
  const name = escapeHtml(booking.name || 'N/A');
  const phone = booking.phone || '';
  const mapsUrl = directionsUrl(booking);

  const buttons = [];
  if (phone) {
    buttons.push({ href: `tel:+${intlPhone(phone)}`, label: '📞 Call Customer', bg: BRAND.primaryLight, color: BRAND.primaryDark });
    buttons.push({ href: `https://wa.me/${intlPhone(phone)}`, label: 'WhatsApp', bg: '#DCFCE7', color: '#15803D' });
  }
  if (mapsUrl) {
    buttons.push({ href: mapsUrl, label: '📍 Get Directions', bg: BRAND.primary, color: BRAND.white });
  }

  const body = `
    <p style="margin:0 0 4px;font-size:13px;color:${BRAND.primary};font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">New Booking</p>
    <h1 style="margin:0 0 4px;font-size:24px;color:${BRAND.gray900};font-weight:800;">${escapeHtml(booking.serviceName || booking.service || 'Service')}</h1>
    <p style="margin:0 0 16px;font-size:14px;color:${BRAND.gray500};">${name}${phone ? ` &middot; ${escapeHtml(phone)}` : ''}${booking.email ? ` &middot; ${escapeHtml(booking.email)}` : ''}</p>
    ${buttons.length ? actionButtonsRow(buttons) : ''}
    ${detailsTable(booking)}
    ${priceBox(booking.total)}
    ${booking.notes ? `<p style="margin:0;font-size:13px;color:${BRAND.gray500};"><strong>Customer notes:</strong> ${escapeHtml(booking.notes)}</p>` : ''}
  `;
  return emailShell({
    preheader: `New booking: ${booking.serviceName || booking.service} — ${booking.name}`,
    bodyHtml: body,
  });
}

export function plainBookingNotificationText(booking) {
  const mapsUrl = directionsUrl(booking);
  return [
    `New booking from ${booking.name} (${booking.phone})`,
    booking.email ? `Email: ${booking.email}` : null,
    '',
    `Service : ${booking.serviceName || booking.service || 'N/A'}`,
    `Package : ${booking.package || 'N/A'}`,
    `Area    : ${booking.area || 'N/A'}`,
    `Address : ${booking.address || 'N/A'}`,
    `Date    : ${formatServiceDate(booking.date).replace(/&amp;/g, '&')}`,
    `Time    : ${booking.time || 'N/A'}`,
    `Total   : AED ${Number(booking.total) || 0}`,
    `Notes   : ${booking.notes || 'None'}`,
    mapsUrl ? `\nGet directions: ${mapsUrl}` : null,
  ].filter(Boolean).join('\n');
}

export function renderBookingReceiptEmail(booking) {
  const name = escapeHtml(booking.name || 'there');
  const phone = escapeHtml(booking.phone || 'the number you provided');
  const body = `
    <p style="margin:0 0 4px;font-size:13px;color:${BRAND.primary};font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Booking Receipt</p>
    <h1 style="margin:0 0 16px;font-size:24px;color:${BRAND.gray900};font-weight:800;">Thanks, ${name}! We've got your request.</h1>
    <div style="margin-bottom:20px;">${statusBadge('pending')}</div>
    <p style="margin:0 0 8px;font-size:14px;color:${BRAND.gray700};line-height:1.7;">
      Here's a copy of your booking for your records. Our team will contact you at
      <strong>${phone}</strong> within 30 minutes to confirm.
    </p>
    ${detailsTable(booking)}
    ${priceBox(booking.total)}
    ${booking.notes ? `<p style="margin:0;font-size:13px;color:${BRAND.gray500};"><strong>Your notes:</strong> ${escapeHtml(booking.notes)}</p>` : ''}
  `;
  return emailShell({
    preheader: `Your ${booking.serviceName || booking.service || 'booking'} request is being processed`,
    bodyHtml: body,
  });
}

export function renderStatusUpdateEmail(booking) {
  const s = STATUS_COPY[booking.status] || STATUS_COPY.pending;
  const name = escapeHtml(booking.name || 'there');
  const body = `
    <p style="margin:0 0 4px;font-size:13px;color:${BRAND.primary};font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Booking Update</p>
    <h1 style="margin:0 0 16px;font-size:24px;color:${BRAND.gray900};font-weight:800;">${s.heading}</h1>
    <div style="margin-bottom:20px;">${statusBadge(booking.status)}</div>
    <p style="margin:0 0 8px;font-size:14px;color:${BRAND.gray700};line-height:1.7;">Hi ${name}, ${s.message}</p>
    ${detailsTable(booking)}
    ${priceBox(booking.total)}
  `;
  return emailShell({ preheader: s.heading, bodyHtml: body });
}

export function plainReceiptText(booking) {
  return [
    `Hi ${booking.name || 'there'},`,
    '',
    'Thanks for booking with ShineX! Here’s a copy of your request:',
    '',
    `Service : ${booking.serviceName || booking.service || 'N/A'}`,
    `Package : ${booking.package || 'N/A'}`,
    `Location: ${booking.area || 'N/A'}`,
    `Address : ${booking.address || 'N/A'}`,
    `Date    : ${formatServiceDate(booking.date).replace(/&amp;/g, '&')}`,
    `Time    : ${booking.time || 'N/A'}`,
    `Total   : AED ${Number(booking.total) || 0}`,
    '',
    `Status: Processing — our team will contact you at ${booking.phone || 'the number provided'} within 30 minutes to confirm.`,
    '',
    'Need help? Call +971 55 664 5537 or WhatsApp us: https://wa.me/971556645537',
  ].join('\n');
}

export function plainStatusText(booking) {
  const s = STATUS_COPY[booking.status] || STATUS_COPY.pending;
  return [
    `Hi ${booking.name || 'there'},`,
    '',
    s.heading,
    s.message,
    '',
    `Service : ${booking.serviceName || booking.service || 'N/A'}`,
    `Package : ${booking.package || 'N/A'}`,
    `Location: ${booking.area || 'N/A'}`,
    `Date    : ${formatServiceDate(booking.date).replace(/&amp;/g, '&')}`,
    `Time    : ${booking.time || 'N/A'}`,
    `Total   : AED ${Number(booking.total) || 0}`,
    '',
    'Need help? Call +971 55 664 5537 or WhatsApp us: https://wa.me/971556645537',
  ].join('\n');
}

export const STATUS_SUBJECT = {
  pending: 'Your ShineX booking is being reviewed',
  confirmed: 'Your ShineX booking is confirmed! 🎉',
  completed: 'Your ShineX service is complete ✨',
  cancelled: 'Your ShineX booking has been cancelled',
};
