import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function Dashboard() {
    const { user } = useAuth();

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Welcome, {user?.name || 'User'}!</h1>
            <p>Role: <strong>{user?.role}</strong></p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
                <Link to="/events" style={cardStyle}>🎉 Browse Events</Link>
                <Link to="/food-preorder" style={cardStyle}>🍔 Food Pre-Order</Link>
                <Link to="/parking" style={cardStyle}>🚗 Parking Reservation</Link>
                <Link to="/feedback" style={cardStyle}>💬 Submit Feedback</Link>
            </div>
        </div>
    );
}

const cardStyle = {
    display: 'block',
    padding: '1.5rem',
    background: '#1a1a2e',
    color: '#fff',
    borderRadius: '8px',
    textDecoration: 'none',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '1.1rem'
};

export default Dashboard;
