// Placeholder auth service. Later you can connect this to your backend.

export async function loginUser(credentials) {
  // Simulate a real API call
  return Promise.resolve({
    user: {
      name: 'UniFlow User',
      email: credentials.email,
      role: credentials.role || 'student'
    },
    token: 'fake-token'
  });
}

export async function registerUser(data) {
  return Promise.resolve({
    user: {
      name: data.name,
      email: data.email,
      role: data.role || 'student'
    },
    token: 'fake-token'
  });
}

