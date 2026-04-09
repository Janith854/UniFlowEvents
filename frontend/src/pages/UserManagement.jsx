import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export function UserManagementPage() {
  const { listUsers, createUser, editUser, removeUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student' });
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'student' });

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

  const handleStartEdit = (user) => {
    setEditingUserId(user.id);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'student'
    });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditForm({ name: '', email: '', role: 'student' });
  };

  const handleSaveEdit = async (id) => {
    setError('');
    setMessage('');

    try {
      await editUser(id, editForm);
      setMessage('User updated.');
      setEditingUserId(null);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update user.');
    }
  };

  const handleAddUser = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      await createUser(newUser);
      setMessage('User created.');
      setShowModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'student' });
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create user.');
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setMessage('');

    try {
      if (!window.confirm('Are you sure you want to delete this user?')) return;
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
              <p className="text-gray-600">Manage student and organizer accounts.</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-3 rounded-xl bg-amber-400 text-zinc-950 font-black hover:bg-amber-300 transition-all shadow-sm active:scale-95"
            >
              + Add User
            </button>
          </div>

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
                      <td className="p-4 text-gray-900">
                        {editingUserId === u.id ? (
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-gray-900"
                          />
                        ) : (
                          u.name
                        )}
                      </td>
                      <td className="p-4 text-gray-700">
                        {editingUserId === u.id ? (
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-gray-900"
                          />
                        ) : (
                          u.email
                        )}
                      </td>
                      <td className="p-4">
                        {editingUserId === u.id ? (
                          <select
                            value={editForm.role}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
                            className="bg-white border border-gray-300 rounded-md px-2 py-1.5 text-gray-800"
                          >
                            <option value="student">Student</option>
                            <option value="organizer">Organizer</option>
                          </select>
                        ) : (
                          <span className="text-gray-700">{u.role === 'organizer' ? 'Organizer' : 'Student'}</span>
                        )}
                      </td>
                      <td className="p-4">
                        {editingUserId === u.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSaveEdit(u.id)}
                              className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-black hover:bg-emerald-400 transition-all shadow-sm active:scale-95"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStartEdit(u)}
                              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-900 font-bold hover:bg-gray-200 transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 font-black hover:bg-amber-300 transition-all shadow-sm active:scale-95"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                <input
                  required
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                <input
                  required
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                <input
                  required
                  type="password"
                  minLength={6}
                  value={newUser.password}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="student">Student</option>
                  <option value="organizer">Organizer</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-400 text-zinc-950 font-black hover:bg-amber-300 transition-all shadow-sm active:scale-95"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagementPage;
