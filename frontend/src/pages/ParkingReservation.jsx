
import React from 'react';
import { Navbar } from '../components/Navbar';
import { ParkingSlot } from '../components/ParkingSlot';

export function ParkingReservation() {
  const locationName = 'SLIIT Car Park';
  const locationCode = 'WX7F+VC2, Malabe';
  const mapsQuery = 'https://www.google.com/maps?q=WX7F%2BVC2%2C%20Malabe';
  const mapsEmbed = 'https://maps.google.com/maps?q=WX7F%2BVC2%2C%20Malabe&z=17&output=embed';

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

          <section className="mb-8 bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
            <div className="p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Parking Location</p>
              <h2 className="text-xl font-bold text-gray-900">{locationName}</h2>
              <p className="text-gray-600 mt-1">{locationCode}</p>
              <a
                href={mapsQuery}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center mt-4 px-4 py-2 rounded-lg bg-amber-400 text-zinc-900 font-semibold hover:bg-amber-300 transition-colors"
              >
                Open in Google Maps
              </a>
            </div>
            <iframe
              title="SLIIT Car Park Map"
              src={mapsEmbed}
              loading="lazy"
              className="w-full h-72 border-0"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </section>

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


