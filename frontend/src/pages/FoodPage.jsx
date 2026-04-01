import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import GaugeChart from 'react-gauge-chart';
import { useAuth } from '../context/AuthContext';

export function FoodPage() {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [pickupSlot, setPickupSlot] = useState('');
  const [orderStatus, setOrderStatus] = useState(null); // 'idle', 'loading', 'success', 'error'
  const [qrString, setQrString] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [rewardEligible, setRewardEligible] = useState(false);
  const [orderedItems, setOrderedItems] = useState([]);
  const [ecoVoucher, setEcoVoucher] = useState(false);
  const [activeVouchers, setActiveVouchers] = useState([]);

  useEffect(() => {
    const fetchLatestUser = async () => {
      try {
        const token = localStorage.getItem('uniflow_auth') ? JSON.parse(localStorage.getItem('uniflow_auth')).token : null;
        if (token) {
          const res = await axios.get('http://localhost:5001/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
          if (res.data && res.data.user && res.data.user.activeVouchers) {
             setActiveVouchers(res.data.user.activeVouchers);
          }
        }
      } catch (err) {
        console.error('Failed to fetch latest user vouchers:', err);
      }
    };
    fetchLatestUser();
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/food/menu');
        setMenuItems(res.data);
      } catch (err) {
        console.error('Failed to fetch menu:', err);
      }
    };
    fetchMenu();
  }, []);

  const addToCart = async (item) => {
    if (item.stockCount <= 0) return;
    const existing = cart.find((i) => i._id === item._id);
    if (existing && existing.quantity >= item.stockCount) return;

    try {
      const token = localStorage.getItem('uniflow_auth') ? JSON.parse(localStorage.getItem('uniflow_auth')).token : null;
      await axios.post('http://localhost:5001/api/food/lock', {
        ticketId: localStorage.getItem('eventTicketId'),
        menuItemId: item._id,
        quantity: 1
      }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      
      setCart((prev) => {
        const ex = prev.find((i) => i._id === item._id);
        if (ex) {
          return prev.map((i) => (i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i));
        }
        return [...prev, { ...item, quantity: 1 }];
      });
    } catch (err) {
      alert(err.response?.data?.msg || 'Could not reserve item due to stock limits!');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const token = localStorage.getItem('uniflow_auth') ? JSON.parse(localStorage.getItem('uniflow_auth')).token : null;
      await axios.delete('http://localhost:5001/api/food/lock', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        data: { ticketId: localStorage.getItem('eventTicketId'), menuItemId: itemId }
      });
      setCart((prev) => prev.filter((i) => i._id !== itemId));
    } catch (err) {
      console.error(err);
    }
  };

  const hasLoyaltyReward = activeVouchers.includes('5_EVENT_SNACK_REWARD');

  let baseTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let loyaltyDiscount = 0;
  let discountUsed = false;
  
  const visualCart = cart.map(item => {
      let itemDiscount = 0;
      if (hasLoyaltyReward && !discountUsed && (item.name === 'Caramel Popcorn' || item.name === 'Iced Lemon Tea') && item.quantity > 0) {
          loyaltyDiscount = item.price; 
          itemDiscount = item.price;
          discountUsed = true;
      }
      return { ...item, itemDiscount };
  });

  const total = baseTotal - loyaltyDiscount;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const avgEcoScore = totalItems === 0 ? 0 : Math.round(cart.reduce((sum, item) => sum + item.ecoScore * item.quantity, 0) / totalItems);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!pickupSlot) {
      setErrorMessage('Please select a pickup slot');
      return;
    }

    setOrderStatus('loading');
    setErrorMessage('');
    
    try {
      const ticketId = localStorage.getItem('eventTicketId');
      const token = localStorage.getItem('uniflow_auth') ? JSON.parse(localStorage.getItem('uniflow_auth')).token : null;
      
      const res = await axios.post(
        'http://localhost:5001/api/food',
        {
          ticketId,
          items: cart.map(i => ({ menuItem: i._id, name: i.name, quantity: i.quantity, price: i.price, stallNumber: i.stallNumber })),
          totalAmount: total,
          pickupSlot,
          event: localStorage.getItem('eventId') || undefined
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      
      setQrString(res.data.qrString);
      setOrderedItems(cart);
      setRewardEligible(total > 2000);
      setEcoVoucher(avgEcoScore === 100);
      
      if (discountUsed) {
        setActiveVouchers(prev => prev.filter(v => v !== '5_EVENT_SNACK_REWARD'));
      }
      
      setOrderStatus('success');
      setCart([]);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.msg || 'Failed to place order.');
      setOrderStatus('error');
    }
  };

  if (orderStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-24 px-4 pb-16 flex flex-col items-center justify-center text-center">
          <div className="bg-green-50 p-8 rounded-2xl shadow-sm border border-green-100 max-w-md w-full">
            <h2 className="text-3xl font-bold text-green-700 mb-4">Order Successful!</h2>
            <p className="text-gray-700 mb-6 font-medium text-lg">Present this QR code at your selected pickup slot ({pickupSlot}).</p>
            <div className="bg-white p-4 rounded-xl shadow-inner inline-block mb-6">
              <QRCodeSVG value={qrString} size={200} />
            </div>

            <div className="text-left bg-white p-5 rounded-xl shadow-sm border border-gray-100 w-full mb-6">
              <h3 className="font-bold text-gray-900 border-b pb-2 mb-3">Food Court Pickup Instructions:</h3>
              <ul className="space-y-3">
                {Array.from(new Set(orderedItems.map(i => i.stallNumber))).map(stall => (
                  <li key={stall} className="text-gray-800 font-medium text-sm">
                    <span className="font-black text-amber-600 mr-1">* {stall}:</span>
                    {orderedItems.filter(i => i.stallNumber === stall).map(i => `${i.quantity}x ${i.name}`).join(', ')} 
                    <span className="text-gray-500 italic ml-1">(Pickup: {pickupSlot})</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {rewardEligible && (
              <div className="mt-4 bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded-lg flex items-center gap-3 shadow-sm">
                <span className="text-2xl">🎉</span>
                <div className="text-left">
                  <p className="font-bold">Post-Event Free Item Reward Token!</p>
                  <p className="text-sm">You qualified since your order is over Rs. 2000.</p>
                </div>
              </div>
            )}

            {ecoVoucher && (
              <div className="mt-4 bg-gradient-to-r from-emerald-100 to-teal-100 border border-teal-300 text-teal-800 p-4 rounded-lg shadow-sm">
                <div className="text-left flex items-start gap-3">
                  <span className="text-2xl mt-1">🌱</span>
                  <div>
                    <p className="font-black text-lg">Free Healthy Meal Voucher</p>
                    <p className="text-sm font-medium">Thank you for completely prioritizing high Eco-Score items (100%). Your voucher is securely embedded in this QR string!</p>
                  </div>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => { 
                setOrderStatus('idle'); 
                setQrString(''); 
                setRewardEligible(false);
                setEcoVoucher(false);
              }}
              className="mt-8 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
            >
              Back to Menu
            </button>
          </div>
        </main>
      </div>
    );
  }

  const snacks = menuItems.filter(i => i.category === 'Snacks');
  const meals = menuItems.filter(i => i.category === 'Meals');
  const beverages = menuItems.filter(i => i.category === 'Beverages');

  const renderCategory = (title, items) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <div key={item._id} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">
                {item.image && (
                  <div className="h-48 -mx-4 -mt-4 mb-4 overflow-hidden bg-gray-100 rounded-t-2xl">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                  </div>
                )}
                <h3 className="font-bold text-xl text-gray-900">{item.name}</h3>
                <p className="text-xs font-bold text-amber-600 mt-1">{item.stallNumber}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-bold">Eco Score: {item.ecoScore}/100</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.stockCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                    {item.stockCount} in stock
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="font-extrabold text-2xl text-amber-500">Rs. {item.price.toFixed(2)}</span>
                <button
                  onClick={() => addToCart(item)}
                  disabled={item.stockCount === 0}
                  className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                    item.stockCount === 0 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-amber-400 hover:bg-amber-500 text-gray-900'
                  }`}
                >
                  {item.stockCount === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 px-4 pb-16">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <h1 className="text-3xl font-black text-gray-900 mb-6">Food Dashboard</h1>
            
            {hasLoyaltyReward && (
              <div className="mb-8 bg-gradient-to-r from-amber-400 to-orange-500 text-white p-5 rounded-2xl shadow-lg flex items-center gap-4">
                <span className="text-5xl">🎉</span>
                <div>
                  <h3 className="font-black text-2xl drop-shadow-sm">5-Event Loyalty Reward Unlocked!</h3>
                  <p className="font-semibold text-amber-50 mt-1">Add a <strong className="text-white bg-amber-600 px-2 py-0.5 rounded">Caramel Popcorn</strong> or <strong className="text-white bg-amber-600 px-2 py-0.5 rounded">Iced Lemon Tea</strong> to your cart to claim your FREE reward!</p>
                </div>
              </div>
            )}

            {menuItems.length === 0 ? (
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <p className="text-gray-500 text-lg">Loading menu or menu is empty...</p>
              </div>
            ) : (
              <>
                {renderCategory('Snacks', snacks)}
                {renderCategory('Meals', meals)}
                {renderCategory('Beverages', beverages)}
              </>
            )}
          </div>
          
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Your Cart</h2>
              {cart.length === 0 ? (
                <p className="text-gray-500 py-4 text-center">Your cart is empty.</p>
              ) : (
                <div className="space-y-4 mb-6">
                  {visualCart.map(item => (
                    <div key={item._id} className="flex justify-between items-center border-b border-gray-50 pb-3">
                      <div>
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500 font-medium">Qty: {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {item.itemDiscount > 0 ? (
                           <div className="text-right">
                             <p className="font-bold text-gray-400 line-through text-sm">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                             <p className="font-black text-green-600">Rs. {((item.price * item.quantity) - item.itemDiscount).toFixed(2)}</p>
                           </div>
                        ) : (
                           <span className="font-bold text-gray-900">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                        )}
                        <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-700 text-sm font-bold bg-red-50 px-2 py-1 rounded-md">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="pt-2 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-lg text-gray-700">Total:</span>
                  <span className="font-black text-3xl text-gray-900">Rs. {total.toFixed(2)}</span>
                </div>

                {cart.length > 0 && (
                  <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 text-center mb-2 text-sm uppercase tracking-wide">Cart Eco-Score</h3>
                    <GaugeChart id="eco-gauge" 
                      nrOfLevels={20} 
                      colors={["#FF5F6D", "#FFC371", "#00b09b"]} 
                      arcWidth={0.3} 
                      percent={avgEcoScore / 100} 
                      textColor="#374151"
                      animate={true}
                      formatTextValue={value => avgEcoScore === 100 ? '100% ECO!' : `${value}%`}
                    />
                    {avgEcoScore === 100 && (
                      <div className="mt-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white p-3 rounded-lg text-center shadow-md animate-pulse">
                        <p className="font-black text-sm">🌿 100% Eco-Score Achieved</p>
                        <p className="text-xs font-semibold opacity-90">Free Healthy Meal unlocked at checkout!</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Scheduled Pickup Slot</label>
                  <select 
                    value={pickupSlot} 
                    onChange={(e) => setPickupSlot(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg p-3 font-medium focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900"
                  >
                    <option value="">Select a time...</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="12:30 PM">12:30 PM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="1:30 PM">1:30 PM</option>
                  </select>
                </div>
                
                {errorMessage && (
                  <p className="text-red-500 text-sm mb-4 font-bold bg-red-50 p-2 rounded-md border border-red-100">{errorMessage}</p>
                )}
                
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || orderStatus === 'loading'}
                  className="w-full bg-gray-900 text-white font-bold py-4 px-4 rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
                >
                  {orderStatus === 'loading' ? 'Processing...' : 'Complete Checkout'}
                </button>
                {total > 2000 && (
                 <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                  <p className="text-xs text-green-700 font-bold">✨ You qualify for a post-event Free Item Reward Token!</p>
                 </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default FoodPage;
