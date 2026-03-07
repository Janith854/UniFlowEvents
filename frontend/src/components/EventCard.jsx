import { formatDate } from '../utils/helpers';

function EventCard({ event }) {
    return (
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', background: '#fff' }}>
            <h3 style={{ margin: '0 0 0.5rem' }}>{event.title}</h3>
            <p style={{ color: '#555', margin: '0 0 0.5rem' }}>{event.description}</p>
            <small style={{ color: '#888' }}>
                📅 {formatDate(event.date)} &nbsp; 📍 {event.location}
            </small>
        </div>
    );
}

export default EventCard;
