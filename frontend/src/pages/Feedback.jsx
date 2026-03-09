import { useState } from 'react';
import { createFeedback } from '../services/feedbackService';
import { useAuth } from '../context/AuthContext';

function Feedback() {
    const { user } = useAuth();
    const [form, setForm] = useState({ message: '', rating: 5 });
    const [status, setStatus] = useState('');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('');
        try {
            await createFeedback({ user: user?.id, message: form.message, rating: Number(form.rating) });
            setStatus('Feedback submitted successfully!');
            setForm({ message: '', rating: 5 });
        } catch {
            setStatus('Failed to submit feedback.');
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h1>Submit Feedback</h1>
            {status && <p style={{ color: status.includes('success') ? 'green' : 'red' }}>{status}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Rating (1-5)</label>
                    <input name="rating" type="number" min="1" max="5" value={form.rating} onChange={handleChange}
                        style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.3rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Message</label>
                    <textarea name="message" value={form.message} onChange={handleChange} required rows={5}
                        style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.3rem', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }} placeholder="Share your experience..." />
                </div>
                <button type="submit" style={{ width: '100%', padding: '0.7rem', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Submit Feedback</button>
            </form>
        </div>
    );
}
export default Feedback;
