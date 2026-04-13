import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const DUBAI_AREAS = [
  'Dubai Marina', 'Downtown Dubai', 'Palm Jumeirah', 'Jumeirah Village Circle',
  'Business Bay', 'Deira', 'Al Barsha', 'Al Quoz', 'Dubai Hills', 'Mirdif',
  'Bur Dubai', 'Karama', 'Satwa', 'Meadows', 'Springs', 'Arabian Ranches',
  'Dubai Silicon Oasis', 'Al Nahda', 'Al Rashidiya', 'International City'
];

const REVIEWS = [
  {
    name: 'Sarah Al-Hassan',
    area: 'Dubai Marina',
    rating: 5,
    text: 'ShineX transformed my apartment! The team was professional, on time, and left my home spotless. Booking was super easy.',
    avatar: 'SA'
  },
  {
    name: 'James Mitchell',
    area: 'Downtown Dubai',
    rating: 5,
    text: 'Had my entire sofa set deep cleaned. Looks brand new! The furniture cleaning service is absolutely top-notch.',
    avatar: 'JM'
  },
  {
    name: 'Fatima Al-Rashidi',
    area: 'Jumeirah',
    rating: 5,
    text: 'Been using ShineX for 6 months now. Consistent quality every single time. Highly recommend their home cleaning.',
    avatar: 'FA'
  },
  {
    name: 'Rahul Sharma',
    area: 'Business Bay',
    rating: 5,
    text: 'Amazing service at very fair prices. The cleaners are trained professionals who really care about the details.',
    avatar: 'RS'
  }
];

const STATS = [
  { number: '5,000+', label: 'Happy Clients' },
  { number: '4.9★', label: 'Average Rating' },
  { number: '200+', label: 'Certified Pros' },
  { number: '3+', label: 'Years in Dubai' },
];

export default function Home() {
  const [areaSearch, setAreaSearch] = useState('');
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentReview, setCurrentReview] = useState(0);

  useEffect(() => {
    if (areaSearch.length > 1) {
      setFilteredAreas(
        DUBAI_AREAS.filter(a => a.toLowerCase().includes(areaSearch.toLowerCase()))
      );
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [areaSearch]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview(prev => (prev + 1) % REVIEWS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleAreaSelect = (area) => {
    setSelectedArea(area);
    setAreaSearch(area);
    setShowDropdown(false);
  };

  return (
    <div className="home">
      {/* ── HERO ── */}
      <section className="hero" id="hero">
        <div className="hero-bg">
          <img src={`${import.meta.env.BASE_URL}hero_home_cleaning.png`} alt="Professional home cleaning" />
          <div className="hero-overlay" />
        </div>
        <div className="hero-content container">
          <div className="hero-badge animate-fadeInUp">
            <span>✦</span> Dubai's #1 Cleaning Service
          </div>
          <h1 className="hero-title animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            Your Home Deserves<br />
            <span className="hero-gradient">to Shine</span>
          </h1>
          <p className="hero-desc animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            Professional home & furniture cleaning across all of Dubai. Trusted by 5,000+ happy clients.
          </p>

          {/* Location Search */}
          <div className="hero-search animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <div className="search-label">Where would you like us to clean?</div>
            <div className="search-row">
              <div className="search-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <input
                  type="text"
                  id="hero-location-search"
                  placeholder="Search area, e.g. Dubai Marina..."
                  value={areaSearch}
                  onChange={e => setAreaSearch(e.target.value)}
                  onFocus={() => areaSearch.length > 1 && setShowDropdown(true)}
                />
                {showDropdown && filteredAreas.length > 0 && (
                  <div className="area-dropdown">
                    {filteredAreas.map(area => (
                      <button key={area} onClick={() => handleAreaSelect(area)} className="area-option">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        {area}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Link to="/book" className="btn btn-accent search-btn">
                Book Now
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </div>

          {/* Trust badges */}
          <div className="hero-trust animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <span>✓ Same-day booking</span>
            <span>✓ Trained professionals</span>
            <span>✓ 100% satisfaction</span>
          </div>
        </div>

        {/* Stats bar */}
        <div className="hero-stats">
          <div className="container">
            <div className="stats-row">
              {STATS.map(s => (
                <div key={s.label} className="stat-item">
                  <strong>{s.number}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="section services-section" id="services">
        <div className="container">
          <p className="section-eyebrow">What We Offer</p>
          <h2 className="section-title">Our Cleaning Services</h2>
          <p className="section-subtitle">Two specialized services tailored to keep your Dubai home and furnishings in pristine condition.</p>

          <div className="services-grid">
            {/* Home Cleaning Card */}
            <div className="service-card" id="service-home-cleaning">
              <div className="service-card__image">
                <img src={`${import.meta.env.BASE_URL}hero_home_cleaning.png`} alt="Home Cleaning Service" />
                <div className="service-card__badge">Most Popular</div>
              </div>
              <div className="service-card__body">
                <div className="service-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <h3>Home Cleaning</h3>
                <p>Complete top-to-bottom cleaning of your home — living rooms, bedrooms, kitchen, bathrooms, and more. Our certified professionals use eco-friendly products.</p>
                <ul className="service-features">
                  <li>✓ Full apartment & villa cleaning</li>
                  <li>✓ Kitchen & bathroom deep clean</li>
                  <li>✓ Eco-friendly products</li>
                  <li>✓ Flexible scheduling</li>
                </ul>
                <div className="service-card__footer">
                  <div className="service-price">
                    <span>From</span>
                    <strong>AED 199</strong>
                  </div>
                  <Link to="/book?service=home-cleaning" className="btn btn-primary" id="book-home-cleaning">Book Now</Link>
                </div>
              </div>
            </div>

            {/* Furniture Cleaning Card */}
            <div className="service-card" id="service-furniture-cleaning">
              <div className="service-card__image">
                <img src={`${import.meta.env.BASE_URL}furniture_cleaning.png`} alt="Furniture Cleaning Service" />
              </div>
              <div className="service-card__body">
                <div className="service-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/><path d="M2 11a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8z"/><line x1="6" y1="19" x2="6" y2="21"/><line x1="18" y1="19" x2="18" y2="21"/>
                  </svg>
                </div>
                <h3>Furniture Cleaning</h3>
                <p>Specialized deep cleaning for all types of furniture — sofas, chairs, mattresses, and more. We remove stains, allergens, and odors, restoring your furniture to like-new condition.</p>
                <ul className="service-features">
                  <li>✓ Sofa & upholstery cleaning</li>
                  <li>✓ Mattress deep cleaning</li>
                  <li>✓ Stain & odor removal</li>
                  <li>✓ Allergen treatment</li>
                </ul>
                <div className="service-card__footer">
                  <div className="service-price">
                    <span>From</span>
                    <strong>AED 149</strong>
                  </div>
                  <Link to="/book?service=furniture-cleaning" className="btn btn-primary" id="book-furniture-cleaning">Book Now</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY SHINEX ── */}
      <section className="section why-section" id="why-shinex">
        <div className="why-bg" />
        <div className="container">
          <p className="section-eyebrow">Reasons to Choose Us</p>
          <h2 className="section-title">Why Dubai Trusts ShineX</h2>
          <p className="section-subtitle">We're not just cleaners — we're your partners in maintaining a beautiful, healthy home.</p>

          <div className="why-grid">
            {[
              {
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
                title: 'Top-Rated Professionals',
                desc: 'All our cleaners are background-checked, trained, and rated 4.9/5 on average by Dubai clients.'
              },
              {
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
                title: 'Same-Day Availability',
                desc: 'Book in seconds and get a confirmed cleaner for today. Flexible slots available 7 days a week.'
              },
              {
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
                title: 'Fully Insured',
                desc: 'Your home and belongings are protected. We carry full insurance on every job we undertake.'
              },
              {
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
                title: 'Eco-Friendly Products',
                desc: 'We use only safe, eco-certified cleaning products — great for kids, pets, and the planet.'
              },
            ].map((item, i) => (
              <div key={i} className="why-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="why-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section how-section" id="how-it-works">
        <div className="container">
          <p className="section-eyebrow">Simple Process</p>
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Get your home cleaned in 3 easy steps.</p>

          <div className="how-grid">
            {[
              { step: '01', title: 'Choose Your Service', desc: 'Select Home Cleaning or Furniture Cleaning and pick your preferred date and time.' },
              { step: '02', title: 'Book & Confirm', desc: 'Fill in your details. Receive an instant confirmation with your assigned professional.' },
              { step: '03', title: 'Relax & Enjoy', desc: 'Our team arrives on time, cleans thoroughly, and leaves your home spotless.' },
            ].map((item, i) => (
              <div key={i} className="how-card">
                <div className="how-step">{item.step}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                {i < 2 && <div className="how-arrow">→</div>}
              </div>
            ))}
          </div>

          <div className="how-cta">
            <Link to="/book" className="btn btn-primary" id="home-book-cta">
              Book Your Cleaning
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="section reviews-section" id="reviews">
        <div className="container">
          <p className="section-eyebrow">Customer Reviews</p>
          <h2 className="section-title">What Dubai Says About Us</h2>
          <div className="reviews-stars">
            {'★★★★★'} <strong>4.9</strong> out of 5 based on 2,400+ reviews
          </div>

          <div className="reviews-carousel">
            {REVIEWS.map((r, i) => (
              <div
                key={i}
                className={`review-card${i === currentReview ? ' active' : ''}`}
                style={{ '--delay': `${i * 0.05}s` }}
              >
                <div className="review-stars">{'★'.repeat(r.rating)}</div>
                <p className="review-text">"{r.text}"</p>
                <div className="review-author">
                  <div className="review-avatar">{r.avatar}</div>
                  <div>
                    <strong>{r.name}</strong>
                    <span>{r.area}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="review-dots">
            {REVIEWS.map((_, i) => (
              <button
                key={i}
                id={`review-dot-${i}`}
                className={`review-dot${i === currentReview ? ' active' : ''}`}
                onClick={() => setCurrentReview(i)}
                aria-label={`Review ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── COVERAGE MAP ── */}
      <section className="section map-section" id="coverage">
        <div className="container">
          <p className="section-eyebrow">Service Coverage</p>
          <h2 className="section-title">We Cover All of Dubai</h2>
          <p className="section-subtitle">From Dubai Marina to Deira, our professionals cover every neighbourhood across the emirate.</p>

          <div className="map-container">
            <iframe
              id="dubai-coverage-map"
              title="ShineX Service Coverage - Dubai"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d231600.3882669893!2d54.94764445!3d25.076346350000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43496ad9c645%3A0xbde66e5084295162!2sDubai%20-%20United%20Arab%20Emirates!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="map-areas-list">
              <h3>Areas We Serve</h3>
              <div className="areas-tags">
                {DUBAI_AREAS.map(area => (
                  <span key={area} className="area-tag">{area}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="section team-section" id="team">
        <div className="container">
          <div className="team-inner">
            <div className="team-image">
              <img src={`${import.meta.env.BASE_URL}team.png`} alt="ShineX professional cleaning team" />
              <div className="team-badge">
                <strong>200+</strong>
                <span>Certified Professionals</span>
              </div>
            </div>
            <div className="team-content">
              <p className="section-eyebrow" style={{ textAlign: 'left' }}>Our Team</p>
              <h2 className="section-title" style={{ textAlign: 'left' }}>People Who Care About Your Home</h2>
              <p style={{ color: 'var(--gray-500)', lineHeight: '1.8', marginBottom: '24px' }}>
                Every ShineX professional is carefully vetted, trained, and equipped with the best tools. Our team undergoes regular quality assessments to ensure every visit exceeds your expectations.
              </p>
              <ul className="team-points">
                <li><span>✓</span> Background verified</li>
                <li><span>✓</span> Professional training program</li>
                <li><span>✓</span> Uniformed & insured</li>
                <li><span>✓</span> Rated &amp; reviewed after every job</li>
              </ul>
              <Link to="/about" className="btn btn-outline" id="team-learn-more">Learn More About Us</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="cta-banner" id="cta-banner">
        <div className="cta-bg">
          <img src={`${import.meta.env.BASE_URL}dubai_skyline.png`} alt="Dubai skyline" />
          <div className="cta-overlay" />
        </div>
        <div className="container cta-content">
          <h2>Ready for a Spotlessly Clean Home?</h2>
          <p>Book your cleaning service today. Fast, professional, and trusted across Dubai.</p>
          <div className="cta-buttons">
            <Link to="/book" className="btn btn-accent" id="cta-main-book">Book Now</Link>
            <Link to="/contact" className="btn btn-outline" style={{ borderColor:'var(--white)', color:'var(--white)' }}>Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
