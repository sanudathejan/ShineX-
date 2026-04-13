import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './Book.css';

const DUBAI_AREAS = [
  'Dubai Marina', 'Downtown Dubai', 'Palm Jumeirah', 'Jumeirah Village Circle',
  'Business Bay', 'Deira', 'Al Barsha', 'Al Quoz', 'Dubai Hills', 'Mirdif',
  'Bur Dubai', 'Karama', 'Satwa', 'Meadows', 'Springs', 'Arabian Ranches',
  'Dubai Silicon Oasis', 'Al Nahda', 'Al Rashidiya', 'International City',
  'Jumeirah Lake Towers', 'The Greens', 'Al Quoz Industrial', 'Sheikh Zayed Road',
  'Motor City', 'Sports City', 'Discovery Gardens', 'Jumeirah Beach Residence'
];

const SERVICES = [
  {
    id: 'home-cleaning',
    name: 'Home Cleaning',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    desc: 'Full apartment or villa cleaning service',
    packages: [
      { id: 'studio', name: 'Studio', price: 199 },
      { id: '1bed', name: '1 Bedroom', price: 249 },
      { id: '2bed', name: '2 Bedrooms', price: 329 },
      { id: '3bed', name: '3 Bedrooms', price: 419 },
      { id: '4bed', name: '4 Bedrooms', price: 549 },
    ]
  },
  {
    id: 'furniture-cleaning',
    name: 'Furniture Cleaning',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/>
        <path d="M2 11a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8z"/>
        <line x1="6" y1="19" x2="6" y2="21"/>
        <line x1="18" y1="19" x2="18" y2="21"/>
      </svg>
    ),
    desc: 'Deep sofa, mattress & furniture cleaning',
    packages: [
      { id: '2seater', name: '2-Seater Sofa', price: 149 },
      { id: '3seater', name: '3-Seater Sofa', price: 189 },
      { id: 'lshape', name: 'L-Shape Sofa', price: 249 },
      { id: 'single_mattress', name: 'Single Mattress', price: 99 },
      { id: 'double_mattress', name: 'Double Mattress', price: 149 },
      { id: 'king_mattress', name: 'King Mattress', price: 189 },
    ]
  }
];

const TIME_SLOTS = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

function getMinDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export default function Book() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    service: searchParams.get('service') || '',
    package: searchParams.get('package') || '',
    area: '',
    address: '',
    date: '',
    time: '',
    name: '',
    phone: '',
    email: '',
    notes: '',
    extras: [],
  });

  const [errors, setErrors] = useState({});

  const selectedService = SERVICES.find(s => s.id === form.service);
  const selectedPackage = selectedService?.packages.find(p => p.name === form.package || p.id === form.package);
  const totalPrice = selectedPackage ? selectedPackage.price : null;

  const setField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep = () => {
    const errs = {};
    if (step === 1) {
      if (!form.service) errs.service = 'Please select a service';
      if (!form.package) errs.package = 'Please select a package';
    }
    if (step === 2) {
      if (!form.area) errs.area = 'Please select your area';
      if (!form.address) errs.address = 'Please enter your address';
      if (!form.date) errs.date = 'Please select a date';
      if (!form.time) errs.time = 'Please select a time slot';
    }
    if (step === 3) {
      if (!form.name) errs.name = 'Please enter your name';
      if (!form.phone || form.phone.length < 9) errs.phone = 'Please enter a valid phone number';
      if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Please enter a valid email';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep()) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="book-page">
        <div className="container book-success-container">
          <div className="book-success">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h1>Booking Confirmed! 🎉</h1>
            <p>Thank you, <strong>{form.name}</strong>! Your booking has been received successfully.</p>

            <div className="success-summary">
              <div className="summary-row">
                <span>Service</span>
                <strong>{selectedService?.name}</strong>
              </div>
              <div className="summary-row">
                <span>Package</span>
                <strong>{form.package}</strong>
              </div>
              <div className="summary-row">
                <span>Location</span>
                <strong>{form.area}</strong>
              </div>
              <div className="summary-row">
                <span>Date &amp; Time</span>
                <strong>{form.date} at {form.time}</strong>
              </div>
              {totalPrice && (
                <div className="summary-row total">
                  <span>Total Amount</span>
                  <strong>AED {totalPrice}</strong>
                </div>
              )}
            </div>

            <p className="success-note">
              Our team will contact you at <strong>{form.phone}</strong> to confirm your booking within 30 minutes.
            </p>
            <Link to="/" className="btn btn-primary" id="success-go-home">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="book-page">
      {/* Header */}
      <section className="book-header">
        <div className="container">
          <p className="section-eyebrow" style={{ color: '#7DD3FC' }}>Easy Booking</p>
          <h1>Book Your Cleaning Service</h1>
          <p>Simple, fast, and confirmed in seconds</p>
        </div>
      </section>

      <div className="container book-container">
        {/* Steps indicator */}
        <div className="book-steps">
          {['Select Service', 'Schedule', 'Your Details'].map((label, i) => (
            <div key={i} className={`book-step-item ${step === i + 1 ? 'active' : step > i + 1 ? 'completed' : ''}`}>
              <div className="step-circle">
                {step > i + 1 ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (i + 1)}
              </div>
              <span>{label}</span>
              {i < 2 && <div className="step-line" />}
            </div>
          ))}
        </div>

        <div className="book-layout">
          <form className="book-form" onSubmit={handleSubmit} id="booking-form">
            {/* STEP 1: Service Selection */}
            {step === 1 && (
              <div className="book-step">
                <h2>Choose Your Service</h2>

                <div className="service-selector">
                  {SERVICES.map(s => (
                    <button
                      type="button"
                      key={s.id}
                      id={`select-service-${s.id}`}
                      className={`service-option${form.service === s.id ? ' selected' : ''}`}
                      onClick={() => { setField('service', s.id); setField('package', ''); }}
                    >
                      <div className="service-option__icon">{s.icon}</div>
                      <div>
                        <strong>{s.name}</strong>
                        <span>{s.desc}</span>
                      </div>
                      <div className="service-option__check">
                        {form.service === s.id && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {errors.service && <p className="form-error">{errors.service}</p>}

                {form.service && (
                  <div className="package-selector">
                    <h3>Select Package</h3>
                    <div className="package-options">
                      {selectedService?.packages.map(pkg => (
                        <button
                          type="button"
                          key={pkg.id}
                          id={`select-pkg-${pkg.id}`}
                          className={`package-option${form.package === pkg.name ? ' selected' : ''}`}
                          onClick={() => setField('package', pkg.name)}
                        >
                          <span className="pkg-opt-name">{pkg.name}</span>
                          <span className="pkg-opt-price">AED {pkg.price}</span>
                        </button>
                      ))}
                    </div>
                    {errors.package && <p className="form-error">{errors.package}</p>}
                  </div>
                )}

                <div className="book-actions">
                  <button type="button" className="btn btn-primary" onClick={handleNext} id="step1-next">
                    Continue <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Schedule */}
            {step === 2 && (
              <div className="book-step">
                <h2>Schedule & Location</h2>

                <div className="form-group">
                  <label htmlFor="area-select">Area in Dubai *</label>
                  <select
                    id="area-select"
                    value={form.area}
                    onChange={e => setField('area', e.target.value)}
                    className={errors.area ? 'error' : ''}
                  >
                    <option value="">Select your area...</option>
                    {DUBAI_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  {errors.area && <p className="form-error">{errors.area}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="address-input">Full Address *</label>
                  <input
                    id="address-input"
                    type="text"
                    placeholder="Building name, villa number, floor..."
                    value={form.address}
                    onChange={e => setField('address', e.target.value)}
                    className={errors.address ? 'error' : ''}
                  />
                  {errors.address && <p className="form-error">{errors.address}</p>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date-input">Preferred Date *</label>
                    <input
                      id="date-input"
                      type="date"
                      min={getMinDate()}
                      value={form.date}
                      onChange={e => setField('date', e.target.value)}
                      className={errors.date ? 'error' : ''}
                    />
                    {errors.date && <p className="form-error">{errors.date}</p>}
                  </div>

                  <div className="form-group">
                    <label>Preferred Time *</label>
                    <div className="time-slots">
                      {TIME_SLOTS.map(slot => (
                        <button
                          type="button"
                          key={slot}
                          id={`time-${slot.replace(/[: ]/g, '-')}`}
                          className={`time-slot${form.time === slot ? ' selected' : ''}`}
                          onClick={() => setField('time', slot)}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                    {errors.time && <p className="form-error">{errors.time}</p>}
                  </div>
                </div>

                <div className="book-actions">
                  <button type="button" className="btn btn-outline" onClick={handleBack} id="step2-back">Back</button>
                  <button type="button" className="btn btn-primary" onClick={handleNext} id="step2-next">
                    Continue <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Personal Details */}
            {step === 3 && (
              <div className="book-step">
                <h2>Your Contact Details</h2>

                <div className="form-group">
                  <label htmlFor="name-input">Full Name *</label>
                  <input
                    id="name-input"
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={e => setField('name', e.target.value)}
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <p className="form-error">{errors.name}</p>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone-input">Phone Number *</label>
                    <div className="phone-input-wrap">
                      <span className="phone-prefix">+971</span>
                      <input
                        id="phone-input"
                        type="tel"
                        placeholder="50 123 4567"
                        value={form.phone}
                        onChange={e => setField('phone', e.target.value)}
                        className={errors.phone ? 'error' : ''}
                      />
                    </div>
                    {errors.phone && <p className="form-error">{errors.phone}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email-input">Email Address (optional)</label>
                    <input
                      id="email-input"
                      type="email"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={e => setField('email', e.target.value)}
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <p className="form-error">{errors.email}</p>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="notes-input">Special Notes (optional)</label>
                  <textarea
                    id="notes-input"
                    placeholder="Any specific requirements, access instructions, or special requests..."
                    rows={4}
                    value={form.notes}
                    onChange={e => setField('notes', e.target.value)}
                  />
                </div>

                <div className="book-actions">
                  <button type="button" className="btn btn-outline" onClick={handleBack} id="step3-back">Back</button>
                  <button type="submit" className="btn btn-accent" id="submit-booking">
                    Confirm Booking
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Summary Sidebar */}
          <div className="book-sidebar">
            <div className="booking-summary">
              <h3>Booking Summary</h3>
              {form.service ? (
                <>
                  <div className="summary-item">
                    <span>Service</span>
                    <strong>{selectedService?.name}</strong>
                  </div>
                  {form.package && (
                    <div className="summary-item">
                      <span>Package</span>
                      <strong>{form.package}</strong>
                    </div>
                  )}
                  {form.area && (
                    <div className="summary-item">
                      <span>Area</span>
                      <strong>{form.area}</strong>
                    </div>
                  )}
                  {form.date && (
                    <div className="summary-item">
                      <span>Date</span>
                      <strong>{form.date}</strong>
                    </div>
                  )}
                  {form.time && (
                    <div className="summary-item">
                      <span>Time</span>
                      <strong>{form.time}</strong>
                    </div>
                  )}
                  {totalPrice && (
                    <div className="summary-total">
                      <span>Total</span>
                      <strong>AED {totalPrice}</strong>
                    </div>
                  )}
                </>
              ) : (
                <p className="summary-empty">Select a service to see your booking summary.</p>
              )}
            </div>

            <div className="book-guarantee">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <div>
                <strong>100% Satisfaction Guarantee</strong>
                <p>Not happy? We'll re-clean for free.</p>
              </div>
            </div>

            <div className="book-contact-help">
              <p>Need help?</p>
              <a href="tel:+97145000000">+971 4 500 0000</a>
              <a href="https://wa.me/97145000000" target="_blank" rel="noopener noreferrer">
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
