import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  SparklesIcon,
  CheckIcon } from
'lucide-react';
import { RegistrationModal } from './RegistrationModal';
import { useAuth } from '../context/AuthContext';
export function EventDiscovery() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isLoggedIn } = useAuth();
  const handleRegister = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  // Mock function to check if registered
  const isRegistered = (eventId) => {
    return isLoggedIn && (eventId === '1' || eventId === '2');
  };
  return (
    <section id="events" className="py-24 px-4 bg-gray-50">
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
            <SparklesIcon className="w-4 h-4" />
            Discover Events
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Upcoming <span className="text-amber-400">Events</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Explore exciting events happening on campus. Register now to secure
            your spot.
          </p>
        </motion.div>

        {isLoggedIn &&
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="flex justify-center mb-12">

            <div className="bg-white border border-gray-200 rounded-xl px-6 py-3 shadow-sm flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-400/10 rounded-full flex items-center justify-center">
                <SparklesIcon className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-gray-900 font-medium">
                You have <span className="text-amber-400 font-bold">2</span>{' '}
                upcoming events
              </span>
            </div>
          </motion.div>
        }

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Event Card 1 */}
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
              margin: '-50px'
            }}
            transition={{
              duration: 0.5,
              delay: 0.1
            }}
            className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all">

            <div className="relative h-48 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop"
                alt="Tech Conference event"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

              <div className="absolute top-4 left-4 bg-amber-400 text-zinc-950 font-bold text-sm px-3 py-1 rounded-full shadow-md">
                Tech
              </div>
              {isRegistered('1') &&
              <div className="absolute top-4 right-4 bg-green-500 text-white font-bold text-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <CheckIcon className="w-3 h-3" />
                  Registered
                </div>
              }
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-3">
                <CalendarIcon className="w-4 h-4" />
                <span>Mar 15, 2026 • 2:00 PM</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Tech Innovation Summit
              </h3>
              <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4" />
                  Main Auditorium
                </span>
                <span className="flex items-center gap-1">
                  <UsersIcon className="w-4 h-4" />
                  234 attending
                </span>
              </div>
              {isRegistered('1') ?
              <button
                disabled
                className="w-full bg-green-50 border border-green-200 text-green-600 font-bold py-3 px-6 rounded-lg cursor-default flex items-center justify-center gap-2">

                  <CheckIcon className="w-4 h-4" />
                  Registered
                </button> :

              <button
                onClick={() =>
                handleRegister({
                  id: '1',
                  title: 'Tech Innovation Summit',
                  date: 'Mar 15, 2026',
                  time: '2:00 PM',
                  location: 'Main Auditorium',
                  image: '',
                  attendees: 234,
                  category: 'Tech'
                })
                }
                className="w-full bg-amber-400 text-zinc-950 font-bold py-3 px-6 rounded-lg hover:bg-amber-300 transition-colors shadow-[0_0_20px_rgba(251,191,36,0.25)]">

                  Register Now
                </button>
              }
            </div>
          </motion.div>

          {/* Event Card 2 */}
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
              margin: '-50px'
            }}
            transition={{
              duration: 0.5,
              delay: 0.2
            }}
            className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all">

            <div className="relative h-48 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop"
                alt="Music Festival event"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

              <div className="absolute top-4 left-4 bg-purple-400 text-zinc-950 font-bold text-sm px-3 py-1 rounded-full shadow-md">
                Music
              </div>
              {isRegistered('2') &&
              <div className="absolute top-4 right-4 bg-green-500 text-white font-bold text-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <CheckIcon className="w-3 h-3" />
                  Registered
                </div>
              }
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-3">
                <CalendarIcon className="w-4 h-4" />
                <span>Mar 20, 2026 • 7:00 PM</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Spring Music Festival
              </h3>
              <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4" />
                  Campus Lawn
                </span>
                <span className="flex items-center gap-1">
                  <UsersIcon className="w-4 h-4" />
                  512 attending
                </span>
              </div>
              {isRegistered('2') ?
              <button
                disabled
                className="w-full bg-green-50 border border-green-200 text-green-600 font-bold py-3 px-6 rounded-lg cursor-default flex items-center justify-center gap-2">

                  <CheckIcon className="w-4 h-4" />
                  Registered
                </button> :

              <button
                onClick={() =>
                handleRegister({
                  id: '2',
                  title: 'Spring Music Festival',
                  date: 'Mar 20, 2026',
                  time: '7:00 PM',
                  location: 'Campus Lawn',
                  image: '',
                  attendees: 512,
                  category: 'Music'
                })
                }
                className="w-full bg-amber-400 text-zinc-950 font-bold py-3 px-6 rounded-lg hover:bg-amber-300 transition-colors shadow-[0_0_20px_rgba(251,191,36,0.25)]">

                  Register Now
                </button>
              }
            </div>
          </motion.div>

          {/* Event Card 3 */}
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
              margin: '-50px'
            }}
            transition={{
              duration: 0.5,
              delay: 0.3
            }}
            className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all">

            <div className="relative h-48 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&h=400&fit=crop"
                alt="Career Fair event"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

              <div className="absolute top-4 left-4 bg-cyan-400 text-zinc-950 font-bold text-sm px-3 py-1 rounded-full shadow-md">
                Career
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-3">
                <CalendarIcon className="w-4 h-4" />
                <span>Mar 25, 2026 • 10:00 AM</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Spring Career Fair
              </h3>
              <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4" />
                  Student Center
                </span>
                <span className="flex items-center gap-1">
                  <UsersIcon className="w-4 h-4" />
                  389 attending
                </span>
              </div>
              <button
                onClick={() =>
                handleRegister({
                  id: '3',
                  title: 'Spring Career Fair',
                  date: 'Mar 25, 2026',
                  time: '10:00 AM',
                  location: 'Student Center',
                  image: '',
                  attendees: 389,
                  category: 'Career'
                })
                }
                className="w-full bg-amber-400 text-zinc-950 font-bold py-3 px-6 rounded-lg hover:bg-amber-300 transition-colors shadow-[0_0_20px_rgba(251,191,36,0.25)]">

                Register Now
              </button>
            </div>
          </motion.div>

          {/* Event Card 4 */}
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
              margin: '-50px'
            }}
            transition={{
              duration: 0.5,
              delay: 0.4
            }}
            className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all">

            <div className="relative h-48 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop"
                alt="Art Exhibition event"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

              <div className="absolute top-4 left-4 bg-pink-400 text-zinc-950 font-bold text-sm px-3 py-1 rounded-full shadow-md">
                Art
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-3">
                <CalendarIcon className="w-4 h-4" />
                <span>Apr 1, 2026 • 6:00 PM</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Student Art Exhibition
              </h3>
              <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4" />
                  Art Gallery
                </span>
                <span className="flex items-center gap-1">
                  <UsersIcon className="w-4 h-4" />
                  156 attending
                </span>
              </div>
              <button
                onClick={() =>
                handleRegister({
                  id: '4',
                  title: 'Student Art Exhibition',
                  date: 'Apr 1, 2026',
                  time: '6:00 PM',
                  location: 'Art Gallery',
                  image: '',
                  attendees: 156,
                  category: 'Art'
                })
                }
                className="w-full bg-amber-400 text-zinc-950 font-bold py-3 px-6 rounded-lg hover:bg-amber-300 transition-colors shadow-[0_0_20px_rgba(251,191,36,0.25)]">

                Register Now
              </button>
            </div>
          </motion.div>

          {/* Event Card 5 */}
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
              margin: '-50px'
            }}
            transition={{
              duration: 0.5,
              delay: 0.5
            }}
            className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all">

            <div className="relative h-48 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop"
                alt="Sports Tournament event"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

              <div className="absolute top-4 left-4 bg-green-400 text-zinc-950 font-bold text-sm px-3 py-1 rounded-full shadow-md">
                Sports
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-3">
                <CalendarIcon className="w-4 h-4" />
                <span>Apr 5, 2026 • 9:00 AM</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Intramural Basketball Finals
              </h3>
              <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4" />
                  Sports Complex
                </span>
                <span className="flex items-center gap-1">
                  <UsersIcon className="w-4 h-4" />
                  278 attending
                </span>
              </div>
              <button
                onClick={() =>
                handleRegister({
                  id: '5',
                  title: 'Intramural Basketball Finals',
                  date: 'Apr 5, 2026',
                  time: '9:00 AM',
                  location: 'Sports Complex',
                  image: '',
                  attendees: 278,
                  category: 'Sports'
                })
                }
                className="w-full bg-amber-400 text-zinc-950 font-bold py-3 px-6 rounded-lg hover:bg-amber-300 transition-colors shadow-[0_0_20px_rgba(251,191,36,0.25)]">

                Register Now
              </button>
            </div>
          </motion.div>

          {/* Event Card 6 */}
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
              margin: '-50px'
            }}
            transition={{
              duration: 0.5,
              delay: 0.6
            }}
            className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all">

            <div className="relative h-48 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&h=400&fit=crop"
                alt="Workshop event"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

              <div className="absolute top-4 left-4 bg-orange-400 text-zinc-950 font-bold text-sm px-3 py-1 rounded-full shadow-md">
                Workshop
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-3">
                <CalendarIcon className="w-4 h-4" />
                <span>Apr 10, 2026 • 3:00 PM</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Leadership Workshop
              </h3>
              <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4" />
                  Conference Room B
                </span>
                <span className="flex items-center gap-1">
                  <UsersIcon className="w-4 h-4" />
                  45 attending
                </span>
              </div>
              <button
                onClick={() =>
                handleRegister({
                  id: '6',
                  title: 'Leadership Workshop',
                  date: 'Apr 10, 2026',
                  time: '3:00 PM',
                  location: 'Conference Room B',
                  image: '',
                  attendees: 45,
                  category: 'Workshop'
                })
                }
                className="w-full bg-amber-400 text-zinc-950 font-bold py-3 px-6 rounded-lg hover:bg-amber-300 transition-colors shadow-[0_0_20px_rgba(251,191,36,0.25)]">

                Register Now
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <RegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventTitle={selectedEvent?.title || ''} />

    </section>);

}