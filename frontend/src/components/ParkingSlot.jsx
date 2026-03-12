<<<<<<< HEAD
function ParkingSlot({ slot, onReserve }) {
    const isAvailable = slot.status === 'available';
    return (
        <div style={{
            padding: '1rem', border: '2px solid', borderRadius: '8px',
            borderColor: isAvailable ? '#2a9d8f' : '#e63946',
            display: 'inline-block', margin: '0.5rem', textAlign: 'center', minWidth: '80px'
        }}>
            <p style={{ fontWeight: 'bold', margin: '0 0 0.5rem' }}>{slot.slotNumber}</p>
            <small style={{ color: isAvailable ? '#2a9d8f' : '#e63946' }}>
                {isAvailable ? 'Available' : 'Reserved'}
            </small>
            {isAvailable && (
                <div>
                    <button onClick={() => onReserve(slot)} style={{ marginTop: '0.5rem', background: '#2a9d8f', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.3rem 0.6rem', cursor: 'pointer' }}>
                        Reserve
                    </button>
                </div>
            )}
        </div>
    );
}

export default ParkingSlot;
=======
import React from 'react';

export function ParkingSlot({ slot }) {
  const base =
    'aspect-[3/4] rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all';

  const stateClass = !slot.available
    ? 'bg-gray-200 border border-gray-300 text-gray-400 cursor-not-allowed'
    : 'bg-cyan-400/10 border border-cyan-400 text-cyan-600 hover:bg-cyan-400/20';

  return (
    <button
      type="button"
      disabled={!slot.available}
      className={`${base} ${stateClass}`}
    >
      <span>{slot.id}</span>
      {!slot.available && (
        <span className="mt-1 text-[10px] uppercase tracking-wide">
          Taken
        </span>
      )}
    </button>
  );
}

>>>>>>> feature/user-management
