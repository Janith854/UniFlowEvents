import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { ParkingMap } from '../components/ParkingMap';
import { getEvents } from '../services/eventService';
import { getParkingStatus, createCheckoutSession } from '../services/parkingService';
import { PaymentModal } from '../components/PaymentModal';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../context/AuthContext';
import { BarChart2, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

export function ParkingPage() {
  const { role } = useAuth();
  const locationName = 'SLIIT Car Park';
  const locationCode = 'WX7F+VC2, Malabe';
  const mapsQuery = 'https://www.google.com/maps?q=WX7F%2BVC2%2C%20Malabe';
  const mapsEmbed = 'https://maps.google.com/maps?q=WX7F%2BVC2%2C%20Malabe&z=17&output=embed';
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [reservedSlots, setReservedSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedZone, setSelectedZone] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchParkingStatus();
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      const { data } = await getEvents();
      const approved = data.filter(e => e.status === 'Approved');
      setEvents(approved);
      if (approved.length > 0) setSelectedEventId(approved[0]._id);
    } catch (err) {
      toast.error('Failed to load events');
    }
  };

  const fetchParkingStatus = async () => {
    try {
      const { data } = await getParkingStatus(selectedEventId);
      setReservedSlots(data);
    } catch (err) {
      toast.error('Failed to load parking status');
    }
  };

  const handleBookingClick = (e) => {
    e.preventDefault();
    if (!selectedSlot || !vehiclePlate) return;
    setIsModalOpen(true);
  };

  const handlePaymentConfirmed = async () => {
    setIsLoading(true);
    try {
      const { data } = await createCheckoutSession({
        eventId: selectedEventId,
        vehiclePlate,
        zone: selectedZone,
        slotNumber: selectedSlot
      });

      return data; // Return data so the modal knows it succeeded
    } catch (err) {
      const msg = err.response?.data?.msg || err.response?.data?.error || 'Error processing payment';
      toast.error(msg);
      throw err; // Re-throw to let the modal handle the error state
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-zinc-950 font-sans">
      <Navbar />
      <main className="pt-24 px-4 pb-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-xl shadow-zinc-200/50 border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-3xl font-black text-zinc-950 tracking-tight flex items-center gap-3">
                    Smart Parking
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Status</span>
                    </div>
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                    {reservedSlots.length < 100 ? (
                      <span className="text-zinc-900 font-bold">{100 - reservedSlots.length} slots available</span>
                    ) : (
                      <span className="text-rose-500 font-bold">Parking Full</span>
                    )} 
                    {' '}for your selected event.
                  </p>
                </div>
                
                <select 
                  value={selectedEventId} 
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-2xl focus:ring-amber-500 focus:border-amber-500 block p-4 font-bold"
                >
                  {events.map(event => (
                    <option key={event._id} value={event._id}>{event.title}</option>
                  ))}
                </select>
              </div>

              <section className="mb-8 bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
                <div className="p-5 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Parking Location</p>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">{locationName}</h2>
                  <p className="text-gray-600 mt-1">{locationCode}</p>
                  <a
                    href={mapsQuery}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center mt-4 px-4 py-2 rounded-lg bg-amber-400 text-zinc-900 font-semibold hover:bg-amber-300 transition-colors"
                  >
                    Open in Google Maps
                  </a>
                </div>
                <iframe
                  title="SLIIT Car Park Map"
                  src={mapsEmbed}
                  loading="lazy"
                  className="w-full h-64 border-0"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </section>

              {role === 'organizer' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="p-2 bg-amber-400 rounded-lg">
                        <Users className="w-4 h-4 text-zinc-950" />
                      </div>
                      <span className="text-[11px] font-black text-amber-700 uppercase tracking-wider">Occupancy</span>
                    </div>
                    <p className="text-2xl font-black text-zinc-950">{reservedSlots.length}%</p>
                    <p className="text-[10px] text-amber-600 font-bold uppercase mt-1">Total Capacity: 100</p>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="p-2 bg-emerald-500 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider">Revenue</span>
                    </div>
                    <p className="text-2xl font-black text-zinc-950">Rs. {(reservedSlots.length * 1000).toLocaleString()}</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1">LKR 1,000 per slot</p>
                  </div>

                  <Link to="/admin/parking" className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex flex-col justify-between hover:bg-zinc-900 transition-colors group">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="p-2 bg-zinc-800 rounded-lg group-hover:bg-zinc-700 transition-colors">
                        <BarChart2 className="w-4 h-4 text-amber-400" />
                      </div>
                      <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">Analytics</span>
                    </div>
                    <div className="flex items-center justify-between text-white">
                      <span className="font-bold text-sm">Full Report</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </div>
              )}

              <ParkingMap 
                selectedSlot={selectedSlot}
                reservedSlots={reservedSlots}
                onSelectSlot={(slot, zone) => {
                  setSelectedSlot(slot);
                  setSelectedZone(zone);
                }}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-zinc-200/50 border border-gray-100 sticky top-24">
              <h2 className="text-xl font-black mb-8 uppercase tracking-widest text-[10px] text-gray-400">Reservation Summary</h2>
              
              {selectedSlot ? (
                <form onSubmit={handleBookingClick} className="space-y-8">
                  <div className="p-6 bg-zinc-50 rounded-2xl border border-gray-100 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-bold uppercase">Zone</span>
                      <span className="font-black text-zinc-950">{selectedZone}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <span className="text-xs text-gray-500 font-bold uppercase">Slot</span>
                      <span className="font-black text-amber-500 text-xl">{selectedSlot}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm font-bold text-zinc-950">Total Fee</span>
                      <span className="font-black text-zinc-950 text-xl tracking-tight">LKR 1,000</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Vehicle Plate Number</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="WP ABC-1234"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 outline-none transition-all font-bold placeholder:text-gray-300"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-amber-400 text-zinc-950 font-black py-5 rounded-2xl hover:bg-amber-300 transition-all shadow-2xl shadow-amber-400/20 disabled:opacity-70 group flex items-center justify-center gap-3"
                  >
                    {isLoading ? (
                        <div className="w-5 h-5 border-4 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <span>Authorize Payment</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-gray-400 leading-relaxed font-medium">
                    By clicking authorize, you agree to our parking terms. <br/>
                    Secure encrypted checkout provided by Stripe inc.
                  </p>
                </form>
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-amber-50/50">
                    <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <p className="text-zinc-950 font-black tracking-tight">Pick a spot</p>
                  <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Select a zone first</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <PaymentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handlePaymentConfirmed}
        reservationData={{
          slotNumber: selectedSlot,
          zone: selectedZone
        }}
      />
    </div>
  );
}
