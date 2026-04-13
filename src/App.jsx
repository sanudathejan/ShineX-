import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import Book from './pages/Book';
import About from './pages/About';
import Contact from './pages/Contact';
import './index.css';

// Scroll to top on page change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Layout({ children }) {
  const { pathname } = useLocation();
  // Don't show footer on simple pages
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

function AppRoutes() {
  return (
    <Layout>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/home-cleaning" element={<Services />} />
        <Route path="/services/furniture-cleaning" element={<Services />} />
        <Route path="/book" element={<Book />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        {/* 404 */}
        <Route path="*" element={
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '60vh', paddingTop: '80px',
            fontFamily: 'var(--font-display)', textAlign: 'center', padding: '80px 24px'
          }}>
            <h1 style={{ fontSize: '80px', fontWeight: '900', color: 'var(--primary)', lineHeight: 1 }}>404</h1>
            <h2 style={{ fontSize: '24px', color: 'var(--gray-800)', margin: '16px 0 8px' }}>Page Not Found</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: '28px' }}>The page you're looking for doesn't exist.</p>
            <a href="/" className="btn btn-primary">Go Home</a>
          </div>
        } />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/ShineX-/">
      <AppRoutes />
    </BrowserRouter>
  );
}
