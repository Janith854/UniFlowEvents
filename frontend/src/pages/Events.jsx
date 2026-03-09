import { useEffect, useState } from 'react';
import { getEvents } from '../services/eventService';
import EventCard from '../components/EventCard';

function Events() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getEvents()
            .then(res => setEvents(res.data))
            .catch(err => setError(err.response?.data?.error || 'Failed to load events'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p style={{ padding: '2rem' }}>Loading events...</p>;
    if (error) return <p style={{ padding: '2rem', color: 'red' }}>{error}</p>;

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Upcoming Events</h1>
            {events.length === 0 ? <p>No events found.</p> : events.map(event => <EventCard key={event._id} event={event} />)}
        </div>
    );
}
export default Events;
