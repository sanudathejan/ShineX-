import { Link } from 'react-router-dom';
import './About.css';

const VALUES = [
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    title: 'Integrity',
    desc: 'We operate with full transparency and honesty in every service we provide.'
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    title: 'Excellence',
    desc: 'We maintain the highest standards of cleaning quality with constant improvements.'
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    title: 'Community',
    desc: 'We support our team and the Dubai community through responsible business practices.'
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/><path d="M9 12l2 2 4-4"/></svg>,
    title: 'Reliability',
    desc: 'Show up on time, every time. Our clients can count on us to deliver consistently.'
  },
];

export default function About() {
  return (
    <div className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-bg">
          <img src={`${import.meta.env.BASE_URL}team.png`} alt="ShineX professional team" />
          <div className="about-hero-overlay" />
        </div>
        <div className="container about-hero-content">
          <p className="section-eyebrow" style={{ color: '#81C784' }}>About Us</p>
          <h1>Cleaning Dubai, One Home at a Time</h1>
          <p>Professional, trusted, and passionate about clean spaces.</p>
        </div>
      </section>

      {/* Story */}
      <section className="section">
        <div className="container">
          <div className="about-story">
            <div className="about-story-text">
              <p className="section-eyebrow" style={{ textAlign: 'left' }}>Our Story</p>
              <h2 className="section-title" style={{ textAlign: 'left' }}>Born in Dubai, Built for Dubai</h2>
              <p>ShineX was founded with a simple but powerful vision — to make professional cleaning services accessible, reliable, and truly excellent for every resident in Dubai.</p>
              <p>We started with a small but dedicated team of certified cleaning professionals, and today we're proud to serve thousands of happy clients across all major areas of Dubai — from the modern high-rises of Dubai Marina to the family villas of Arabian Ranches.</p>
              <p>Our promise is simple: we treat every home like our own, with care, precision, and respect.</p>
            </div>
            <div className="about-story-image">
              <img src={`${import.meta.env.BASE_URL}hero_home_cleaning.png`} alt="ShineX cleaning in action" />
              <div className="about-story-card">
                <div className="about-stats-mini">
                  {[
                    { num: '5,000+', label: 'Happy Clients' },
                    { num: '200+', label: 'Professionals' },
                    { num: '3+', label: 'Years in Service' },
                    { num: '4.9★', label: 'Rating' },
                  ].map(s => (
                    <div key={s.label} className="about-stat">
                      <strong>{s.num}</strong>
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section about-values-section">
        <div className="container">
          <p className="section-eyebrow">What We Stand For</p>
          <h2 className="section-title">Our Core Values</h2>
          <div className="values-grid">
            {VALUES.map((v, i) => (
              <div key={i} className="value-card">
                <div className="value-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team - Single Founder */}
      <section className="section">
        <div className="container">
          <p className="section-eyebrow">The Person Behind ShineX</p>
          <h2 className="section-title">Meet Our Founder</h2>
          <p className="section-subtitle">Leading ShineX's mission to make Dubai cleaner and healthier.</p>
          <div className="team-grid team-grid-single">
            <div className="team-card founder-card">
              <div className="team-card__avatar">DI</div>
              <h3>Dhanushka Indrajith</h3>
              <p className="team-card__role">Founder & CEO</p>
              <div className="team-card__contact">

                <a href="https://wa.me/971556645537" target="_blank" rel="noopener noreferrer" className="team-contact-link whatsapp-link">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section about-cta">
        <div className="container">
          <div className="about-cta-inner">
            <h2>Ready to Experience the ShineX Difference?</h2>
            <p>Book your first cleaning today and see why Dubai trusts us.</p>
            <Link to="/book" className="btn btn-primary" id="about-book-cta">Book a Cleaning</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
