
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Sparkles,
  Calendar,
  Utensils,
  Car,
  LayoutDashboard,
  LogOut,
  User,
  CalendarDays,
  BarChart,
  CheckSquare,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';


export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, role, logout } = useAuth();
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/events', label: 'Events', icon: Calendar },
    { href: role === 'organizer' ? '/admin/food' : '/food', label: 'Food', icon: Utensils },
    { href: '/parking', label: 'Parking', icon: Car }
  ];

  if (isAuthenticated) {
    navLinks.push({ href: '/calendar', label: 'Calendar', icon: CalendarDays });
    if (role === 'organizer') {
      navLinks.push({ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard });
    }
  }

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/', { replace: true });
  };
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              <Sparkles className="w-5 h-5 text-zinc-950" />
            </div>
            <span className="text-gray-900 font-bold text-xl hidden sm:block">
              UniFlowEvents
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-gray-900 text-sm font-medium bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200"
                >
                  <User className="w-4 h-4 text-amber-400" />
                  <span>
                    {user?.name || 'Profile'}{' '}
                    {role === 'organizer' ? '(Organizer)' : '(Student)'}
                  </span>
                </Link>
                <button
              onClick={logout}
              className="p-3 bg-amber-400 text-zinc-950 rounded-2xl hover:bg-amber-300 transition-all shadow-lg shadow-amber-200 active:scale-95"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="bg-amber-400 text-zinc-950 font-bold px-8 py-2.5 rounded-lg hover:bg-amber-300 transition-colors shadow-[0_0_20px_rgba(251,191,36,0.25)]"
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-gray-900 p-2"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}>

           {isMenuOpen ?
  <X className="w-6 h-6" /> :
  <Menu className="w-6 h-6" />
}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen &&
          <motion.div
            initial={{
              opacity: 0,
              y: -10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              y: -10
            }}
            className="lg:hidden bg-white border-b border-gray-200">

            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 w-full text-left text-gray-600 hover:text-gray-900 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {link.icon && (
                    <link.icon className="w-5 h-5 text-amber-400" />
                  )}
                  {link.label}
                </Link>
              ))}

              <div className="pt-4 mt-2 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="space-y-3 px-4">
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <User className="w-5 h-5 text-amber-400" />
                      <span>
                        {user?.name || 'Profile'}{' '}
                        {role === 'organizer' ? '(Organizer)' : '(Student)'}
                      </span>
                    </div>
                    <button
              onClick={logout}
              className="w-full mt-2 flex items-center justify-center gap-3 p-4 bg-amber-400 text-zinc-950 rounded-2xl font-black transition-all active:scale-95 shadow-lg shadow-amber-200"
            >
              <LogOut size={20} />
              Logout
            </button>
                  </div>
                ) : (
                  <div className="space-y-3 px-4 pb-4">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full block bg-amber-400 text-zinc-950 font-bold px-6 py-3 rounded-lg hover:bg-amber-300 transition-colors shadow-[0_0_20px_rgba(251,191,36,0.25)] text-center"
                    >
                      Login
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </nav>
  );
}
