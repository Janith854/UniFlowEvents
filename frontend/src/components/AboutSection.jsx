import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users, Calendar } from 'lucide-react';
export function AboutSection() {
  return (
    <section id="about" className="py-24 px-4 bg-white">
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
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Image Column */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/20 to-cyan-400/20 rounded-3xl blur-2xl opacity-50" />
            <img
              src="https://www.sliit.lk/about/about-sliit/"
              alt="University campus with modern architecture and green spaces"
              className="relative w-full h-[400px] lg:h-[500px] object-cover rounded-2xl border border-gray-200 shadow-lg" />

            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-zinc-950 font-bold text-sm border-2 border-white">
                    JD
                  </div>
                  <div className="w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center text-zinc-950 font-bold text-sm border-2 border-white">
                    MK
                  </div>
                  <div className="w-10 h-10 rounded-full bg-purple-400 flex items-center justify-center text-zinc-950 font-bold text-sm border-2 border-white">
                    AS
                  </div>
                </div>
                <div>
                  <p className="text-gray-900 font-semibold">
                    5,000+ Active Students
                  </p>
                  <p className="text-gray-500 text-sm">
                    Engaged in campus events
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Text Column */}
          <div>
            <span className="inline-flex items-center gap-2 text-amber-400 font-semibold text-sm uppercase tracking-wider mb-4">
              <Sparkles className="w-4 h-4" />
              About Us
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Empowering Student
              <span className="text-amber-400"> Engagement</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Our mission is to create a vibrant campus community where every
              student can discover, participate, and lead. We believe that
              meaningful connections happen beyond the classroom, and our
              platform makes it effortless to find events that match your
              interests.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-amber-400/50 transition-colors">
                <div className="w-12 h-12 bg-amber-400/10 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-gray-900 font-semibold text-lg mb-2">
                  200+ Events
                </h3>
                <p className="text-gray-500 text-sm">
                  Hosted annually across all departments and student
                  organizations
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-cyan-400/50 transition-colors">
                <div className="w-12 h-12 bg-cyan-400/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-gray-900 font-semibold text-lg mb-2">
                  50+ Clubs
                </h3>
                <p className="text-gray-500 text-sm">
                  Active student organizations creating memorable experiences
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>);

}