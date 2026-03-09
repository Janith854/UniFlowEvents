import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-grid">
                <div>
                    <Link to="/" className="nav-logo" style={{ marginBottom: '0.5rem', display: 'inline-flex' }}>
                        <div className="nav-logo-icon">U</div>
                        <span className="nav-logo-text">UniFlow<span>Events</span></span>
                    </Link>
                    <p className="footer-brand-desc">
                        Your all-in-one university event management platform. Discover events,
                        pre-order food, and reserve parking — all in one place.
                    </p>
                    <a href="mailto:support@uniflowevents.lk" className="footer-email-badge">
                        ✉ support@uniflowevents.lk
                    </a>
                </div>

                <div>
                    <div className="footer-col-title">Quick Links</div>
                    <ul className="footer-links">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/events">Events</Link></li>
                        <li><Link to="/food-preorder">Food Pre-Order</Link></li>
                        <li><Link to="/parking">Parking</Link></li>
                    </ul>
                </div>

                <div>
                    <div className="footer-col-title">Account</div>
                    <ul className="footer-links">
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/register">Register</Link></li>
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        <li><Link to="/feedback">Feedback</Link></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© 2026 UniFlowEvents. All rights reserved.</p>
                <div className="footer-bottom-badge">
                    Built with <span>♥</span> for university students
                </div>
            </div>
        </footer>
    );
}

export default Footer;
