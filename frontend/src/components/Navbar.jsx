import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        navigate('/login');
    };

    return (
        <nav style={{ padding: '1rem', background: '#1a1a2e', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
            <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>
                UniFlowEvents
            </Link>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Link to="/events" style={{ color: '#fff', textDecoration: 'none' }}>Events</Link>
                {user ? (
                    <>
                        <Link to="/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</Link>
                        <button onClick={handleLogout} style={{ background: '#e63946', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>Login</Link>
                        <Link to="/register" style={{ color: '#fff', textDecoration: 'none' }}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
