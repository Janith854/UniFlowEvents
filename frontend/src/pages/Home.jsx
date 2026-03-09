import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../assets/styles/home.css';

/* ── DATA ── */
const FEATURES = [
    {
        icon: '🎉',
        title: 'Event Management',
        desc: 'Create, discover, and manage university events effortlessly. Stay updated with real-time notifications.',
        bg: 'linear-gradient(135deg,rgba(76,201,240,.18),rgba(106,78,232,.15))',
        color: '#4cc9f0',
    },
    {
        icon: '🍔',
        title: 'Food Pre-Order',
        desc: 'Skip the queue! Pre-order your favourite meals before attending events and pick them up hassle-free.',
        bg: 'linear-gradient(135deg,rgba(244,162,97,.18),rgba(247,37,133,.12))',
        color: '#f4a261',
    },
    {
        icon: '🚗',
        title: 'Parking Reservation',
        desc: 'Reserve your parking spot in advance and arrive at events without the stress of finding a space.',
        bg: 'linear-gradient(135deg,rgba(42,157,143,.18),rgba(76,201,240,.12))',
        color: '#2a9d8f',
    },
];

const EVENTS = [
    {
        emoji: '🎵',
        category: 'Music',
        categoryColor: '#f72585',
        bannerBg: 'linear-gradient(135deg,#2d0a4e,#6a0572)',
        title: 'Annual Music Festival 2026',
        date: 'March 15, 2026',
        location: 'Main Auditorium',
    },
    {
        emoji: '💻',
        category: 'Technology',
        categoryColor: '#4cc9f0',
        bannerBg: 'linear-gradient(135deg,#0d2137,#1e6091)',
        title: 'Tech Innovation Hackathon',
        date: 'March 22, 2026',
        location: 'Faculty of Engineering',
    },
    {
        emoji: '🎨',
        category: 'Arts',
        categoryColor: '#f4a261',
        bannerBg: 'linear-gradient(135deg,#2d1a00,#7d4e00)',
        title: 'Cultural Arts Exhibition',
        date: 'April 5, 2026',
        location: 'Art Gallery, Block C',
    },
];


/* ── Hero ── */
function Hero() {
    return (
        <section className="hero">
            <div className="hero-bg-orb orb1" />
            <div className="hero-bg-orb orb2" />
            <div className="hero-bg-orb orb3" />

            <div className="hero-content">
                <div className="hero-badge">
                    <span className="hero-badge-dot" />
                    University Event Platform — 2026
                </div>

                <h1 className="hero-title">
                    Welcome to<br />
                    <span className="gradient-text">UniFlowEvents</span>
                </h1>

                <p className="hero-subtitle">
                    Manage and explore university events easily in one place.
                    From food pre-orders to parking reservations — everything simplified.
                </p>

                <div className="hero-actions">
                    <Link to="/events" className="btn-hero-primary">Explore Events →</Link>
                    <Link to="/register" className="btn-hero-secondary">Register Now</Link>
                </div>

                <div className="hero-stats">
                    <div>
                        <div className="hero-stat-number">50+</div>
                        <div className="hero-stat-label">Annual Events</div>
                    </div>
                    <div>
                        <div className="hero-stat-number">5K+</div>
                        <div className="hero-stat-label">Students</div>
                    </div>
                    <div>
                        <div className="hero-stat-number">200+</div>
                        <div className="hero-stat-label">Parking Slots</div>
                    </div>
                </div>
            </div>

            {/* Floating cards — desktop only */}
            <div className="hero-visual">
                <div className="hero-card">
                    <div className="hero-card-icon" style={{ background: 'linear-gradient(135deg,#4cc9f0,#6a4ee8)' }}>🎉</div>
                    <div>
                        <div className="hero-card-title">Upcoming Events</div>
                        <div className="hero-card-sub">3 events this week</div>
                    </div>
                </div>
                <div className="hero-card">
                    <div className="hero-card-icon" style={{ background: 'linear-gradient(135deg,#f4a261,#f72585)' }}>🍔</div>
                    <div>
                        <div className="hero-card-title">Food Pre-Order</div>
                        <div className="hero-card-sub">Order before you arrive</div>
                    </div>
                </div>
                <div className="hero-card">
                    <div className="hero-card-icon" style={{ background: 'linear-gradient(135deg,#2a9d8f,#4cc9f0)' }}>🚗</div>
                    <div>
                        <div className="hero-card-title">Parking Available</div>
                        <div className="hero-card-sub">48 slots open today</div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── Features ── */
function Features() {
    return (
        <section className="section features-section">
            <div className="section-tag">Why UniFlowEvents?</div>
            <h2 className="section-title">Everything you need,<br />in one platform</h2>
            <p className="section-subtitle">
                From event discovery to food ordering and parking — we handle the logistics
                so you can focus on the experience.
            </p>

            <div className="features-grid">
                {FEATURES.map((f) => (
                    <div className="feature-card" key={f.title}>
                        <div className="feature-icon-wrap" style={{ background: f.bg }}>
                            {f.icon}
                        </div>
                        <h3>{f.title}</h3>
                        <p>{f.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ── Upcoming Events ── */
function UpcomingEvents() {
    return (
        <section className="section events-section">
            <div className="events-header">
                <div>
                    <div className="section-tag">Don't Miss Out</div>
                    <h2 className="section-title" style={{ marginBottom: 0 }}>Upcoming Events</h2>
                </div>
                <Link to="/events" className="btn-see-all">See All Events →</Link>
            </div>

            <div className="events-grid">
                {EVENTS.map((ev) => (
                    <div className="event-card" key={ev.title}>
                        <div className="event-card-banner" style={{ background: ev.bannerBg }}>
                            {ev.emoji}
                        </div>
                        <div className="event-card-body">
                            <div className="event-card-category" style={{ color: ev.categoryColor }}>
                                {ev.category}
                            </div>
                            <h3>{ev.title}</h3>
                            <div className="event-card-meta">
                                <div className="event-meta-item">
                                    <span>📅</span><span>{ev.date}</span>
                                </div>
                                <div className="event-meta-item">
                                    <span>📍</span><span>{ev.location}</span>
                                </div>
                            </div>
                            <Link to="/events" className="btn-view-details">View Details</Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}


/* ── Home Page ── */
function Home() {
    return (
        <>
            <Navbar />
            <Hero />
            <Features />
            <UpcomingEvents />
            <Footer />
        </>
    );
}

export default Home;
