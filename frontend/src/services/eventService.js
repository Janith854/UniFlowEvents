// Placeholder event service with mock data

const mockEvents = [
  { id: '1', title: 'Tech Innovation Summit' },
  { id: '2', title: 'Spring Music Festival' }
];

export async function fetchEvents() {
  return Promise.resolve(mockEvents);
}

export async function fetchEventById(id) {
  return Promise.resolve(mockEvents.find((e) => e.id === id) || null);
}

