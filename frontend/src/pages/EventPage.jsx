import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar as CalendarIcon, MapPin, Users, Clock, Tag, CreditCard, CheckCircle, Ticket as TicketIcon, X, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

export function EventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [ticketStatus, setTicketStatus] = useState(null);
  const [rewardMsg, setRewardMsg] = useState('');
  
  // Ticketing specific state
  const [selectedTier, setSelectedTier] = useState('regular'); // 'regular' | 'vip'
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Payment Form State (controlled + validated)
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvc: '' });
  const [cardTouched, setCardTouched] = useState({ number: false, name: false, expiry: false, cvc: false });

  // --- Card Validation Helpers ---
  const getCardNumberError = () => {
    const digits = cardDetails.number.replace(/\s/g, '');
    if (!digits) return '';
    if (!/^\d+$/.test(digits)) return 'Digits only.';
    if (digits.length !== 16) return 'Must be 16 digits.';
    return '';
  };
  const getExpiryError = () => {
    const { expiry } = cardDetails;
    if (!expiry) return '';
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return 'Use MM/YY format.';
    const [mm, yy] = expiry.split('/').map(Number);
    if (mm < 1 || mm > 12) return 'Month must be 01–12.';
    const now = new Date();
    const cy = now.getFullYear() % 100, cm = now.getMonth() + 1;
    if (yy < cy || (yy === cy && mm < cm)) return 'Card has expired.';
    return '';
  };
  const getCvcError = () => {
    const { cvc } = cardDetails;
    if (!cvc) return '';
    if (!/^\d+$/.test(cvc)) return 'Digits only.';
    if (cvc.length < 3) return 'Must be 3–4 digits.';
    return '';
  };
  const getNameError = () => {
    if (!cardDetails.name.trim()) return '';
    if (cardDetails.name.trim().length < 2) return 'Enter full name.';
    return '';
  };

  const cardNumberError = getCardNumberError();
  const expiryError = getExpiryError();
  const cvcError = getCvcError();
  const nameError = getNameError();

  const isCardValid =
    cardDetails.number.replace(/\s/g, '').length === 16 && !cardNumberError &&
    cardDetails.expiry.length === 5 && !expiryError &&
    cardDetails.cvc.length >= 3 && !cvcError &&
    cardDetails.name.trim().length >= 2 && !nameError;

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    if (name === 'number') {
      const clean = value.replace(/\s+/g, '').substring(0, 16);
      const fmt = clean.replace(/(.{4})/g, '$1 ').trim();
      setCardDetails(prev => ({ ...prev, number: fmt }));
    } else if (name === 'expiry') {
      const clean = value.replace(/\//g, '').substring(0, 4);
      const fmt = clean.length >= 2 ? `${clean.substring(0, 2)}/${clean.substring(2)}` : clean;
      setCardDetails(prev => ({ ...prev, expiry: fmt }));
    } else if (name === 'cvc') {
      setCardDetails(prev => ({ ...prev, cvc: value.replace(/\D/g, '').substring(0, 4) }));
    } else {
      setCardDetails(prev => ({ ...prev, [name]: value }));
    }
  };
  const handleCardBlur = (e) => setCardTouched(prev => ({ ...prev, [e.target.name]: true }));

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5002/api/events/${id}`);
      setEvent(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationClick = () => {
    const token = localStorage.getItem('uniflow_auth');
    if (!token) {
       alert("Please login first to register for events.");
       navigate('/login');
       return;
    }
    
    // Check if free or paid
    const isFree = !event.ticketing || (event.ticketing.regularPrice === 0 && event.ticketing.vipPrice === 0);
    
    if (isFree) {
      generateTicket();
    } else {
      setShowPaymentModal(true);
    }
  };

  const processPayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate payment delay
    setTimeout(() => {
      setIsProcessing(false);
      setShowPaymentModal(false);
      generateTicket();
    }, 1500);
  };

  const generateTicket = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('uniflow_auth'))?.token;
      
      const res = await axios.post(`http://localhost:5002/api/events/${id}/ticket`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      localStorage.setItem('eventTicketId', res.data.ticketId);
      localStorage.setItem('eventId', id);
      
      setTicketStatus(res.data);
      if (res.data.rewardIssued) {
         setRewardMsg("🎉 5-Event Loyalty Reward Unlocked! A free snack voucher has been heavily deposited into your account!");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Could not generate ticket');
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-400 border-t-transparent"></div>
    </div>
  );
  
  if (error || !event) return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4 text-center">
      <Navbar />
      <h2 className="text-2xl font-bold text-gray-900">{error || 'Event not found'}</h2>
      <button onClick={() => navigate('/events')} className="mt-4 text-amber-500 font-bold">← Back to Events</button>
    </div>
  );

  const isPaid = event.ticketing && (event.ticketing.regularPrice > 0 || event.ticketing.vipPrice > 0);
  const ticketPrice = selectedTier === 'vip' ? event.ticketing.vipPrice : event.ticketing.regularPrice;
  const qrData = ticketStatus ? JSON.stringify({ ticketId: ticketStatus.ticketId, eventId: event._id, tier: selectedTier }) : '';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      {/* Event Header Banner */}
      <div className="w-full h-64 md:h-96 relative bg-gray-900 mt-16">
        {event.image ? (
          <img 
            src={event.image.startsWith('http') ? event.image : `http://localhost:5002${event.image}`} 
            alt={event.title} 
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-900"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full max-w-7xl mx-auto px-4 md:px-8 pb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-amber-950 text-xs font-black uppercase tracking-wider mb-4">
            <Tag size={12} /> {event.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight">{event.title}</h1>
          <p className="text-gray-300 text-lg md:text-xl font-medium flex items-center gap-2">
            By {event.organizerName || event.organizer?.name || 'University'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Info Bar */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap gap-6 md:gap-12">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <CalendarIcon size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Date & Time</p>
                <p className="font-bold text-gray-900">{format(new Date(event.date), 'EEEE, MMMM do, yyyy')}</p>
                <p className="text-gray-500">{format(new Date(event.date), 'h:mm a')}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Location</p>
                <p className="font-bold text-gray-900">{event.location}</p>
                <p className="text-gray-500">Campus Grounds</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-2xl font-black text-gray-900 mb-4">About this Event</h3>
            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
          
        </div>

        {/* Right Column: Ticketing / Action Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-24">
            
            {ticketStatus ? (
              // ──────────────── E-TICKET SUCCESS VIEW ────────────────
              <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-1">You're Going!</h3>
                <p className="text-gray-500 text-sm mb-6">Your e-ticket has been securely generated.</p>
                
                {rewardMsg && (
                  <div className="mb-6 bg-gradient-to-r from-amber-400 to-orange-500 text-white p-3 rounded-xl shadow-md font-bold text-xs animate-bounce-slow text-left">
                    {rewardMsg}
                  </div>
                )}

                {/* E-Ticket Card Design */}
                <div className="relative bg-gray-900 text-white rounded-3xl p-6 mb-6 overflow-hidden text-left shadow-2xl">
                  {/* Decorative perforations */}
                  <div className="absolute top-1/2 -left-4 w-8 h-8 bg-white rounded-full -translate-y-1/2"></div>
                  <div className="absolute top-1/2 -right-4 w-8 h-8 bg-white rounded-full -translate-y-1/2"></div>
                  <div className="absolute top-1/2 left-4 right-4 border-t-2 border-dashed border-gray-700 opacity-50"></div>

                  <div className="flex justify-between items-start mb-6 pb-6">
                    <div>
                      <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Ticket No.</p>
                      <p className="font-mono text-xl font-bold tracking-wider">{ticketStatus.ticketId}</p>
                    </div>
                    {isPaid && (
                      <span className={`px-3 py-1 text-xs font-black uppercase rounded-full ${selectedTier === 'vip' ? 'bg-purple-500/20 text-purple-300' : 'bg-white/10 text-white'}`}>
                        {selectedTier}
                      </span>
                    )}
                  </div>
                  
                  <div className="bg-white rounded-2xl p-4 flex justify-center mt-8 pt-8">
                    <QRCodeSVG value={qrData} size={150} level="H" />
                  </div>
                  
                  <p className="text-center text-gray-400 text-xs mt-4">Present this QR code at the entrance</p>
                </div>
                
                <p className="text-xs text-gray-500 font-medium mb-6">Total University Events Attended: <strong className="text-gray-900">{ticketStatus.eventsAttended}</strong></p>
                
                <div className="space-y-3">
                  <button onClick={() => navigate('/food')} className="w-full bg-amber-400 text-zinc-950 py-4 rounded-2xl font-black hover:bg-amber-300 transition-all shadow-md shadow-amber-200 text-sm active:scale-95 flex items-center justify-center gap-2">
                    🍽️ Pre-order Event Food
                  </button>
                  <button onClick={() => navigate('/parking')} className="w-full bg-zinc-950 text-white py-4 rounded-2xl font-black hover:bg-zinc-800 transition-all shadow-md shadow-zinc-300 text-sm active:scale-95 flex items-center justify-center gap-2">
                    🚗 Reserve Parking Slot
                  </button>
                  <button onClick={() => navigate('/events')} className="w-full bg-amber-400 text-zinc-950 py-4 rounded-2xl font-black hover:bg-amber-300 transition-all shadow-md shadow-amber-200 text-sm active:scale-95 flex items-center justify-center gap-2">
                    Browse More Events
                  </button>
                </div>
              </div>

            ) : (
              // ──────────────── REGISTRATION / PURCHASE VIEW ────────────────
              <>
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <TicketIcon className="text-amber-400" />
                  Registration
                </h3>

                {isPaid ? (
                  <div className="space-y-4 mb-6">
                    {/* Tier Selection */}
                    <div 
                      onClick={() => setSelectedTier('regular')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedTier === 'regular' ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-900">Regular Ticket</span>
                        <span className="font-black text-xl text-gray-900">Rs. {event.ticketing.regularPrice}</span>
                      </div>
                      <p className="text-xs text-gray-500">General admission to all areas.</p>
                    </div>

                    {event.ticketing.vipPrice > 0 && (
                      <div 
                        onClick={() => setSelectedTier('vip')}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden ${selectedTier === 'vip' ? 'border-amber-400 bg-amber-50/50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                      >
                        <div className="flex justify-between items-center mb-1 relative z-10">
                          <span className="font-bold text-amber-700 flex items-center gap-1">VIP Access <ShieldCheck size={14}/></span>
                          <span className="font-black text-xl text-amber-700">Rs. {event.ticketing.vipPrice}</span>
                        </div>
                        <p className="text-xs text-amber-600/70 relative z-10">Front row seating, dedicated entrance, and VIP lounge access.</p>
                        
                        {/* Shimmer effect */}
                        {selectedTier === 'vip' && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-green-50 rounded-2xl p-6 text-center mb-6">
                    <span className="text-3xl font-black text-green-600">FREE</span>
                    <p className="text-green-800 text-sm mt-1 font-medium">No payment required for this event.</p>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-6 mb-6 mt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500 font-medium text-sm">Capacity</span>
                    <span className="font-bold text-gray-900 flex items-center gap-1.5"><Users size={14}/> {event.capacity === -1 ? 'Unlimited' : `${event.capacity} seats`}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium text-sm">Deadline</span>
                    <span className="font-bold text-gray-900">
                      {event.registrationDeadline
                        ? format(new Date(event.registrationDeadline), 'MMM do')
                        : 'Open'}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={handleRegistrationClick}
                  className="w-full bg-amber-400 text-zinc-950 py-4 rounded-2xl font-black hover:bg-amber-300 transition-all shadow-xl shadow-amber-200 active:scale-95 text-xl"
                >
                  {isPaid ? 'Checkout Securely' : 'Register for Free'}
                </button>
              </>
            )}
            
          </div>
        </div>

      </div>

      {/* ──────────────── PAYMENT MODAL (MOCK) ──────────────── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h4 className="font-black text-gray-900 flex items-center gap-2">
                <CreditCard className="text-blue-500" size={20} />
                Secure Checkout
              </h4>
              <button onClick={() => !isProcessing && setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Order Summary */}
              <div className="bg-blue-50/50 rounded-2xl p-4 mb-6 flex justify-between items-center border border-blue-100/50">
                <div>
                  <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-1">{selectedTier} Ticket</p>
                  <p className="font-medium text-gray-900 truncate max-w-[200px]">{event.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-blue-600 font-medium mb-1">Total Due</p>
                  <p className="text-2xl font-black text-gray-900">Rs. {ticketPrice}</p>
                </div>
              </div>

              {/* Mock Form */}
              <form onSubmit={processPayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Card Information</label>
                  <div className="relative">
                    <input 
                      required
                      type="text"
                      name="number"
                      placeholder="0000 0000 0000 0000"
                      value={cardDetails.number}
                      onChange={handleCardChange}
                      onBlur={handleCardBlur}
                      maxLength={19}
                      className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl font-mono text-sm transition-all shadow-sm focus:outline-none focus:ring-2 ${
                        cardTouched.number && cardNumberError
                          ? 'border-rose-400 focus:ring-rose-300'
                          : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    <CreditCard size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${cardTouched.number && cardNumberError ? 'text-rose-400' : 'text-gray-400'}`} />
                  </div>
                  {cardTouched.number && cardNumberError && <p className="text-[11px] text-rose-500 font-bold mt-1 ml-1">⚠ {cardNumberError}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input 
                      required
                      type="text"
                      name="expiry"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={handleCardChange}
                      onBlur={handleCardBlur}
                      maxLength={5}
                      className={`w-full px-4 py-3 bg-white border rounded-xl font-mono text-sm transition-all shadow-sm focus:outline-none focus:ring-2 ${
                        cardTouched.expiry && expiryError
                          ? 'border-rose-400 focus:ring-rose-300'
                          : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {cardTouched.expiry && expiryError && <p className="text-[11px] text-rose-500 font-bold mt-1 ml-1">⚠ {expiryError}</p>}
                  </div>
                  <div>
                    <input 
                      required
                      type="password"
                      name="cvc"
                      placeholder="CVC"
                      value={cardDetails.cvc}
                      onChange={handleCardChange}
                      onBlur={handleCardBlur}
                      maxLength={4}
                      className={`w-full px-4 py-3 bg-white border rounded-xl font-mono text-sm transition-all shadow-sm focus:outline-none focus:ring-2 ${
                        cardTouched.cvc && cvcError
                          ? 'border-rose-400 focus:ring-rose-300'
                          : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {cardTouched.cvc && cvcError && <p className="text-[11px] text-rose-500 font-bold mt-1 ml-1">⚠ {cvcError}</p>}
                  </div>
                </div>
                
                <div>
                  <input 
                    required
                    type="text"
                    name="name"
                    placeholder="Cardholder Name"
                    value={cardDetails.name}
                    onChange={handleCardChange}
                    onBlur={handleCardBlur}
                    className={`w-full px-4 py-3 bg-white border rounded-xl text-sm font-medium transition-all shadow-sm focus:outline-none focus:ring-2 ${
                      cardTouched.name && nameError
                        ? 'border-rose-400 focus:ring-rose-300'
                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  />
                  {cardTouched.name && nameError && <p className="text-[11px] text-rose-500 font-bold mt-1 ml-1">⚠ {nameError}</p>}
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={isProcessing || !isCardValid}
                    onClick={() => setCardTouched({ number: true, name: true, expiry: true, cvc: true })}
                    className={`w-full py-4 rounded-xl font-black transition-all shadow-lg active:scale-95 text-lg flex justify-center items-center gap-2 ${
                      isCardValid
                        ? 'bg-amber-400 text-zinc-950 hover:bg-amber-300 shadow-amber-400/20'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    } disabled:opacity-70 disabled:cursor-not-allowed`}
                  >
                    {isProcessing ? (
                      <><div className="w-5 h-5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin"></div> Processing...</>
                    ) : (
                      isCardValid ? `Confirm & Pay Rs. ${ticketPrice}` : 'Fill Card Details'
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-400 font-medium mt-4 flex items-center justify-center gap-1">
                    <ShieldCheck size={14} /> Payments are secure and encrypted
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tailwind Shimmer Keyframes */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}

export default EventPage;

