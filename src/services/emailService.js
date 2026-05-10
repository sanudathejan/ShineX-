import emailjs from '@emailjs/browser';

// EmailJS credentials
const SERVICE_ID = 'service_d7q7epg';
const TEMPLATE_ID = 'template_l0lf9xd';
const PUBLIC_KEY = 'WHI-btgOVeTxGRQDW';

/**
 * Send booking notification email via EmailJS
 * The template variables must match your EmailJS template fields
 */
export async function sendBookingEmail(bookingData) {
  try {
    const templateParams = {
      // Customer info
      customer_name: bookingData.name || 'N/A',
      customer_phone: bookingData.phone || 'N/A',
      customer_email: bookingData.email || 'N/A',

      // Booking info
      service_name: bookingData.serviceName || bookingData.service || 'N/A',
      package_name: bookingData.package || 'N/A',
      area: bookingData.area || 'N/A',
      address: bookingData.address || 'N/A',
      date: bookingData.date || 'N/A',
      time: bookingData.time || 'N/A',
      total: bookingData.total ? `AED ${bookingData.total}` : 'N/A',
      notes: bookingData.notes || 'None',

      // For the "to" field in EmailJS template
      to_name: 'Dhanushka',
    };

    const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    console.log('Email sent successfully:', result.text);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.text || error.message };
  }
}

/**
 * Send contact form message via EmailJS
 */
export async function sendContactEmail(contactData) {
  try {
    const templateParams = {
      customer_name: contactData.name || 'N/A',
      customer_phone: contactData.phone || 'N/A',
      customer_email: contactData.email || 'N/A',
      service_name: 'Contact Form Message',
      package_name: contactData.subject || 'General',
      area: 'N/A',
      address: 'N/A',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      total: 'N/A',
      notes: contactData.message || 'No message',
      to_name: 'Dhanushka',
    };

    const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    console.log('Contact email sent:', result.text);
    return { success: true };
  } catch (error) {
    console.error('Contact email failed:', error);
    return { success: false, error: error.text || error.message };
  }
}
