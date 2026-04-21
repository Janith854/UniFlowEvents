import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { getMenu, addCartLock, removeCartLock, createFoodOrder } from '../services/foodService';
import { getMe } from '../services/authService';
import toast from 'react-hot-toast';
import { PaymentModal } from '../components/PaymentModal';
import { QRCodeCanvas } from 'qrcode.react';
import GaugeChart from 'react-gauge-chart';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuth } from '../context/AuthContext';

const MAX_QTY_PER_ITEM = 10;
const MIN_ORDER_AMOUNT = 100;

export function FoodPage() {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('uniflow_food_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [pickupSlot, setPickupSlot] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [orderStatus, setOrderStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrString, setQrString] = useState('');
  const [rewardEligible, setRewardEligible] = useState(false);
  const [orderedItems, setOrderedItems] = useState([]);
  const [ecoVoucher, setEcoVoucher] = useState(false);
  const [activeVouchers, setActiveVouchers] = useState([]);
  const passRef = useRef();
  const qrRef = useRef();
  const ticketId = localStorage.getItem('eventTicketId');
  const eventId = localStorage.getItem('eventId');
  const hasTicket = Boolean(ticketId);

  useEffect(() => {
    localStorage.setItem('uniflow_food_cart', JSON.stringify(cart));
  }, [cart]);

  // Cleanup orphaned locks if user leaves page
  useEffect(() => {
    return () => {
      cart.forEach(item => {
        removeCartLock({
          ticketId: localStorage.getItem('eventTicketId'),
          menuItemId: item._id
        }).catch(console.error);
      });
    };
  }, [cart]);

  useEffect(() => {
    const fetchLatestUser = async () => {
      try {
        const token = localStorage.getItem('uniflow_auth');
        if (token) {
          const res = await getMe();
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
        const res = await getMenu();
        setMenuItems(res.data);
      } catch (err) {
        console.error('Failed to fetch menu:', err);
      }
    };
    fetchMenu();
  }, []);

  const downloadOrderPass = async (orderData) => {
    try {
      const { qr, pickup, items } = orderData;

      // Create an off-screen container with fixed dimensions and inline styles
      const container = document.createElement('div');
      container.style.cssText = `
        position: fixed; top: -9999px; left: -9999px;
        width: 480px; padding: 48px;
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 24px;
        font-family: Inter, system-ui, sans-serif;
        display: flex; flex-direction: column; align-items: center;
        text-align: center; box-sizing: border-box;
      `;
      document.body.appendChild(container);

      // Header
      const h2 = document.createElement('h2');
      h2.textContent = '🎉 Order Successful!';
      h2.style.cssText = 'font-size: 28px; font-weight: 900; color: #15803d; margin: 0 0 12px 0;';
      container.appendChild(h2);

      const subtitle = document.createElement('p');
      subtitle.textContent = `Present this QR code at your selected pickup slot (${pickup}).`;
      subtitle.style.cssText = 'font-size: 15px; color: #374151; margin: 0 0 24px 0; font-weight: 500;';
      container.appendChild(subtitle);

      // QR code: extract from on-screen canvas via qrRef
      const qrWrapper = document.createElement('div');
      qrWrapper.style.cssText = 'background: #ffffff; padding: 20px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 24px; display: inline-block;';
      container.appendChild(qrWrapper);

      // Get QR image from the rendered canvas on screen
      const onScreenQRCanvas = qrRef.current?.querySelector?.('canvas') || qrRef.current;
      if (onScreenQRCanvas && onScreenQRCanvas.toDataURL) {
        const qrImg = document.createElement('img');
        qrImg.src = onScreenQRCanvas.toDataURL('image/png');
        qrImg.style.cssText = 'width: 200px; height: 200px; display: block;';
        qrWrapper.appendChild(qrImg);
      }

      // Stall instructions
      const instructionBox = document.createElement('div');
      instructionBox.style.cssText = 'width: 100%; background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 16px 20px; text-align: left; margin-top: 8px;';
      const stallTitle = document.createElement('h3');
      stallTitle.textContent = 'Food Court Pickup Instructions:';
      stallTitle.style.cssText = 'font-size: 14px; font-weight: 700; color: #111827; margin: 0 0 10px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;';
      instructionBox.appendChild(stallTitle);

      const stalls = [...new Set(items.map(i => i.stallNumber))];
      stalls.forEach(stall => {
        const stallItems = items.filter(i => i.stallNumber === stall);
        const li = document.createElement('p');
        li.innerHTML = `<strong style="color:#d97706;">* ${stall}:</strong> ${stallItems.map(i => `${i.quantity}x ${i.name}`).join(', ')} <em style="color:#9ca3af;">(Pickup: ${pickup})</em>`;
        li.style.cssText = 'font-size: 13px; color: #1f2937; margin: 6px 0;';
        instructionBox.appendChild(li);
      });
      container.appendChild(instructionBox);

      // Footer branding
      const footer = document.createElement('p');
      footer.textContent = '🌐 UniFlow Events';
      footer.style.cssText = 'font-size: 12px; color: #9ca3af; margin-top: 20px; font-weight: 600;';
      container.appendChild(footer);

      // Capture
      const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#f0fdf4' });
      document.body.removeChild(container);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgH = (canvas.height * pdfWidth) / canvas.width;
      const marginTop = (pdf.internal.pageSize.getHeight() - imgH) / 2;
      pdf.addImage(imgData, 'PNG', 0, Math.max(0, marginTop), pdfWidth, imgH);
      pdf.save(`UniFlow_FoodPass_${Date.now()}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF pass:', err);
    }
  };

  useEffect(() => {
    if (orderStatus === 'success' && qrString && orderedItems.length > 0) {
      const timer = setTimeout(() => {
        downloadOrderPass({ qr: qrString, pickup: pickupSlot, items: orderedItems });
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [orderStatus]);

  const addToCart = async (item) => {
    if (!hasTicket) {
      setErrorMessage('Please register for an event before ordering food.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    if (item.stockCount <= 0) return;
    const existing = cart.find((i) => i._id === item._id);
    const currentQty = existing ? existing.quantity : 0;

    // ── Frontend: enforce per-item quantity cap ──
    if (currentQty >= MAX_QTY_PER_ITEM) {
      toast.error(`Maximum ${MAX_QTY_PER_ITEM} of "${item.name}" per order.`);
      return;
    }
    if (currentQty >= item.stockCount) {
      toast.error(`Only ${item.stockCount} left in stock for "${item.name}".`);
      return;
    }

    try {
      await addCartLock({
        ticketId: localStorage.getItem('eventTicketId'),
        menuItemId: item._id,
        quantity: 1
      });
      
      setCart((prev) => {
        const ex = prev.find((i) => i._id === item._id);
        if (ex) {
          return prev.map((i) => (i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i));
        }
        return [...prev, { ...item, quantity: 1 }];
      });
      toast.success(`Added ${item.name}`);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not reserve item due to stock limits!');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await removeCartLock({
        ticketId: localStorage.getItem('eventTicketId'),
        menuItemId: itemId
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
    if (!hasTicket) {
      setErrorMessage('Please register for an event before checking out.');
      return;
    }
    // ── Frontend guards ──────────────────────────────────────────────────────
    if (cart.length === 0) {
      toast.error('Your cart is empty. Add at least one item before checking out.');
      return;
    }
    if (!pickupSlot) {
      toast.error('Please select a pickup time slot before placing your order.');
      return;
    }
    if (total < MIN_ORDER_AMOUNT) {
      toast.error(`Minimum order amount is Rs. ${MIN_ORDER_AMOUNT}. Current total: Rs. ${total.toFixed(2)}.`);
      return;
    }

    if (paymentMethod === 'Card') {
      setIsModalOpen(true);
      return;
    }

    // Cash on Pickup Flow
    setOrderStatus('loading');
    
    try {
      const ticketId = localStorage.getItem('eventTicketId');
      
      const res = await createFoodOrder({
        ticketId,
        items: cart.map(i => ({ menuItem: i._id, name: i.name, quantity: i.quantity, price: i.price, stallNumber: i.stallNumber })),
        totalAmount: total,
        pickupSlot,
        paymentMethod,
        event: localStorage.getItem('eventId') || undefined
      });
      
      setQrString(res.data.order ? res.data.order.qrString : res.data.qrString);
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
      const status = err.response?.status;
      const serverMsg = err.response?.data?.msg || 'Failed to place order.';
      if (status === 409) {
        toast.error('⚠️ ' + serverMsg);
      } else if (status === 400) {
        toast.error('❌ ' + serverMsg);
      } else {
        toast.error('Server error. Please try again.');
      }
      setOrderStatus('error');
    }
  };

  const handlePaymentConfirmed = async () => {
    try {
      const ticketId = localStorage.getItem('eventTicketId');
      const res = await createFoodOrder({
        ticketId,
        items: cart.map(i => ({ menuItem: i._id, name: i.name, quantity: i.quantity, price: i.price, stallNumber: i.stallNumber })),
        totalAmount: total,
        pickupSlot,
        paymentMethod,
        event: localStorage.getItem('eventId') || undefined
      });
      
      // Wait for PaymentModal's 2 second success animation before revealing the QR code
      setTimeout(() => {
        setQrString(res.data.qrString);
        setOrderedItems(cart);
        setRewardEligible(total > 2000);
        setEcoVoucher(avgEcoScore === 100);
        if (discountUsed) {
          setActiveVouchers(prev => prev.filter(v => v !== '5_EVENT_SNACK_REWARD'));
        }
        setOrderStatus('success');
        setCart([]);
        setIsModalOpen(false);
      }, 2000);
      
      return res.data;
    } catch (err) {
      const serverMsg = err.response?.data?.msg || 'Failed to place order.';
      toast.error(serverMsg);
      throw err;
    }
  };

  if (orderStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-24 px-4 pb-16 flex flex-col items-center justify-center text-center">
          <div ref={passRef} className="bg-green-50 p-8 rounded-2xl shadow-sm border border-green-100 max-w-md w-full">
            <h2 className="text-3xl font-bold text-green-700 mb-4">Order Successful!</h2>
            <p className="text-gray-700 mb-6 font-medium text-lg">Present this QR code at your selected pickup slot ({pickupSlot}).</p>
            <div ref={qrRef} className="bg-white p-4 rounded-xl shadow-inner inline-block mb-6">
              <QRCodeCanvas value={qrString} size={200} includeMargin={true} />
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
              className="mt-8 px-8 py-3 bg-amber-400 text-zinc-950 rounded-xl hover:bg-amber-300 transition-all font-black shadow-lg shadow-amber-200 active:scale-95"
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
          {items.map(item => {
            const currentQty = cart.find(c => c._id === item._id)?.quantity || 0;
            const maxAllowed = Math.min(MAX_QTY_PER_ITEM, item.stockCount);
            const maxReached = currentQty >= maxAllowed;
            const isAddDisabled = !hasTicket || item.stockCount === 0 || maxReached;
            const buttonLabel = !hasTicket
              ? 'Register for Event'
              : item.stockCount === 0
                ? 'Out of Stock'
                : maxReached
                  ? 'Max Reached'
                  : 'Add to Cart';

            return (
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
                    disabled={isAddDisabled}
                    className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                      isAddDisabled
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-amber-400 hover:bg-amber-500 text-gray-900'
                    }`}
                  >
                    {buttonLabel}
                  </button>
                </div>
              </div>
            );
          })}
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

            {!hasTicket && (
              <div className="mb-6 bg-amber-50 border border-amber-100 text-amber-700 p-4 rounded-2xl font-semibold">
                You need an event ticket before ordering food.{' '}
                <Link to="/events" className="underline font-black text-amber-600 hover:text-amber-700">
                  Browse events
                </Link>
                .
              </div>
            )}
            
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
              {!hasTicket && (
                <div className="mb-4 bg-amber-50 border border-amber-100 text-amber-700 p-3 rounded-xl text-sm font-semibold">
                  Register for an event to unlock food ordering.
                </div>
              )}
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
                        <button onClick={() => removeFromCart(item._id)} className="text-zinc-950 font-black bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg text-xs shadow-sm shadow-amber-200 transition-all active:scale-95">Remove</button>
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
                    disabled={!hasTicket}
                    className="w-full border-2 border-gray-200 rounded-lg p-3 font-medium focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="">Select a time...</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="12:30 PM">12:30 PM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="1:30 PM">1:30 PM</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Select Payment Method</label>
                  <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="Card">Pay by Card (Online)</option>
                    <option value="Cash">Cash on Pickup</option>
                  </select>
                </div>
                
                <button
                  onClick={handleCheckout}
                  disabled={!hasTicket || cart.length === 0 || orderStatus === 'loading'}
                  className="w-full bg-amber-400 text-zinc-950 font-black py-4 px-4 rounded-xl hover:bg-amber-300 disabled:bg-amber-200 disabled:cursor-not-allowed transition-all shadow-xl shadow-amber-200 active:scale-95 text-xl mt-4"
                >
                  {orderStatus === 'loading' ? 'Processing...' : 'Complete Checkout'}
                </button>
                {!hasTicket && (
                  <p className="text-xs text-amber-600 font-bold mt-2 text-center">
                    Register for an event to continue.
                  </p>
                )}
                {total > 0 && total < MIN_ORDER_AMOUNT && (
                  <p className="text-xs text-orange-600 font-bold mt-2 text-center">
                    ⚠️ Minimum order is Rs. {MIN_ORDER_AMOUNT}. Add Rs. {(MIN_ORDER_AMOUNT - total).toFixed(2)} more.
                  </p>
                )}
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

      <PaymentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handlePaymentConfirmed}
        reservationData={{
          slotNumber: 'Food Order',
          zone: 'Food Court'
        }}
        amount={total}
      />
    </div>
  );
}

export default FoodPage;
