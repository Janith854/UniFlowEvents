import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export function UserManagementPage() {
  const { listUsers, editUser, removeUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listUsers();
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, role) => {
    setError('');
    setMessage('');

    try {
      await editUser(id, { role });
      setMessage('User role updated.');
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update role.');
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setMessage('');

    try {
      await removeUser(id);
      setMessage('User deleted.');
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete user.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 px-4 pb-16">
        <div className="w-full max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600 mb-6">Manage student and organizer accounts.</p>

          {message && <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg p-3 mb-4">{message}</p>}
          {error && <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3 mb-4">{error}</p>}

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {loading ? (
              <p className="p-6 text-gray-600">Loading users...</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Role</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-gray-100">
                      <td className="p-4 text-gray-900">{u.name}</td>
                      <td className="p-4 text-gray-700">{u.email}</td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-white border border-gray-300 rounded-md px-2 py-1.5 text-gray-800"
                        >
                          <option value="student">Student</option>
                          <option value="organizer">Organizer</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="px-3 py-1.5 rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default UserManagementPage;
