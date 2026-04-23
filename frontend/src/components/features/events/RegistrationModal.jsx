import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XIcon,
  UserIcon,
  MailIcon,
  IdCardIcon,
  AlertCircleIcon,
  CheckCircleIcon } from
'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

export function RegistrationModal({
  isOpen,
  onClose,
  eventTitle
}) {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle');
  const { isLoggedIn, user } = useAuth();
  // Auto-fill form when user is logged in
  useEffect(() => {
    if (isLoggedIn && user && isOpen) {
      setName(user.name);
      setEmail(user.email);
      setStudentId(user.studentId);
    } else if (!isOpen) {
      // Reset form on close if not logged in (or keep it clean)
      if (!isLoggedIn) {
        setName('');
        setStudentId('');
        setEmail('');
      }
      setSubmitStatus('idle');
      setErrors({});
    }
  }, [isLoggedIn, user, isOpen]);

  const validateEmail = (email) => {
    const eduEmailRegex = /^[^\s@]+@[^\s@]+\.edu$/i;
    return eduEmailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
    } else if (!/^\d{6,10}$/.test(studentId) && !studentId.startsWith('STU-')) {
      newErrors.studentId = 'Enter a valid student ID';
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Only valid university emails (.edu) are accepted';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitStatus('success');
    setTimeout(() => {
      onClose();
      if (!isLoggedIn) {
        setName('');
        setStudentId('');
        setEmail('');
      }
      setErrors({});
      setSubmitStatus('idle');
    }, 2000);
  };
  return (
    <AnimatePresence>
      {isOpen &&
      <>
          <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          onClick={onClose} />

          <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
            y: 20
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            y: 20
          }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 300
          }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50">

            <div className="bg-bg-card border border-border-token rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
              <div className="relative p-6 border-b border-border-token">
                <h2 className="text-xl font-bold text-text-primary pr-8">
                  Register for Event
                </h2>
                <p className="text-text-secondary text-sm mt-1">{eventTitle}</p>
                <button
                onClick={onClose}
                className="absolute top-6 right-6 text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Close modal">

                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              {submitStatus === 'success' ?
            <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon className="w-8 h-8 text-success" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Registration Successful!
                  </h3>
                  <p className="text-text-secondary">
                    You'll receive a confirmation email shortly.
                  </p>
                </div> :

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div>
                    <label
                  htmlFor="reg-name"
                  className="block text-sm font-medium text-text-secondary mb-2">

                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                      <input
                    id="reg-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    readOnly={isLoggedIn}
                    className={`w-full bg-bg-surface border ${errors.name ? 'border-error' : 'border-border-token'} rounded-lg pl-11 pr-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${isLoggedIn ? 'opacity-75 cursor-not-allowed' : ''}`} />

                    </div>
                    {errors.name &&
                <p className="mt-2 text-sm text-error flex items-center gap-1">
                        <AlertCircleIcon className="w-4 h-4" />
                        {errors.name}
                      </p>
                }
                  </div>

                  <div>
                    <label
                  htmlFor="reg-student-id"
                  className="block text-sm font-medium text-text-secondary mb-2">

                      Student ID
                    </label>
                    <div className="relative">
                      <IdCardIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                      <input
                    id="reg-student-id"
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Enter your student ID"
                    readOnly={isLoggedIn}
                    className={`w-full bg-bg-surface border ${errors.studentId ? 'border-error' : 'border-border-token'} rounded-lg pl-11 pr-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${isLoggedIn ? 'opacity-75 cursor-not-allowed' : ''}`} />

                    </div>
                    {errors.studentId &&
                <p className="mt-2 text-sm text-error flex items-center gap-1">
                        <AlertCircleIcon className="w-4 h-4" />
                        {errors.studentId}
                      </p>
                }
                  </div>

                  <div>
                    <label
                  htmlFor="reg-email"
                  className="block text-sm font-medium text-text-secondary mb-2">

                      University Email
                    </label>
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                      <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@university.edu"
                    readOnly={isLoggedIn}
                    className={`w-full bg-bg-surface border ${errors.email ? 'border-error' : 'border-border-token'} rounded-lg pl-11 pr-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${isLoggedIn ? 'opacity-75 cursor-not-allowed' : ''}`} />

                    </div>
                    {errors.email &&
                <p className="mt-2 text-sm text-error flex items-center gap-1">
                        <AlertCircleIcon className="w-4 h-4" />
                        {errors.email}
                      </p>
                }
                  </div>

                  <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-bg-base font-bold py-3 px-6 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-primary">

                    {isSubmitting ? 'Registering...' : 'Complete Registration'}
                  </button>
                </form>
            }
            </div>
          </motion.div>
        </>
      }
    </AnimatePresence>);

}
