import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  SendIcon,
  SparklesIcon } from
'lucide-react';
export function ContactSection() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
    setFormState({
      name: '',
      email: '',
      message: ''
    });
    setTimeout(() => setIsSuccess(false), 3000);
  };
  return (
    <section id="contact" className="w-full py-24 px-4 bg-white">
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
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

          {/* Contact Info */}
          <div>
            <span className="inline-flex items-center gap-2 text-amber-400 font-semibold text-sm uppercase tracking-wider mb-4">
              <SparklesIcon className="w-4 h-4" />
              Get in Touch
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              We'd Love to <br />
              <span className="text-amber-400">Hear from You</span>
            </h2>
            <p className="text-gray-600 text-lg mb-12">
              Have questions about an event? Want to host your own? Reach out to
              our team and we'll get back to you shortly.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-400/10 rounded-lg flex items-center justify-center shrink-0">
                  <MailIcon className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Email Us
                  </h3>
                  <p className="text-gray-600">support@unievents.edu</p>
                  <p className="text-gray-600">events@unievents.edu</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cyan-400/10 rounded-lg flex items-center justify-center shrink-0">
                  <PhoneIcon className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Call Us
                  </h3>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Mon-Fri, 9am-5pm EST
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-400/10 rounded-lg flex items-center justify-center shrink-0">
                  <MapPinIcon className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Visit Us
                  </h3>
                  <p className="text-gray-600">Student Center, Room 304</p>
                  <p className="text-gray-600">123 University Ave</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2">

                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formState.name}
                  onChange={(e) =>
                  setFormState({
                    ...formState,
                    name: e.target.value
                  })
                  }
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                  placeholder="John Doe" />

              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2">

                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formState.email}
                  onChange={(e) =>
                  setFormState({
                    ...formState,
                    email: e.target.value
                  })
                  }
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                  placeholder="john@university.edu" />

              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2">

                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formState.message}
                  onChange={(e) =>
                  setFormState({
                    ...formState,
                    message: e.target.value
                  })
                  }
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all resize-none"
                  placeholder="How can we help you?" />

              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-400 text-zinc-950 font-bold py-4 px-6 rounded-lg hover:bg-amber-300 transition-colors shadow-[0_0_20px_rgba(251,191,36,0.25)] flex items-center justify-center gap-2 disabled:opacity-70">

                {isSubmitting ?
                'Sending...' :
                isSuccess ?
                'Message Sent!' :

                <>
                    Send Message
                    <SendIcon className="w-4 h-4" />
                  </>
                }
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>);

}