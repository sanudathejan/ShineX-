import { useState } from 'react';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const setField = (f, v) => { setForm(prev => ({ ...prev, [f]: v })); setErrors(prev => ({ ...prev, [f]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.name) e.name = 'Name is required';
    if (!form.phone) e.phone = 'Phone is required';
    if (!form.message) e.message = 'Message is required';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) setSubmitted(true);
  };

  return (
    <div className="contact-page">
      {/* Hero */}
      <section className="contact-hero">
        <div className="container">
          <p className="section-eyebrow" style={{ color: '#7DD3FC' }}>Get In Touch</p>
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Reach out any time!</p>
        </div>
      </section>

      <div className="section container">
        <div className="contact-grid">
          {/* Info */}
          <div className="contact-info">
            <h2>Talk to Our Team</h2>
            <p>Whether you have questions about our services, want a custom quote, or need to modify a booking — we're here to help 7 days a week.</p>

            <div className="contact-cards">
              <div className="contact-card" id="contact-phone-card">
                <div className="contact-card__icon phone">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.4 2 2 0 0 1 3.62 1.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div>
                  <h4>Phone</h4>
                  <a href="tel:+97145000000">+971 4 500 0000</a>
                  <p>Sun – Thu: 8AM to 8PM</p>
                </div>
              </div>

              <div className="contact-card" id="contact-wa-card">
                <div className="contact-card__icon whatsapp">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                </div>
                <div>
                  <h4>WhatsApp</h4>
                  <a href="https://wa.me/97145000000" target="_blank" rel="noopener noreferrer">
                    Chat with us
                  </a>
                  <p>Quick response guaranteed</p>
                </div>
              </div>

              <div className="contact-card" id="contact-email-card">
                <div className="contact-card__icon email">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div>
                  <h4>Email</h4>
                  <a href="mailto:hello@shinex.ae">hello@shinex.ae</a>
                  <p>We reply within 24 hours</p>
                </div>
              </div>

              <div className="contact-card" id="contact-location-card">
                <div className="contact-card__icon location">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <h4>Location</h4>
                  <span>Business Bay, Dubai, UAE</span>
                  <p>Serving all of Dubai</p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="contact-map">
              <iframe
                id="contact-map"
                title="ShineX Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.478313!2d55.2644787!3d25.1852261!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f69e8e4a2a4c9%3A0xa0dba36782a1dd4f!2sBusiness%20Bay%20-%20Dubai!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Form */}
          <div className="contact-form-wrap">
            <h2>Send Us a Message</h2>
            {submitted ? (
              <div className="contact-success">
                <div className="success-icon-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out, <strong>{form.name}</strong>. Our team will contact you within 24 hours.</p>
                <button className="btn btn-primary" onClick={() => { setSubmitted(false); setForm({ name:'',email:'',phone:'',subject:'',message:'' }); }}>
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} id="contact-form" noValidate>
                <div className="form-group">
                  <label htmlFor="contact-name">Full Name *</label>
                  <input id="contact-name" type="text" placeholder="Your name" value={form.name} onChange={e => setField('name', e.target.value)} className={errors.name ? 'error' : ''} />
                  {errors.name && <p className="form-error">{errors.name}</p>}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="contact-phone">Phone Number *</label>
                    <input id="contact-phone" type="tel" placeholder="+971 50 000 0000" value={form.phone} onChange={e => setField('phone', e.target.value)} className={errors.phone ? 'error' : ''} />
                    {errors.phone && <p className="form-error">{errors.phone}</p>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-email">Email (optional)</label>
                    <input id="contact-email" type="email" placeholder="your@email.com" value={form.email} onChange={e => setField('email', e.target.value)} className={errors.email ? 'error' : ''} />
                    {errors.email && <p className="form-error">{errors.email}</p>}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="contact-subject">Subject</label>
                  <select id="contact-subject" value={form.subject} onChange={e => setField('subject', e.target.value)}>
                    <option value="">Select a subject...</option>
                    <option value="booking">Booking Inquiry</option>
                    <option value="quote">Custom Quote</option>
                    <option value="complaint">Service Complaint</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="contact-message">Message *</label>
                  <textarea id="contact-message" rows={5} placeholder="Write your message here..." value={form.message} onChange={e => setField('message', e.target.value)} className={errors.message ? 'error' : ''} />
                  {errors.message && <p className="form-error">{errors.message}</p>}
                </div>
                <button type="submit" className="btn btn-primary contact-submit" id="contact-submit-btn">
                  Send Message
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
