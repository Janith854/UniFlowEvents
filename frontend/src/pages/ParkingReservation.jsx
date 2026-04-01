
import React from 'react';
import { Navbar } from '../components/Navbar';
import { ParkingSlot } from '../components/ParkingSlot';

export function ParkingReservation() {
  const mockSlots = [
    { id: 'B1', available: true },
    { id: 'B2', available: true },
    { id: 'B3', available: false }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 px-4 pb-16">
        <div className="w-full max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Reserve a Parking Spot
          </h1>
          <p className="text-gray-600 mb-6">
            Choose an available spot for your upcoming event.
          </p>
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


