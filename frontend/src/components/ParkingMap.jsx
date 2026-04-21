import React from 'react';

export function ParkingMap({ selectedSlot, onSelectSlot, reservedSlots }) {
  const zones = [
    { name: 'North', prefix: 'N', rows: 2, cols: 5 },
    { name: 'South', prefix: 'S', rows: 2, cols: 5 }
  ];

  const isReserved = (slotId) => reservedSlots.some(s => s.slotNumber === slotId);

  return (
    <div className="space-y-12">
      {zones.map((zone) => (
        <div key={zone.name} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-between">
            {zone.name} Zone
            <span className="text-xs font-normal text-gray-500 uppercase tracking-wider">
              {zone.rows * zone.cols} Total Slots
            </span>
          </h3>
          
          <div className="grid grid-cols-5 gap-3 md:gap-4">
            {Array.from({ length: zone.rows * zone.cols }).map((_, i) => {
              const slotId = `${zone.prefix}${i + 1}`;
              const reserved = isReserved(slotId);
              const selected = selectedSlot === slotId;

              return (
                <button
                  key={slotId}
                  disabled={reserved}
                  onClick={() => onSelectSlot(slotId, zone.name)}
                  className={`
                    h-16 md:h-20 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1
                    ${reserved 
                      ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60' 
                      : selected
                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400 ring-offset-2'
                        : 'bg-white border-dashed border-gray-300 hover:border-amber-400 hover:bg-amber-50/50'
                    }
                  `}
                >
                  <span className={`text-xs font-bold ${reserved ? 'text-gray-400' : 'text-zinc-950'}`}>
                    {slotId}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {reserved ? 'TAKEN' : 'VACANT'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="flex gap-6 justify-center text-xs text-gray-500 font-medium pb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-dashed border-gray-300"></div>
          Available
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-100 border-2 border-gray-200"></div>
          Reserved
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-50 border-2 border-amber-400"></div>
          Selected
        </div>
      </div>
    </div>
  );
}
