import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Calendar, Lock, X, CheckCircle } from 'lucide-react';

export function PaymentModal({ isOpen, onClose, onConfirm, reservationData }) {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvc: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Formatting for expiry (MM/YY)
    if (name === 'expiry') {
      const cleanValue = value.replace(/\//g, '').substring(0, 4);
      if (cleanValue.length >= 2) {
        setFormData(prev => ({ ...prev, expiry: `${cleanValue.substring(0, 2)}/${cleanValue.substring(2)}` }));
      } else {
        setFormData(prev => ({ ...prev, expiry: cleanValue }));
      }
      return;
    }

    // Formatting for Card Number (XXXX XXXX XXXX XXXX)
    if (name === 'cardNumber') {
      const cleanValue = value.replace(/\s+/g, '').substring(0, 16);
      const formatted = cleanValue.replace(/(.{4})/g, '$1 ').trim();
      setFormData(prev => ({ ...prev, cardNumber: formatted }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value.substring(0, name === 'cvc' ? 3 : 20) }));
  };

  const isFormValid = formData.cardNumber.replace(/\s/g, '').length === 16 && 
                      formData.expiry.length === 5 && 
                      formData.cvc.length === 3;

  const handlePay = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsProcessing(true);
    try {
      // Create reservation in backend first
      const data = await onConfirm();
      setIsSuccess(true);
      
      // Delay to show success state before redirecting
      setTimeout(() => {
        window.location.href = data.url;
      }, 2000);
    } catch (err) {
      // Error handling is managed by onConfirm in ParkingPage
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 rounded-full"
          >
            <X size={20} />
          </button>

          {!isSuccess ? (
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-zinc-950 tracking-tight">Authorize Payment</h2>
                <p className="text-gray-500 text-sm">Secure encrypted checkout for UniFlow Parking</p>
              </div>

              {/* Order Summary */}
              <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl mb-8 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none mb-1">Reservation</p>
                  <p className="text-sm font-bold text-zinc-900">Slot {reservationData.slotNumber} • {reservationData.zone} Zone</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none mb-1">Total</p>
                    <p className="text-lg font-black text-zinc-900">LKR 1,000</p>
                </div>
              </div>

              <form onSubmit={handlePay} className="space-y-4">
                {/* Card Number */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Card Number</label>
                  <div className="relative group">
                    <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-zinc-950 transition-colors" />
                    <input 
                      required
                      type="text"
                      name="cardNumber"
                      placeholder="0000 0000 0000 0000"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-zinc-950 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Expiry */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Expiry Date</label>
                    <div className="relative group">
                      <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-zinc-950 transition-colors" />
                      <input 
                        required
                        type="text"
                        name="expiry"
                        placeholder="MM/YY"
                        value={formData.expiry}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-zinc-950 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* CVC */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">CVC</label>
                    <div className="relative group">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-zinc-950 transition-colors" />
                      <input 
                        required
                        type="password"
                        name="cvc"
                        placeholder="•••"
                        value={formData.cvc}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-zinc-950 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isProcessing || !isFormValid}
                  title={!isFormValid ? "Please fill all card details" : ""}
                  className={`w-full rounded-2xl py-4 text-sm font-black uppercase tracking-widest mt-4 shadow-xl transition-all flex items-center justify-center gap-2 ${
                    isFormValid 
                    ? 'bg-zinc-900 text-white shadow-zinc-200 hover:bg-zinc-800' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      {isFormValid ? 'Pay LKR 1,000' : 'Fill Card Details'}
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center space-y-4">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white shadow-lg shadow-green-100"
              >
                <CheckCircle size={40} />
              </motion.div>
              <h2 className="text-2xl font-black text-zinc-950 tracking-tight">Payment Successful!</h2>
              <p className="text-gray-500 text-sm">Your reservation is confirmed. Redirecting to your digital pass...</p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
