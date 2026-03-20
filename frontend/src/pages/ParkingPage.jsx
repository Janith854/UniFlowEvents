import React from 'react';
import { Navbar } from '../components/Navbar';
import { ParkingSlot } from '../components/ParkingSlot';

export function ParkingPage() {
  const mockSlots = [
    { id: 'A1', available: true },
    { id: 'A2', available: false },
    { id: 'A3', available: true }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 px-4 pb-16">
        <div className="w-full max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Event Parking
          </h1>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            {mockSlots.map((slot) => (
              <ParkingSlot key={slot.id} slot={slot} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

