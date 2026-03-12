// Placeholder parking service

export async function fetchParkingSlots() {
  return Promise.resolve([
    { id: 'A1', available: true },
    { id: 'A2', available: false }
  ]);
}

