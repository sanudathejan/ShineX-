import emailjs from '@emailjs/browser';

// ── Booking Orders → connect.shinex@gmail.com ──────────────────
const BOOKING_SERVICE_ID  = 'service_d7q7epg';
const BOOKING_TEMPLATE_ID = 'template_e1du9df';
const BOOKING_PUBLIC_KEY  = 'WHI-btgOVeTxGRQDW';

// ── Contact Messages → reviews.shinex@gmail.com ────────────────
const CONTACT_SERVICE_ID  = 'service_u2c4mhn';
const CONTACT_TEMPLATE_ID = 'template_zprhgji';
const CONTACT_PUBLIC_KEY  = '8WTvlCh_YY73ZJUJU';

/**
 * Booking form → sends to connect.shinex@gmail.com
 */
export async function sendBookingEmail(bookingData) {
  const templateParams = {
    to_name:    'Dhanushka',
    from_name:  bookingData.name  || 'N/A',
    from_email: bookingData.email || 'N/A',
    phone:      bookingData.phone || 'N/A',
    message: [
      `Service : ${bookingData.serviceName || bookingData.service || 'N/A'}`,
      `Package : ${bookingData.package  || 'N/A'}`,
      `Area    : ${bookingData.area     || 'N/A'}`,
      `Address : ${bookingData.address  || 'N/A'}`,
      `Date    : ${bookingData.date     || 'N/A'}`,
      `Time    : ${bookingData.time     || 'N/A'}`,
      `Total   : AED ${bookingData.total || 0}`,
      `Notes   : ${bookingData.notes    || 'None'}`,
    ].join('\n'),
  };

  const result = await emailjs.send(
    BOOKING_SERVICE_ID,
    BOOKING_TEMPLATE_ID,
    templateParams,
    BOOKING_PUBLIC_KEY,
  );
  console.log('✅ Booking email sent to connect.shinex@gmail.com:', result.text);
  return { success: true };
}

/**
 * Contact form → sends to reviews.shinex@gmail.com
 */
export async function sendContactEmail(contactData) {
  const templateParams = {
    to_name:    'Dhanushka',
    from_name:  contactData.name  || 'N/A',
    from_email: contactData.email || 'N/A',
    phone:      contactData.phone || 'N/A',
    message: [
      `Subject : ${contactData.subject || 'General Inquiry'}`,
      `Message : ${contactData.message || 'No message'}`,
    ].join('\n'),
  };

  const result = await emailjs.send(
    CONTACT_SERVICE_ID,
    CONTACT_TEMPLATE_ID,
    templateParams,
    CONTACT_PUBLIC_KEY,
  );
  console.log('✅ Contact email sent to reviews.shinex@gmail.com:', result.text);
  return { success: true };
}
