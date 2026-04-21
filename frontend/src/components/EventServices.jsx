import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UtensilsIcon,
  CarIcon,
  PlusIcon,
  MinusIcon,
  CheckIcon,
  LockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon } from
'lucide-react';
import { useAuth } from '../context/AuthContext';
export function EventServices() {
  const [cart, setCart] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isOrdersExpanded, setIsOrdersExpanded] = useState(true);
  const navigate = useNavigate();
  const { isLoggedIn, login } = useAuth();
  const menuItems = [
  {
    id: '1',
    name: 'Gourmet Burger',
    description: 'Angus beef with caramelized onions',
    price: 12.99,
    available: true
  },
  {
    id: '2',
    name: 'Caesar Salad',
    description: 'Romaine, parmesan, croutons',
    price: 8.99,
    available: true
  },
  {
    id: '3',
    name: 'Margherita Pizza',
    description: 'Fresh mozzarella, basil, tomato',
    price: 14.99,
    available: true
  },
  {
    id: '4',
    name: 'Chicken Tacos',
    description: 'Grilled chicken, salsa verde',
    price: 10.99,
    available: false
  },
  {
    id: '5',
    name: 'Veggie Wrap',
    description: 'Hummus, roasted vegetables',
    price: 9.99,
    available: true
  },
  {
    id: '6',
    name: 'Loaded Nachos',
    description: 'Cheese, jalapeños, sour cream',
    price: 11.99,
    available: true
  }];

  const parkingSlots = [
  {
    id: 'A1',
    row: 'A',
    number: 1,
    available: true
  },
  {
    id: 'A2',
    row: 'A',
    number: 2,
    available: false
  },
  {
    id: 'A3',
    row: 'A',
    number: 3,
    available: true
  },
  {
    id: 'A4',
    row: 'A',
    number: 4,
    available: true
  },
  {
    id: 'A5',
    row: 'A',
    number: 5,
    available: false
  },
  {
    id: 'A6',
    row: 'A',
    number: 6,
    available: true
  },
  {
    id: 'B1',
    row: 'B',
    number: 1,
    available: false
  },
  {
    id: 'B2',
    row: 'B',
    number: 2,
    available: true
  },
  {
    id: 'B3',
    row: 'B',
    number: 3,
    available: true
  },
  {
    id: 'B4',
    row: 'B',
    number: 4,
    available: false
  },
  {
    id: 'B5',
    row: 'B',
    number: 5,
    available: true
  },
  {
    id: 'B6',
    row: 'B',
    number: 6,
    available: true
  },
  {
    id: 'C1',
    row: 'C',
    number: 1,
    available: true
  },
  {
    id: 'C2',
    row: 'C',
    number: 2,
    available: true
  },
  {
    id: 'C3',
    row: 'C',
    number: 3,
    available: false
  },
  {
    id: 'C4',
    row: 'C',
    number: 4,
    available: true
  },
  {
    id: 'C5',
    row: 'C',
    number: 5,
    available: false
  },
  {
    id: 'C6',
    row: 'C',
    number: 6,
    available: true
  },
  {
    id: 'D1',
    row: 'D',
    number: 1,
    available: false
  },
  {
    id: 'D2',
    row: 'D',
    number: 2,
    available: true
  },
  {
    id: 'D3',
    row: 'D',
    number: 3,
    available: true
  },
  {
    id: 'D4',
    row: 'D',
    number: 4,
    available: true
  },
  {
    id: 'D5',
    row: 'D',
    number: 5,
    available: true
  },
  {
    id: 'D6',
    row: 'D',
    number: 6,
    available: false
  }];

  const addToCart = (itemId) => {
    setCart((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const newCart = {
        ...prev
      };
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };
  const cartTotal = Object.entries(cart).reduce((total, [itemId, quantity]) => {
    const item = menuItems.find((m) => m.id === itemId);
    return total + (item?.price || 0) * quantity;
  }, 0);
  const cartItemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  // Auth Gate Component
  const AuthGate = ({ title, icon: Icon }) =>
  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6 bg-gray-100 rounded-xl border border-gray-200">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 max-w-xs mx-auto">
          Please log in with your student account to access this service.
        </p>
      </div>
      <button
      onClick={login}
      className="flex items-center gap-2 bg-white border border-gray-200 hover:border-amber-400 text-gray-900 px-6 py-3 rounded-lg transition-all group shadow-sm">

        <LockIcon className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
        <span>Login to Access</span>
      </button>
    </div>;

  return (
    <section id="services" className="w-full py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{
            opacity: 0,
            y: 40
          }}
          whileInView={{
            opacity: 1,
            y: 0
          }}
          viewport={{
            once: true,
            margin: '-100px'
          }}
          transition={{
            duration: 0.6
          }}
          className="text-center mb-16">

          <span className="inline-flex items-center gap-2 text-amber-400 font-semibold text-sm uppercase tracking-wider mb-4">
            <UtensilsIcon className="w-4 h-4" />
            Event Services
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Food & <span className="text-amber-400">Parking</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Pre-order your meals and reserve parking to make your event
            experience seamless.
          </p>
        </motion.div>

        {!isLoggedIn ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative w-full h-[500px] rounded-[32px] overflow-hidden group shadow-2xl border border-white/10"
          >
            {/* Space Background */}
            <div className="absolute inset-0">
              <img 
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80" 
                alt="Deep space nebula"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[20s] ease-linear"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-zinc-950/20" />
            </div>

            <div className="relative h-full flex flex-col items-center justify-center text-center px-6 lg:px-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-3xl space-y-8"
              >
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white font-black text-[10px] uppercase tracking-[0.2em]">
                  <SparklesIcon className="w-3 h-3 text-amber-400" />
                  Unlock Your Campus Universe
                </div>

                <h2 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter">
                  Pre-order Meals, Reserve <span className="text-amber-400">Parking</span> & Explore Rewards
                </h2>

                <p className="text-gray-300 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed opacity-90">
                  Elevate your campus journey. Join thousands of students using UniFlow to streamline their event experience with universal digital access.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black px-10 py-5 rounded-2xl transition-all shadow-xl shadow-amber-400/20 active:scale-95 text-lg"
                  >
                    Get Started Now
                  </button>
                  <div className="hidden sm:block w-px h-12 bg-white/20 mx-2" />
                  <p className="text-white/60 text-sm font-bold flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-400" />
                    Universal Student Login
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Subtle floating particles (CSS-only hint) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
               {[...Array(6)].map((_, i) => (
                 <div 
                   key={i}
                   className="absolute bg-white/20 rounded-full blur-xl animate-pulse"
                   style={{
                     width: Math.random() * 100 + 50 + 'px',
                     height: Math.random() * 100 + 50 + 'px',
                     top: Math.random() * 100 + '%',
                     left: Math.random() * 100 + '%',
                     animationDelay: i * 0.5 + 's',
                     animationDuration: Math.random() * 3 + 2 + 's'
                   }}
                 />
               ))}
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Food Pre-Order Section */}
            <motion.div
              initial={{
                opacity: 0,
                x: -40
              }}
              whileInView={{
                opacity: 1,
                x: 0
              }}
              viewport={{
                once: true,
                margin: '-100px'
              }}
              transition={{
                duration: 0.6
              }}
              className="bg-gray-50 border border-gray-200 rounded-2xl p-6 min-h-[500px]">

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-400/10 rounded-lg flex items-center justify-center">
                    <UtensilsIcon className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Food Pre-Order
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Skip the lines, order ahead
                    </p>
                  </div>
                </div>
                {cartItemCount > 0 &&
                  <div className="bg-amber-400 text-zinc-950 font-bold px-4 py-2 rounded-lg text-sm">
                    {cartItemCount} items • ${cartTotal.toFixed(2)}
                  </div>
                }
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {menuItems.map((item) =>
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${item.available ? 'bg-white border-gray-200 hover:border-amber-400/50' : 'bg-gray-100 border-gray-200 opacity-60'}`}>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-gray-900 font-semibold">
                          {item.name}
                        </h4>
                        {!item.available &&
                          <span className="text-xs text-red-500 bg-red-100 px-2 py-0.5 rounded">
                            Sold Out
                          </span>
                        }
                      </div>
                      <p className="text-gray-500 text-sm">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-amber-400 font-bold">
                        ${item.price.toFixed(2)}
                      </span>
                      {item.available &&
                        <div className="flex items-center gap-2">
                          {cart[item.id] ?
                            <>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="w-8 h-8 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-gray-900 hover:bg-gray-200 transition-colors"
                                aria-label={`Remove ${item.name} from cart`}>

                                <MinusIcon className="w-4 h-4" />
                              </button>
                              <span className="text-gray-900 font-semibold w-6 text-center">
                                {cart[item.id]}
                              </span>
                              <button
                                onClick={() => addToCart(item.id)}
                                className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center text-zinc-950 hover:bg-amber-300 transition-colors"
                                aria-label={`Add another ${item.name} to cart`}>

                                <PlusIcon className="w-4 h-4" />
                              </button>
                            </> :

                            <button
                              onClick={() => addToCart(item.id)}
                              className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center text-zinc-950 hover:bg-amber-300 transition-colors shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                              aria-label={`Add ${item.name} to cart`}>

                              <PlusIcon className="w-4 h-4" />
                            </button>
                          }
                        </div>
                      }
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Orders Section */}
              <div className="mt-6 border-t border-gray-200 pt-4">
                <button
                  onClick={() => setIsOrdersExpanded(!isOrdersExpanded)}
                  className="flex items-center justify-between w-full text-left mb-3">

                  <h4 className="font-semibold text-gray-900">
                    Your Recent Orders
                  </h4>
                  {isOrdersExpanded ?
                    <ChevronUpIcon className="w-4 h-4 text-gray-500" /> :

                    <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                  }
                </button>

                <AnimatePresence>
                  {isOrdersExpanded &&
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0
                      }}
                      animate={{
                        height: 'auto',
                        opacity: 1
                      }}
                      exit={{
                        height: 0,
                        opacity: 0
                      }}
                      className="space-y-2 overflow-hidden">

                      <div className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center">
                        <div>
                          <p className="text-gray-900 font-medium">
                            Gourmet Burger × 2
                          </p>
                          <p className="text-gray-500 text-xs">
                            Spring Music Festival • Mar 20
                          </p>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          Confirmed
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center">
                        <div>
                          <p className="text-gray-900 font-medium">
                            Caesar Salad × 1
                          </p>
                          <p className="text-gray-500 text-xs">
                            Career Fair • Mar 25
                          </p>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          Confirmed
                        </span>
                      </div>
                    </motion.div>
                  }
                </AnimatePresence>
              </div>

              {cartItemCount > 0 &&
                <button className="w-full mt-6 bg-amber-400 text-zinc-950 font-bold py-3 px-6 rounded-lg hover:bg-amber-300 transition-colors shadow-[0_0_20px_rgba(251,191,36,0.25)]">
                  Checkout • ${cartTotal.toFixed(2)}
                </button>
              }
            </motion.div>

            {/* Parking Reservation Section */}
            <motion.div
              initial={{
                opacity: 0,
                x: 40
              }}
              whileInView={{
                opacity: 1,
                x: 0
              }}
              viewport={{
                once: true,
                margin: '-100px'
              }}
              transition={{
                duration: 0.6
              }}
              className="bg-gray-50 border border-gray-200 rounded-2xl p-6 min-h-[500px]">

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-cyan-400/10 rounded-lg flex items-center justify-center">
                  <CarIcon className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Parking Reservation
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Reserve your spot in advance
                  </p>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-cyan-400/20 border border-cyan-400 rounded" />
                  <span className="text-gray-500 text-sm">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded" />
                  <span className="text-gray-500 text-sm">Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-400 border border-amber-400 rounded shadow-sm" />
                  <span className="text-gray-500 text-sm">Selected</span>
                </div>
              </div>

              {/* Parking Grid */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex justify-center mb-4">
                  <div className="bg-gray-100 text-gray-500 text-sm font-medium px-8 py-2 rounded-t-lg">
                    ENTRANCE
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-2">
                  {parkingSlots.map((slot) =>
                    <button
                      key={slot.id}
                      disabled={!slot.available}
                      onClick={() =>
                        setSelectedSlot(
                          selectedSlot === slot.id ? null : slot.id
                        )
                      }
                      className={`
                            aspect-[3/4] rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all
                            ${!slot.available ? 'bg-gray-200 border border-gray-300 text-gray-400 cursor-not-allowed' : selectedSlot === slot.id ? 'bg-amber-400 border border-amber-400 text-zinc-950 shadow-md' : 'bg-cyan-400/10 border border-cyan-400 text-cyan-600 hover:bg-cyan-400/20'}
                          `}
                      aria-label={`Parking slot ${slot.id}${slot.available ? '' : ' (occupied)'}${selectedSlot === slot.id ? ' (selected)' : ''}`}>

                      <span>
                        {slot.row}
                        {slot.number}
                      </span>
                      {selectedSlot === slot.id &&
                        <CheckIcon className="w-3 h-3 mt-1" />
                      }
                    </button>
                  )}
                </div>

                <div className="flex justify-between mt-4 text-gray-400 text-xs">
                  <span>Row A-D</span>
                  <span>Spots 1-6</span>
                </div>
              </div>

              {selectedSlot &&
                <div className="mt-6 p-4 bg-white border border-amber-400/30 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-gray-500 text-sm">Selected Spot</p>
                      <p className="text-gray-900 font-bold text-lg">
                        {selectedSlot}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-sm">Reservation Fee</p>
                      <p className="text-amber-400 font-bold text-lg">
                        $5.00
                      </p>
                    </div>
                  </div>
                  <button className="w-full bg-amber-400 text-zinc-950 font-bold py-3 px-6 rounded-lg hover:bg-amber-300 transition-colors shadow-[0_0_20px_rgba(251,191,36,0.25)]">
                    Reserve Spot {selectedSlot}
                  </button>
                </div>
              }

              {/* Existing Reservation Mock */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Your Reservations
                </h4>
                <div className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center">
                  <div>
                    <p className="text-gray-900 font-medium">Spot B3</p>
                    <p className="text-gray-500 text-xs">
                      Spring Music Festival • Mar 20
                    </p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    Confirmed
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}