import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Calendar,
  Utensils,
  Mail } from
'lucide-react';
import { Navbar } from '../components/Navbar';
import { AboutSection } from '../components/AboutSection';
import { ContactSection } from '../components/ContactSection';
import { EventDiscovery } from '../components/EventDiscovery';
import { EventServices } from '../components/EventServices';
export function HomePage() {
  // Navigation links for Footer
  const navLinks = [
  {
    href: '#about',
    label: 'About',
    icon: Sparkles
  },
  {
    href: '#events',
    label: 'Events',
    icon: Calendar
  },
  {
    href: '#services',
    label: 'Services',
    icon: Utensils
  },
  {
    href: '#contact',
    label: 'Contact',
    icon: Mail
  }];

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{
              opacity: 0,
              y: 40
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.8
            }}>

            <span className="inline-flex items-center gap-2 text-amber-400 font-semibold text-sm uppercase tracking-wider mb-6">
              <Sparkles className="w-4 h-4" />
              University Event Platform
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Discover, Connect,
              <br />
              <span className="text-amber-400">Experience</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Your gateway to campus life. Find events, pre-order food, reserve
              parking, and connect with your university community—all in one
              place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => scrollToSection('#events')}
                className="w-full sm:w-auto bg-amber-400 text-zinc-950 font-bold px-8 py-4 rounded-lg hover:bg-amber-300 transition-colors shadow-[0_0_30px_rgba(251,191,36,0.3)]">

                Explore Events
              </button>
              <button
                onClick={() => scrollToSection('#about')}
                className="w-full sm:w-auto bg-white text-gray-900 font-bold px-8 py-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">

                Learn More
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{
              opacity: 0,
              y: 40
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.8,
              delay: 0.3
            }}
            className="grid grid-cols-3 gap-8 mt-20 max-w-xl mx-auto">

            <div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">
                200+
              </p>
              <p className="text-gray-500 text-sm">Events/Year</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">
                5K+
              </p>
              <p className="text-gray-500 text-sm">Students</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">
                50+
              </p>
              <p className="text-gray-500 text-sm">Clubs</p>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          transition={{
            delay: 1
          }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2">

          <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{
                y: [0, 8, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity
              }}
              className="w-1.5 h-1.5 bg-amber-400 rounded-full" />

          </div>
        </motion.div>
      </section>

      {/* Page Sections */}
      <AboutSection />
      <EventDiscovery />
      <EventServices />
      <ContactSection />

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-400 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-zinc-950" />
              </div>
              <span className="text-gray-900 font-bold text-xl">UniEvents</span>
            </div>
            <div className="flex items-center gap-8">
              {navLinks.map((link) =>
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="text-gray-500 hover:text-gray-900 text-sm transition-colors">

                  {link.label}
                </button>
              )}
            </div>
            <p className="text-gray-400 text-sm">
              © 2026 UniEvents. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>);

}