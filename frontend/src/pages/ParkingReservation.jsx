import { useState } from 'react';
import ParkingSlot from '../components/ParkingSlot';
import { createParkingReservation } from '../services/parkingService';
import { useAuth } from '../context/AuthContext';

const SAMPLE_SLOTS = [
    { slotNumber: 'A1', status: 'available' },
    { slotNumber: 'A2', status: 'reserved' },
    { slotNumber: 'A3', status: 'available' },
    { slotNumber: 'B1', status: 'available' },
    { slotNumber: 'B2', status: 'reserved' },
    { slotNumber: 'B3', status: 'available' },
];

function ParkingReservation() {
    const { user } = useAuth();
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [message, setMessage] = useState('');

    const handleReserve = async (slot) => {
        if (!vehicleNumber.trim()) {
            setMessage('Please enter your vehicle number first.');
            return;
        }
        try {
            await createParkingReservation({ user: user?.id, slotNumber: slot.slotNumber, vehicleNumber });
            setMessage(`Slot ${slot.slotNumber} reserved for ${vehicleNumber}!`);
        } catch {
            setMessage('Failed to reserve parking slot.');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Parking Reservation</h1>
            <div style={{ marginBottom: '1.5rem' }}>
                <label>Vehicle Number: </label>
                <input value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)}
                    placeholder="e.g. CAK-1234" style={{ padding: '0.4rem', marginLeft: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div>
                {SAMPLE_SLOTS.map((slot, idx) => (
                    <ParkingSlot key={idx} slot={slot} onReserve={handleReserve} />
                ))}
            </div>
            {message && <p style={{ marginTop: '1rem', color: 'green' }}>{message}</p>}
        </div>
    );
}

export default ParkingReservation;
