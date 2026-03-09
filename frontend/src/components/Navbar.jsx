import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../assets/styles/home.css';

function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const handleLogout = () => {
        logoutUser();
        navigate('/login');
    };

    return (
        <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
            <Link to="/" className="nav-logo">
                <div className="nav-logo-icon">U</div>
                <span className="nav-logo-text">UniFlow<span>Events</span></span>
            </Link>

            <ul className="nav-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/events">Events</Link></li>
                <li><Link to="/food-preorder">Food Pre-Order</Link></li>
                <li><Link to="/parking">Parking</Link></li>
            </ul>

            <div className="nav-actions">
                {user ? (
                    <>
                        <Link to="/dashboard" className="btn-ghost">Profile</Link>
                        <button onClick={handleLogout} className="btn-primary" style={{ fontFamily: 'inherit' }}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn-ghost">Sign In</Link>
                        <Link to="/register" className="btn-primary">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
