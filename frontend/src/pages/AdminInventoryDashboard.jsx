import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export function AdminInventoryDashboard() {
  const { token } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [stallFilter, setStallFilter] = useState('All Stalls');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: 'Meals', price: '', stockCount: '', ecoScore: '', stallNumber: 'Stall 1', image: '' });

  useEffect(() => {
    fetchMenu();
  }, []);

  const availableImages = [
    { name: 'Vegan Burger', path: '/images/vegan_burger.png' },
    { name: 'Margherita Pizza', path: '/images/margherita_pizza.png' },
    { name: 'Sushi Platter', path: '/images/sushi_platter.png' },
    { name: 'Premium Steak', path: '/images/premium_steak.png' },
    { name: 'Caesar Salad', path: '/images/caesar_salad.png' },
    { name: 'Truffle Fries', path: '/images/truffle_fries.png' },
    { name: 'Loaded Nachos', path: '/images/loaded_nachos.png' },
    { name: 'Caramel Popcorn', path: '/images/caramel_popcorn.png' },
    { name: 'Soft Pretzel', path: '/images/soft_pretzel.png' },
    { name: 'Artisan Coffee', path: '/images/artisan_coffee.png' },
    { name: 'Berry Smoothie', path: '/images/berry_smoothie.png' },
    { name: 'Classic Cola', path: '/images/classic_cola.png' },
    { name: 'Fresh Lemonade', path: '/images/fresh_lemonade.png' },
    { name: 'Iced Lemon Tea', path: '/images/iced_lemon_tea.png' }
  ];

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5002/api/food/menu');
      setMenuItems(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch menu items.');
    } finally {
      setLoading(false);
    }
  };

  const getAuthHeader = () => {
    const authToken = token || (localStorage.getItem('uniflow_auth') ? JSON.parse(localStorage.getItem('uniflow_auth')).token : null);
    return authToken ? { Authorization: `Bearer ${authToken}` } : {};
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to completely delete this item from the active database?')) return;
    try {
      await axios.delete(`http://localhost:5002/api/food/menu/${id}`, { headers: getAuthHeader() });
      setMenuItems(menuItems.filter(item => item._id !== id));
    } catch (err) {
      alert('Failed to delete item.');
    }
  };

  const handleUpdateItem = async (id, field, value) => {
    try {
      const payload = { [field]: field === 'price' || field === 'stockCount' ? Number(value) : value };
      const res = await axios.put(`http://localhost:5002/api/food/menu/${id}`, payload, { headers: getAuthHeader() });
      setMenuItems(menuItems.map(item => item._id === id ? res.data : item));
    } catch (err) {
      console.error(err);
      alert(`Failed to update ${field} globally.`);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5002/api/food/upload', formData, {
        headers: {
          ...getAuthHeader()
        }
      });
      setNewItem({ ...newItem, image: res.data.path });
      toast.success('Image uploaded successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to upload image.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newItem, price: Number(newItem.price), stockCount: Number(newItem.stockCount), ecoScore: Number(newItem.ecoScore) };
      const res = await axios.post('http://localhost:5002/api/food/menu', payload, { headers: getAuthHeader() });
      setMenuItems([...menuItems, res.data]);
      setShowModal(false);
      setNewItem({ name: '', category: 'Meals', price: '', stockCount: '', ecoScore: '', stallNumber: 'Stall 1', image: '' });
    } catch (err) {
      alert('Failed to physically insert new Menu Item.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />
      <main className="pt-24 px-4 w-full max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-black text-gray-900">Inventory Management</h1>
          <button onClick={() => setShowModal(true)} className="bg-amber-500 hover:bg-amber-400 text-gray-900 px-6 py-3 rounded-xl font-bold shadow-sm transition-colors">
            + Add New Menu Item
          </button>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Search items by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 pl-10 font-medium text-gray-700 outline-none focus:ring-2 focus:ring-amber-500 shadow-sm transition-all"
            />
            <div className="absolute left-3 top-3.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
          </div>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-amber-500 shadow-sm transition-all cursor-pointer"
          >
            <option>All Categories</option>
            <option>Meals</option>
            <option>Snacks</option>
            <option>Beverages</option>
          </select>
          <select 
            value={stallFilter}
            onChange={(e) => setStallFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-amber-500 shadow-sm transition-all cursor-pointer"
          >
            <option>All Stalls</option>
            <option>Stall 1</option>
            <option>Stall 2</option>
            <option>Stall 3</option>
            <option>Stall 4</option>
          </select>
        </div>

        {error && <p className="text-red-500 bg-red-50 p-4 rounded-xl mb-4 font-bold border border-red-100">{error}</p>}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-700">
                  <th className="p-4 font-bold">Image</th>
                  <th className="p-4 font-bold">Item Name</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Stall</th>
                  <th className="p-4 font-bold text-center">Eco-Score</th>
                  <th className="p-4 font-bold">Price</th>
                  <th className="p-4 font-bold text-center">Active Stock</th>
                  <th className="p-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" className="p-4 text-center text-gray-500">Loading inventory sequence...</td></tr>
                ) : menuItems.length === 0 ? (
                  <tr><td colSpan="8" className="p-4 text-center text-gray-500">No active menu items found sequentially.</td></tr>
                ) : (
                  menuItems
                    .filter(item => {
                      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesCategory = categoryFilter === 'All Categories' || item.category === categoryFilter;
                      const matchesStall = stallFilter === 'All Stalls' || (item.stallNumber && item.stallNumber.includes(stallFilter));
                      return matchesSearch && matchesCategory && matchesStall;
                    })
                    .map((item) => (
                      <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                        <td className="p-4">
                          {item.image ? (
                            <img 
                              src={item.image.startsWith('/uploads') ? `http://localhost:5002${item.image}` : item.image} 
                              alt={item.name} 
                              className="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-sm bg-gray-50"
                              onError={(e) => { 
                                e.target.onerror = null; 
                                e.target.src = 'https://placehold.co/100x100?text=Food'; 
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                            </div>
                          )}
                        </td>
                        <td className="p-4 font-bold text-gray-900">{item.name}</td>
                        <td className="p-4 text-gray-600">{item.category}</td>
                        <td className="p-4">
                          <span className="text-xs uppercase font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded whitespace-nowrap">{item.stallNumber || 'General'}</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-black ${
                            item.ecoScore >= 80 ? 'bg-green-100 text-green-700' :
                            item.ecoScore >= 50 ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {item.ecoScore}/100
                          </span>
                        </td>
                      <td className="p-4 font-medium text-gray-700">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400 text-sm">Rs.</span>
                          <input 
                            type="number" 
                            className="w-24 border border-gray-300 rounded px-2 py-1 text-center font-bold focus:ring-2 focus:ring-amber-400 outline-none"
                            value={item.price}
                            onChange={(e) => handleUpdateItem(item._id, 'price', e.target.value)}
                          />
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => handleUpdateItem(item._id, 'stockCount', Math.max(0, item.stockCount - 1))}
                              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 font-bold transition-colors"
                            >
                              -
                            </button>
                            <input 
                              type="number" 
                              className={`w-16 border ${item.stockCount <= 5 ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg px-2 py-1 text-center font-bold focus:ring-2 focus:ring-amber-400 outline-none transition-colors`}
                              value={item.stockCount}
                              onChange={(e) => handleUpdateItem(item._id, 'stockCount', e.target.value)}
                            />
                            <button 
                              onClick={() => handleUpdateItem(item._id, 'stockCount', Number(item.stockCount) + 1)}
                              className="w-8 h-8 flex items-center justify-center bg-amber-100 hover:bg-amber-200 rounded-lg text-amber-700 font-bold transition-colors"
                            >
                              +
                            </button>
                          </div>
                          {item.stockCount <= 5 && (
                            <span className="text-[10px] font-black text-red-600 mt-1 uppercase tracking-tighter">Low Stock!</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleDelete(item._id)} className="bg-amber-400 text-zinc-950 hover:bg-amber-300 px-3 py-1 rounded font-bold text-sm transition-all border border-amber-500/20 active:scale-95">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Floating Add Item Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Menu Item</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Item Name</label>
                <input required type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g. Spicy Noodles" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                  <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-amber-500">
                    <option>Meals</option>
                    <option>Snacks</option>
                    <option>Beverages</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Stall Assignment</label>
                  <select value={newItem.stallNumber} onChange={e => setNewItem({...newItem, stallNumber: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-amber-500">
                    <option>Stall 1 (Hot Meals)</option>
                    <option>Stall 2 (Quick Bites)</option>
                    <option>Stall 3 (Desserts & Sweets)</option>
                    <option>Stall 4 (Beverages Bar)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Price (Rs.)</label>
                  <input required type="number" min="0" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Initial Stock</label>
                  <input required type="number" min="0" value={newItem.stockCount} onChange={e => setNewItem({...newItem, stockCount: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Eco-Score</label>
                  <input required type="number" min="0" max="100" value={newItem.ecoScore} onChange={e => setNewItem({...newItem, ecoScore: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Item Photo</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-amber-50 hover:border-amber-400 transition-all group">
                  {newItem.image ? (
                    <div className="flex items-center gap-4 w-full px-4">
                      <img
                        src={newItem.image.startsWith('/uploads') ? `http://localhost:5002${newItem.image}` : newItem.image}
                        alt="Preview"
                        className="w-20 h-20 rounded-xl object-cover border-2 border-amber-300 shadow-md"
                      />
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{newItem.image.split('/').pop()}</p>
                        <p className="text-xs text-amber-600 font-semibold mt-1">Click to change photo</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-amber-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <p className="text-sm font-bold mt-2">Click to upload a photo</p>
                      <p className="text-xs mt-1">PNG, JPG, WEBP supported</p>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>
              <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 text-gray-500 font-bold hover:text-zinc-950 transition-colors">Cancel</button>
                <button type="submit" className="bg-amber-400 hover:bg-amber-300 text-zinc-950 px-6 py-2 rounded-lg font-black shadow-lg shadow-amber-400/20 transition-all active:scale-95">Add to Menu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminInventoryDashboard;
