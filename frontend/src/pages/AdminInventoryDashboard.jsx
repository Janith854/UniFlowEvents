import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FileSpreadsheet, FileText, ChevronLeft, ChevronRight, Edit3, Trash2, Upload } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { getMenu } from '../services/foodService';

export function AdminInventoryDashboard() {
  const { token } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filtering State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 50;

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [stallFilter, setStallFilter] = useState('All Stalls');
  const [globalStats, setGlobalStats] = useState({ totalItems: 0, totalStock: 0, totalValue: 0, lowStockCount: 0 });

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [newItem, setNewItem] = useState({ name: '', category: 'Meals', price: '', stockCount: '', ecoScore: '', stallNumber: 'Stall 1 (Hot Meals)', image: '' });

  useEffect(() => {
    setPage(1);
  }, [searchQuery, categoryFilter, stallFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMenu();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, categoryFilter, stallFilter, page]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const params = { page, limit, search: searchQuery, category: categoryFilter, stall: stallFilter };
      const res = await getMenu(params);
      setMenuItems(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
      if (res.data.globalStats) setGlobalStats(res.data.globalStats);
      setError('');
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
    if (!window.confirm('Are you sure you want to completely delete this item?')) return;
    try {
      await axios.delete(`http://localhost:5002/api/food/menu/${id}`, { headers: getAuthHeader() });
      toast.success('Item deleted');
      fetchMenu();
    } catch (err) {
      toast.error('Failed to delete item.');
    }
  };

  // Debounced Inline Update
  const updateItemAPI = async (id, field, value) => {
    try {
      const payload = { [field]: field === 'price' || field === 'stockCount' ? Number(value) : value };
      await axios.put(`http://localhost:5002/api/food/menu/${id}`, payload, { headers: getAuthHeader() });
      // update local state for stats if needed, or just re-fetch stats
    } catch (err) {
      toast.error(`Failed to update ${field}`);
    }
  };

  const handleInlineUpdate = (id, field, value) => {
    // Optimistic UI update
    setMenuItems(prev => prev.map(item => item._id === id ? { ...item, [field]: value } : item));
    
    // Debounce the API call
    const timerId = setTimeout(() => {
      updateItemAPI(id, field, value);
    }, 1000);
    return () => clearTimeout(timerId);
  };

  const handleFileUpload = async (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5002/api/food/upload', formData, {
        headers: { ...getAuthHeader() }
      });
      if (isEdit) {
        setEditingItem({ ...editingItem, image: res.data.path });
      } else {
        setNewItem({ ...newItem, image: res.data.path });
      }
      toast.success('Image uploaded!');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newItem, price: Number(newItem.price), stockCount: Number(newItem.stockCount), ecoScore: Number(newItem.ecoScore) };
      await axios.post('http://localhost:5002/api/food/menu', payload, { headers: getAuthHeader() });
      setShowAddModal(false);
      setNewItem({ name: '', category: 'Meals', price: '', stockCount: '', ecoScore: '', stallNumber: 'Stall 1 (Hot Meals)', image: '' });
      fetchMenu();
      toast.success('Item added');
    } catch (err) {
      toast.error('Failed to add item');
    }
  };

  const handleEditItem = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editingItem, price: Number(editingItem.price), stockCount: Number(editingItem.stockCount), ecoScore: Number(editingItem.ecoScore) };
      await axios.put(`http://localhost:5002/api/food/menu/${editingItem._id}`, payload, { headers: getAuthHeader() });
      setShowEditModal(false);
      fetchMenu();
      toast.success('Item updated');
    } catch (err) {
      toast.error('Failed to update item');
    }
  };

  const fetchFullReportData = async () => {
    try {
      const params = { search: searchQuery, category: categoryFilter, stall: stallFilter, report: 'true' };
      const res = await getMenu(params);
      return res.data;
    } catch (e) {
      toast.error("Failed to fetch data for report.");
      return null;
    }
  };

  const generateCSVReport = async () => {
    const reportData = await fetchFullReportData();
    if (!reportData) return;

    try {
      const loadingToast = toast.loading('Generating CSV...');
      let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
      csvContent += "UNIFLOW EVENTS - INVENTORY REPORT\n";
      csvContent += `Generated On,${new Date().toLocaleString()}\n\n`;
      
      csvContent += "EXECUTIVE SUMMARY\n";
      csvContent += `Total Items,${globalStats.totalItems}\n`;
      csvContent += `Total Stock,${globalStats.totalStock}\n`;
      csvContent += `Low Stock Alerts,${globalStats.lowStockCount}\n`;
      csvContent += `Total Inventory Value (Rs.),${globalStats.totalValue.toFixed(2)}\n\n`;
      
      csvContent += "Item Name,Category,Stall,Price,Stock,Status\n";
      reportData.forEach(item => {
        csvContent += `"${item.name}","${item.category}","${item.stallNumber}",${item.price},${item.stockCount},${item.stockCount <= 5 ? 'Low Stock' : 'In Stock'}\n`;
      });
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.dismiss(loadingToast);
      toast.success('CSV downloaded');
    } catch (err) {
      toast.error('CSV failed');
    }
  };

  const generatePDFReport = async () => {
    const reportData = await fetchFullReportData();
    if (!reportData) return;

    try {
      const loadingToast = toast.loading('Generating PDF...');
      const doc = new jsPDF();
      const margin = 14;
      const pageWidth = doc.internal.pageSize.getWidth();
      const primaryColor = [245, 158, 11]; // Amber-500

      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text("UNIFLOW INVENTORY", margin, 25);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, 25, { align: 'right' });

      // Summary
      doc.setFontSize(12);
      doc.text(`Total Value: Rs. ${globalStats.totalValue.toFixed(2)} | Total Items: ${globalStats.totalItems}`, margin, 50);

      const cols = [
        { title: "Item Name", w: 50, x: margin },
        { title: "Category", w: 30, x: margin + 50 },
        { title: "Stall", w: 45, x: margin + 80 },
        { title: "Price", w: 20, x: margin + 125 },
        { title: "Stock", w: 15, x: margin + 145 },
        { title: "Status", w: 25, x: margin + 160 }
      ];

      let yPos = 65;
      doc.setFillColor(...primaryColor);
      doc.rect(margin, yPos, pageWidth - (margin * 2), 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      cols.forEach(c => doc.text(c.title, c.x + 2, yPos + 7));
      yPos += 10;

      doc.setTextColor(31, 41, 55);
      reportData.forEach((item, i) => {
        const itemName = doc.splitTextToSize(item.name, cols[0].w - 4);
        const stallName = doc.splitTextToSize(item.stallNumber || 'General', cols[2].w - 4);
        const rowHeight = Math.max(10, itemName.length * 5, stallName.length * 5);

        if (yPos + rowHeight > 280) { doc.addPage(); yPos = 20; }
        if (i % 2 === 0) { doc.setFillColor(249, 250, 251); doc.rect(margin, yPos, pageWidth - (margin * 2), rowHeight, 'F'); }
        
        doc.text(itemName, cols[0].x + 2, yPos + 6);
        doc.text(item.category, cols[1].x + 2, yPos + 6);
        doc.text(stallName, cols[2].x + 2, yPos + 6);
        doc.text(String(item.price), cols[3].x + 2, yPos + 6);
        doc.text(String(item.stockCount), cols[4].x + 2, yPos + 6);
        
        if (item.stockCount <= 5) {
          doc.setTextColor(220, 38, 38);
          doc.text("LOW", cols[5].x + 2, yPos + 6);
          doc.setTextColor(31, 41, 55);
        } else {
          doc.text("OK", cols[5].x + 2, yPos + 6);
        }
        yPos += rowHeight;
      });

      doc.save("Inventory_Report.pdf");
      toast.dismiss(loadingToast);
      toast.success('PDF downloaded');
    } catch (err) {
      toast.error('PDF failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />
      <main className="pt-24 px-4 w-full max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-black text-gray-900">Inventory Management</h1>
          <div className="flex items-center gap-2">
            <button onClick={generateCSVReport} className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl shadow-sm"><FileSpreadsheet size={20} /></button>
            <button onClick={generatePDFReport} className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl shadow-sm"><FileText size={20} /></button>
            <button onClick={() => setShowAddModal(true)} className="bg-amber-500 hover:bg-amber-400 text-gray-900 px-6 py-3 rounded-xl font-bold shadow-sm">+ Add Item</button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Items', val: globalStats.totalItems, color: 'blue' },
            { label: 'Total Stock', val: globalStats.totalStock, color: 'amber' },
            { label: 'Low Stock', val: globalStats.lowStockCount, color: 'red' },
            { label: 'Total Value', val: `Rs. ${globalStats.totalValue.toLocaleString()}`, color: 'emerald' }
          ].map((s, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase">{s.label}</p>
              <p className={`text-xl font-black mt-1 text-${s.color}-600`}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input type="text" placeholder="Search items..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm outline-none focus:ring-2 focus:ring-amber-500" />
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm outline-none">
            <option>All Categories</option><option>Meals</option><option>Snacks</option><option>Beverages</option>
          </select>
          <select value={stallFilter} onChange={e => setStallFilter(e.target.value)} className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm outline-none">
            <option>All Stalls</option><option>Stall 1</option><option>Stall 2</option><option>Stall 3</option><option>Stall 4</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-700">
                <th className="p-4 font-bold">Item</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Stall</th>
                <th className="p-4 font-bold">Price</th>
                <th className="p-4 font-bold">Stock</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400">Loading inventory...</td></tr>
              ) : menuItems.map(item => (
                <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 flex items-center gap-3">
                    <img src={item.image?.startsWith('/uploads') ? `http://localhost:5002${item.image}` : item.image || 'https://placehold.co/100x100?text=Food'} className="w-10 h-10 rounded-lg object-cover" alt="" />
                    <span className="font-bold">{item.name}</span>
                  </td>
                  <td className="p-4 text-gray-600">{item.category}</td>
                  <td className="p-4 text-xs font-bold text-amber-700 uppercase bg-amber-50 px-2 py-1 rounded inline-block mt-4">{item.stallNumber}</td>
                  <td className="p-4">
                    <input type="number" value={item.price} onChange={e => handleInlineUpdate(item._id, 'price', e.target.value)} className="w-20 border border-gray-200 rounded px-2 py-1 font-bold" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <input type="number" value={item.stockCount} onChange={e => handleInlineUpdate(item._id, 'stockCount', e.target.value)} className={`w-16 border rounded px-2 py-1 font-bold ${item.stockCount <= 5 ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200'}`} />
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => { setEditingItem(item); setShowEditModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit3 size={18} /></button>
                      <button onClick={() => handleDelete(item._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 flex justify-center items-center gap-4 bg-gray-50 border-t border-gray-200">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 disabled:opacity-30"><ChevronLeft /></button>
              <span className="font-bold text-sm text-gray-600">Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-2 disabled:opacity-30"><ChevronRight /></button>
            </div>
          )}
        </div>
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Create New Item</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <input required placeholder="Item Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-amber-500" />
              <div className="grid grid-cols-2 gap-4">
                <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2">
                  <option>Meals</option><option>Snacks</option><option>Beverages</option>
                </select>
                <select value={newItem.stallNumber} onChange={e => setNewItem({...newItem, stallNumber: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2">
                  <option>Stall 1 (Hot Meals)</option><option>Stall 2 (Quick Bites)</option><option>Stall 3 (Desserts & Sweets)</option><option>Stall 4 (Beverages Bar)</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <input type="number" required placeholder="Price" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2" />
                <input type="number" required placeholder="Stock" value={newItem.stockCount} onChange={e => setNewItem({...newItem, stockCount: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2" />
                <input type="number" required placeholder="EcoScore" value={newItem.ecoScore} onChange={e => setNewItem({...newItem, ecoScore: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2" />
              </div>
              <label className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                <Upload size={20} className="text-gray-400" />
                <span className="text-sm font-bold text-gray-500">Upload Item Image</span>
                <input type="file" className="hidden" onChange={e => handleFileUpload(e)} />
              </label>
              <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2 font-bold text-gray-500">Cancel</button>
                <button type="submit" className="bg-amber-500 text-gray-900 px-6 py-2 rounded-xl font-bold">Add to Menu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Edit Item Details</h2>
            <form onSubmit={handleEditItem} className="space-y-4">
              <input required placeholder="Item Name" value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-amber-500" />
              <div className="grid grid-cols-2 gap-4">
                <select value={editingItem.category} onChange={e => setEditingItem({...editingItem, category: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2">
                  <option>Meals</option><option>Snacks</option><option>Beverages</option>
                </select>
                <select value={editingItem.stallNumber} onChange={e => setEditingItem({...editingItem, stallNumber: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2">
                  <option>Stall 1 (Hot Meals)</option><option>Stall 2 (Quick Bites)</option><option>Stall 3 (Desserts & Sweets)</option><option>Stall 4 (Beverages Bar)</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <input type="number" required placeholder="Price" value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2" />
                <input type="number" required placeholder="Stock" value={editingItem.stockCount} onChange={e => setEditingItem({...editingItem, stockCount: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2" />
                <input type="number" required placeholder="EcoScore" value={editingItem.ecoScore} onChange={e => setEditingItem({...editingItem, ecoScore: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2" />
              </div>
              <label className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                <img src={editingItem.image?.startsWith('/uploads') ? `http://localhost:5002${editingItem.image}` : editingItem.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                <span className="text-sm font-bold text-gray-500">Change Item Image</span>
                <input type="file" className="hidden" onChange={e => handleFileUpload(e, true)} />
              </label>
              <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-2 font-bold text-gray-500">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminInventoryDashboard;
