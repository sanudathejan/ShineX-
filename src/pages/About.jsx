import { Link } from 'react-router-dom';
import './About.css';

const TEAM_MEMBERS = [
  { name: 'Ahmed Al-Mansoori', role: 'Founder & CEO', initials: 'AA' },
  { name: 'Sarah Johnson', role: 'Head of Operations', initials: 'SJ' },
  { name: 'Ravi Krishnamurthy', role: 'Quality Assurance Lead', initials: 'RK' },
  { name: 'Fatima Al-Zaabi', role: 'Customer Success Manager', initials: 'FZ' },
];

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
          <img src="/team.png" alt="ShineX professional team" />
          <div className="about-hero-overlay" />
        </div>
        <div className="container about-hero-content">
          <p className="section-eyebrow" style={{ color: '#7DD3FC' }}>About Us</p>
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
              <img src="/hero_home_cleaning.png" alt="ShineX cleaning in action" />
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

      {/* Team */}
      <section className="section">
        <div className="container">
          <p className="section-eyebrow">The People Behind ShineX</p>
          <h2 className="section-title">Meet Our Leadership</h2>
          <p className="section-subtitle">A passionate, experienced team dedicated to making Dubai cleaner and healthier.</p>
          <div className="team-grid">
            {TEAM_MEMBERS.map((m, i) => (
              <div key={i} className="team-card">
                <div className="team-card__avatar">{m.initials}</div>
                <h3>{m.name}</h3>
                <p>{m.role}</p>
              </div>
            ))}
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
