import { Link } from 'react-router-dom';
import './Services.css';

const HOME_CLEANING_INCLUSIONS = [
  'Living Room & Common Areas', 'Kitchen & Appliances', 'Bathrooms & Toilets',
  'Bedrooms & Wardrobes', 'Windows (interior)', 'Balcony Sweep',
  'Dusting & Vacuuming', 'Mopping & Floor Cleaning'
];

const FURNITURE_INCLUSIONS = [
  'Sofa & Couch Cleaning', 'Armchairs & Recliners', 'Mattress Deep Clean',
  'Dining Chairs', 'Office Chairs', 'Curtain Cleaning',
  'Stain & Odor Removal', 'Allergen Treatment'
];

const CAR_WASH_INCLUSIONS = [
  'Exterior Hand Wash', 'Interior Vacuuming', 'Dashboard & Console Wipe',
  'Window Cleaning', 'Tire & Rim Cleaning', 'Air Freshener'
];

const HOME_PACKAGES = [
  { name: 'Studio', hours: '2 hrs', price: 'AED 199', rooms: '1 Room + 1 Bath' },
  { name: '1 Bedroom', hours: '3 hrs', price: 'AED 249', rooms: '1 Bed + 1 Bath' },
  { name: '2 Bedrooms', hours: '4 hrs', price: 'AED 329', rooms: '2 Beds + 2 Baths' },
  { name: '3 Bedrooms', hours: '5 hrs', price: 'AED 419', rooms: '3 Beds + 2 Baths', popular: true },
  { name: '4 Bedrooms', hours: '7 hrs', price: 'AED 549', rooms: '4 Beds + 3 Baths' },
  { name: 'Villa / Custom', hours: 'Custom', price: 'Contact Us', rooms: 'All sizes' },
];

const FURNITURE_PACKAGES = [
  { name: '2-Seater Sofa', price: 'AED 149' },
  { name: '3-Seater Sofa', price: 'AED 189' },
  { name: 'L-Shape Sofa', price: 'AED 249' },
  { name: 'Single Mattress', price: 'AED 99' },
  { name: 'Double Mattress', price: 'AED 149' },
  { name: 'King Mattress', price: 'AED 189', popular: true },
  { name: 'Dining Chair Set (4)', price: 'AED 179' },
  { name: 'Full Furniture Set', price: 'From AED 399' },
];

const CAR_WASH_PACKAGES = [
  { name: 'Normal Cleaning', price: 'AED 29', desc: 'Quick exterior wash' },
  { name: 'Full Cleaning', price: 'AED 59', desc: 'Inside & outside', popular: true },
];

export default function Services() {
  return (
    <div className="services-page">
      {/* Hero */}
      <section className="services-hero">
        <div className="services-hero-bg">
          <img src={`${import.meta.env.BASE_URL}hero_home_cleaning.png`} alt="Cleaning services" />
          <div className="services-hero-overlay" />
        </div>
        <div className="container services-hero-content">
          <p className="section-eyebrow" style={{ color: '#81C784' }}>What We Offer</p>
          <h1>Our Cleaning Services</h1>
          <p>Three specialized services to keep your Dubai home, furniture, and car spotless.</p>
        </div>
      </section>

      {/* ── HOME CLEANING ── */}
      <section className="section" id="home-cleaning">
        <div className="container">
          <div className="service-detail-layout">
            <div className="service-detail-media">
              <img src={`${import.meta.env.BASE_URL}hero_home_cleaning.png`} alt="Home Cleaning Service in Dubai" />
              <div className="service-detail-media__badge">
                <span>🏅</span> Most Popular Service
              </div>
            </div>
            <div className="service-detail-body">
              <div className="service-tag home">Home Cleaning</div>
              <h2>Professional Home Cleaning</h2>
              <p>
                Our expert team provides a thorough, top-to-bottom clean of your entire home.
                Whether it's a studio apartment or a 5-bedroom villa, we bring the right team
                and the right tools to make it shine.
              </p>
              <div className="includes-grid">
                <h3>What's Included</h3>
                <div className="includes-tags">
                  {HOME_CLEANING_INCLUSIONS.map(item => (
                    <span key={item} className="include-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <Link to="/book?service=home-cleaning" className="btn btn-primary" id="services-book-home">
                Book Home Cleaning
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </div>

          {/* Packages */}
          <div className="packages-section" id="home-cleaning-packages">
            <h3 className="packages-title">Home Cleaning Packages</h3>
            <div className="packages-grid">
              {HOME_PACKAGES.map((pkg) => (
                <div key={pkg.name} className={`package-card${pkg.popular ? ' popular' : ''}`}>
                  {pkg.popular && <div className="package-badge">Best Value</div>}
                  <h4>{pkg.name}</h4>
                  <p className="pkg-rooms">{pkg.rooms}</p>
                  <div className="pkg-hours">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {pkg.hours}
                  </div>
                  <div className="pkg-price">{pkg.price}</div>
                  <Link to={`/book?service=home-cleaning&package=${encodeURIComponent(pkg.name)}`} className="btn btn-outline pkg-btn">Book</Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="service-divider">
        <div className="container">
          <div className="divider-inner" />
        </div>
      </div>

      {/* ── FURNITURE CLEANING ── */}
      <section className="section" id="furniture-cleaning">
        <div className="container">
          <div className="service-detail-layout reverse">
            <div className="service-detail-body">
              <div className="service-tag furniture">Furniture Cleaning</div>
              <h2>Expert Furniture Cleaning</h2>
              <p>
                Our specialized furniture cleaning service uses professional-grade steam cleaning
                and eco-safe detergents to deep-clean your sofas, mattresses, and upholstered
                furniture — removing stains, odors, and allergens effectively.
              </p>
              <div className="includes-grid">
                <h3>What's Included</h3>
                <div className="includes-tags">
                  {FURNITURE_INCLUSIONS.map(item => (
                    <span key={item} className="include-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <Link to="/book?service=furniture-cleaning" className="btn btn-primary" id="services-book-furniture">
                Book Furniture Cleaning
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
            <div className="service-detail-media">
              <img src={`${import.meta.env.BASE_URL}furniture_cleaning.png`} alt="Furniture Cleaning Service in Dubai" />
            </div>
          </div>

          {/* Packages */}
          <div className="packages-section" id="furniture-cleaning-packages">
            <h3 className="packages-title">Furniture Cleaning Packages</h3>
            <div className="packages-grid furniture-packages">
              {FURNITURE_PACKAGES.map((pkg) => (
                <div key={pkg.name} className={`package-card${pkg.popular ? ' popular' : ''}`}>
                  {pkg.popular && <div className="package-badge">Best Value</div>}
                  <h4>{pkg.name}</h4>
                  <div className="pkg-price">{pkg.price}</div>
                  <Link to={`/book?service=furniture-cleaning&package=${encodeURIComponent(pkg.name)}`} className="btn btn-outline pkg-btn">Book</Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="service-divider">
        <div className="container">
          <div className="divider-inner" />
        </div>
      </div>

      {/* ── CAR WASH ── */}
      <section className="section" id="car-wash">
        <div className="container">
          <div className="service-detail-layout">
            <div className="service-detail-media">
              <img src={`${import.meta.env.BASE_URL}car_wash.png`} alt="Car Wash Service in Dubai" />
              <div className="service-detail-media__badge">
                <span>🚗</span> New Service
              </div>
            </div>
            <div className="service-detail-body">
              <div className="service-tag carwash">Car Wash</div>
              <h2>Professional Car Wash</h2>
              <p>
                Get your car sparkling clean without leaving your home! Our mobile car wash
                team comes to your location with all the equipment and premium products needed
                to give your car a showroom-quality clean.
              </p>
              <div className="includes-grid">
                <h3>What's Included</h3>
                <div className="includes-tags">
                  {CAR_WASH_INCLUSIONS.map(item => (
                    <span key={item} className="include-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <Link to="/book?service=car-wash" className="btn btn-primary" id="services-book-carwash">
                Book Car Wash
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </div>

          {/* Car Wash Packages */}
          <div className="packages-section" id="car-wash-packages">
            <h3 className="packages-title">Car Wash Packages</h3>
            <div className="packages-grid carwash-packages">
              {CAR_WASH_PACKAGES.map((pkg) => (
                <div key={pkg.name} className={`package-card${pkg.popular ? ' popular' : ''}`}>
                  {pkg.popular && <div className="package-badge">Best Value</div>}
                  <h4>{pkg.name}</h4>
                  <p className="pkg-rooms">{pkg.desc}</p>
                  <div className="pkg-price">{pkg.price}</div>
                  <Link to={`/book?service=car-wash&package=${encodeURIComponent(pkg.name)}`} className="btn btn-outline pkg-btn">Book</Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section services-cta-section">
        <div className="container">
          <div className="services-cta-card">
            <div className="services-cta-text">
              <h2>Not sure which service you need?</h2>
              <p>Our friendly team is here to help you choose the right cleaning plan for your home or car.</p>
            </div>
            <div className="services-cta-actions">
              <Link to="/contact" className="btn btn-outline" id="services-contact">Contact Us</Link>
              <Link to="/book" className="btn btn-primary" id="services-book-all">Book a Service</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
