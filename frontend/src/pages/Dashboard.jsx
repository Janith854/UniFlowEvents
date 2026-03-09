import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../assets/styles/auth.css';

function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Redirect to login if unauthenticated
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return null; // Avoid flicker before redirect

    return (
        <div className="auth-page">
            <Navbar />
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h1 className="dashboard-title">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
                    <p className="dashboard-subtitle">Here is your UniFlowEvents overview.</p>
                </div>

                <div className="dashboard-content">
                    {/* Basic Profile Card */}
                    <div className="profile-card">
                        <div className="profile-avatar">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="profile-info">
                            <div className="info-group">
                                <span className="info-label">Full Name</span>
                                <span className="info-value">{user.name}</span>
                            </div>
                            <div className="info-group">
                                <span className="info-label">Email Address</span>
                                <span className="info-value">{user.email}</span>
                            </div>
                            <div className="info-group" style={{ marginTop: '0.5rem' }}>
                                <span className="info-label">Account Role</span>
                                <span className={`role-badge ${user.role?.toLowerCase()}`}>
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Placeholder for future features */}
                    <div className="profile-card">
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Quick Actions</h3>
                        <p style={{ color: '#6c8194', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            More features like Event Management and Food Pre-Orders will appear here based on your role.
                        </p>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', textAlign: 'center', color: '#c9d6df', fontSize: '0.9rem' }}>
                            Coming Soon 🚀
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Dashboard;
