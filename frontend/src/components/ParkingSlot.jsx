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

