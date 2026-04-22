import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';

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
  const [newItem, setNewItem] = useState({ name: '', category: 'Meals', price: '', stockCount: '', ecoScore: '', stallNumber: 'Stall 1 (Hot Meals)', image: '' });

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
      setNewItem({ name: '', category: 'Meals', price: '', stockCount: '', ecoScore: '', stallNumber: 'Stall 1 (Hot Meals)', image: '' });
    } catch (err) {
      alert('Failed to physically insert new Menu Item.');
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || item.category === categoryFilter;
    const matchesStall = stallFilter === 'All Stalls' || (item.stallNumber && item.stallNumber.includes(stallFilter));
    return matchesSearch && matchesCategory && matchesStall;
  });

  const generateCSVReport = async () => {
    try {
      const loadingToast = toast.loading('Generating Excel-ready CSV...');
      
      let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
      
      csvContent += "UNIFLOW EVENTS - INVENTORY DASHBOARD REPORT\n";
      csvContent += `Generated On,${new Date().toLocaleString()}\n\n`;
      
      const totalStock = filteredItems.reduce((acc, item) => acc + Number(item.stockCount), 0);
      const totalValue = filteredItems.reduce((acc, item) => acc + (Number(item.price) * Number(item.stockCount)), 0);
      const lowStockCount = filteredItems.filter(i => i.stockCount <= 5).length;

      csvContent += "EXECUTIVE SUMMARY\n";
      csvContent += `Total Unique Items,${filteredItems.length}\n`;
      csvContent += `Total Stock Quantity,${totalStock}\n`;
      csvContent += `Low Stock Alerts,${lowStockCount}\n`;
      csvContent += `Estimated Inventory Value (Rs.),${totalValue.toFixed(2)}\n\n`;
      
      csvContent += "DETAILED INVENTORY LOG\n";
      csvContent += "Item Name,Category,Stall,Eco-Score,Price (Rs.),Stock Quantity,Inventory Value (Rs.),Status\n";
      
      filteredItems.forEach(item => {
        const safeName = item.name.replace(/"/g, '""');
        const status = item.stockCount <= 5 ? 'Low Stock' : 'In Stock';
        const value = (item.price * item.stockCount).toFixed(2);
        
        const row = [
          `"${safeName}"`,
          `"${item.category}"`,
          `"${item.stallNumber || 'General'}"`,
          item.ecoScore,
          item.price,
          item.stockCount,
          value,
          status
        ];
        csvContent += row.join(",") + "\n";
      });
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `UniFlow_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.dismiss(loadingToast);
      toast.success('Excel/CSV Report downloaded!');
    } catch (err) {
      console.error('Failed to generate CSV report:', err);
      toast.error('Failed to generate CSV report.');
    }
  };

  const generatePDFReport = () => {
    try {
      const loadingToast = toast.loading('Generating Professional PDF report...');
      const doc = new jsPDF();
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      
      const primaryColor = [245, 158, 11]; // Amber-500
      const secondaryColor = [254, 243, 199]; // Amber-50
      const textColor = [31, 41, 55];
      const lightTextColor = [107, 114, 128];
      
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text("UNIFLOW", margin, 20);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text("Admin Inventory Report", margin, 28);
      
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, 28, { align: 'right' });
      
      doc.setTextColor(...textColor);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("Executive Summary", margin, 55);
      
      const boxWidth = (pageWidth - (margin * 2) - 10) / 2;
      
      const totalStock = filteredItems.reduce((acc, item) => acc + Number(item.stockCount), 0);
      const totalValue = filteredItems.reduce((acc, item) => acc + (Number(item.price) * Number(item.stockCount)), 0);

      doc.setFillColor(...secondaryColor);
      doc.rect(margin, 60, boxWidth, 25, 'F');
      doc.setFontSize(10);
      doc.setTextColor(...lightTextColor);
      doc.text("Estimated Inventory Value", margin + 5, 70);
      doc.setFontSize(16);
      doc.setTextColor(217, 119, 6);
      doc.setFont('helvetica', 'bold');
      doc.text(`Rs. ${totalValue.toFixed(2)}`, margin + 5, 80);
      
      doc.setFillColor(...secondaryColor);
      doc.rect(margin + boxWidth + 10, 60, boxWidth, 25, 'F');
      doc.setFontSize(10);
      doc.setTextColor(...lightTextColor);
      doc.text("Total Items / Stock Units", margin + boxWidth + 15, 70);
      doc.setFontSize(16);
      doc.setTextColor(217, 119, 6);
      doc.setFont('helvetica', 'bold');
      doc.text(`${filteredItems.length} Items / ${totalStock} Units`, margin + boxWidth + 15, 80);
      
      let yPos = 100;
      doc.setFontSize(14);
      doc.setTextColor(...textColor);
      doc.text("Detailed Inventory Log", margin, yPos);
      yPos += 8;
      
      const cols = [
        { title: "Item Name", w: 45, x: margin },
        { title: "Category", w: 22, x: margin + 45 },
        { title: "Stall", w: 45, x: margin + 67 },
        { title: "Price", w: 23, x: margin + 112 },
        { title: "Stock", w: 18, x: margin + 135 },
        { title: "Status", w: 25, x: margin + 153 }
      ];
      
      doc.setFillColor(...primaryColor);
      doc.rect(margin, yPos, pageWidth - (margin * 2), 10, 'F');
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      cols.forEach(col => {
         doc.text(col.title, col.x + 2, yPos + 7);
      });
      yPos += 10;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      
      filteredItems.forEach((item, index) => {
        const itemName = doc.splitTextToSize(item.name, cols[0].w - 4);
        const stallName = doc.splitTextToSize(item.stallNumber || 'General', cols[2].w - 4);
        const rowHeight = Math.max(12, itemName.length * 5 + 4, stallName.length * 5 + 4);
        
        if (yPos + rowHeight > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
            
            doc.setFillColor(...primaryColor);
            doc.rect(margin, yPos, pageWidth - (margin * 2), 10, 'F');
            doc.setTextColor(31, 41, 55);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            cols.forEach(col => {
               doc.text(col.title, col.x + 2, yPos + 7);
            });
            yPos += 10;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...textColor);
        }
        
        if (index % 2 === 0) {
            doc.setFillColor(249, 250, 251);
            doc.rect(margin, yPos, pageWidth - (margin * 2), rowHeight, 'F');
        }
        
        doc.setDrawColor(229, 231, 235);
        doc.line(margin, yPos + rowHeight, pageWidth - margin, yPos + rowHeight);
        
        doc.text(itemName, cols[0].x + 2, yPos + 6);
        doc.text(item.category, cols[1].x + 2, yPos + 6);
        doc.text(stallName, cols[2].x + 2, yPos + 6);
        doc.setFont('helvetica', 'bold');
        doc.text(`Rs. ${item.price}`, cols[3].x + 2, yPos + 6);
        doc.setFont('helvetica', 'normal');
        doc.text(String(item.stockCount), cols[4].x + 2, yPos + 6);
        
        if(item.stockCount <= 5) {
            doc.setTextColor(220, 38, 38);
            doc.setFont('helvetica', 'bold');
            doc.text("LOW STOCK", cols[5].x + 2, yPos + 6);
        } else {
            doc.setTextColor(5, 150, 105);
            doc.text("In Stock", cols[5].x + 2, yPos + 6);
        }
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'normal');
        
        yPos += rowHeight;
      });
      
      const totalPages = doc.internal.getNumberOfPages();
      for(let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(...lightTextColor);
          doc.text(`Page ${i} of ${totalPages} - UniFlow Events`, pageWidth / 2, pageHeight - 8, { align: 'center' });
      }

      doc.save(`Professional_Inventory_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.dismiss(loadingToast);
      toast.success('Professional PDF Report downloaded!');
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      toast.error('Failed to generate PDF.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />
      <main className="pt-24 px-4 w-full max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black text-gray-900">Inventory Management</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={generateCSVReport}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 active:scale-95"
              title="Download Excel/CSV"
            >
              <FileSpreadsheet size={20} />
              CSV
            </button>
            <button
              onClick={generatePDFReport}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 active:scale-95"
              title="Download PDF"
            >
              <FileText size={20} />
              PDF
            </button>
            <button onClick={() => setShowModal(true)} className="bg-amber-500 hover:bg-amber-400 text-gray-900 px-6 py-3 rounded-xl font-bold shadow-sm transition-colors ml-2">
              + Add New Menu Item
            </button>
          </div>
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
                  filteredItems.map((item) => (
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
