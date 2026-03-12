// Placeholder feedback service

export async function fetchFeedbackForEvent(eventId) {
  return Promise.resolve([
    { id: '1', eventId, comment: 'Great event!', rating: 5 },
    { id: '2', eventId, comment: 'Very informative.', rating: 4 }
  ]);
}

