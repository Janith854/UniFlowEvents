import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { createEvent, getEvents } from '../services/eventService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export function CreateEvent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    organizerName: '',
    category: '',
    date: '',
    registrationDeadline: '',
    location: '',
    capacity: '',
    capacityType: 'Limited',
    description: '',
    enableTickets: false,
    regularPrice: '0',
    vipPrice: '0'
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value) => {
    let err = '';
    const now = new Date();

    switch (name) {
      case 'title':
        if (!value) err = 'Event title is required';
        else if (value.length < 10 || value.length > 100) err = 'Event title must be between 10-100 characters';
        break;
      case 'organizerName':
        if (!value.trim()) err = 'Organizer name is required';
        break;
      case 'category':
        const validCategories = ['Sports', 'Music', 'Workshop', 'Seminar', 'Cultural', 'Community', 'Miscellaneous'];
        if (!value || !validCategories.includes(value)) err = 'Please select a valid category';
        break;
      case 'location':
        if (!value.trim()) err = 'Venue is required';
        break;
      case 'date':
        if (!value) err = 'Event date is required';
        else if (new Date(value) <= now) err = 'Event date must be in the future';
        break;
      case 'description':
        if (!value.trim()) err = 'Description is required';
        break;
      case 'capacity':
        if (formData.capacityType === 'Limited' && (!value || Number(value) <= 0)) err = 'Capacity must be a positive number';
        break;
      case 'registrationDeadline':
        if (value) {
          const deadline = new Date(value);
          if (deadline <= now) err = 'Registration deadline must be in the future';
          else if (formData.date && deadline >= new Date(formData.date)) err = 'Registration deadline must be before event date';
        }
        break;
      case 'regularPrice':
      case 'vipPrice':
        if (formData.enableTickets && (value === '' || Number(value) < 0)) err = 'Ticket prices must be zero or positive numbers';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: err }));
    return err === '';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    // Real-time validation
    validateField(name, val);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    let err = '';
    if (!file) {
      err = 'Image is required';
    } else {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) err = 'Only JPG and PNG files are accepted';
      else if (file.size > 2 * 1024 * 1024) err = 'Image size must be less than 2MB';
    }

    setErrors(prev => ({ ...prev, image: err }));

    if (!err && file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    const newErrors = {};
    const fields = Object.keys(formData);
    fields.forEach(field => {
      validateField(field, formData[field]);
      // Explicitly check for results to build local state for immediate block
      const now = new Date();
      if (field === 'title') {
        if (!formData.title) newErrors.title = 'Event title is required';
        else if (formData.title.length < 10 || formData.title.length > 100) newErrors.title = 'Event title must be between 10-100 characters';
      }
      if (field === 'organizerName' && !formData.organizerName.trim()) newErrors.organizerName = 'Organizer name is required';
      if (field === 'location' && !formData.location.trim()) newErrors.location = 'Venue is required';
      if (field === 'date') {
        if (!formData.date) newErrors.date = 'Event date is required';
        else if (new Date(formData.date) <= now) newErrors.date = 'Event date must be in the future';
      }
      if (field === 'image' && !image) newErrors.image = 'Image is required';
    });

    if (!image) newErrors.image = 'Image is required';

    if (Object.keys(newErrors).length > 0 || Object.values(errors).some(v => v)) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      toast.error('Please fix the errors before submitting.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Form-level duplicate check (Title + Date)
      const { data: existingEvents } = await getEvents();
      const isDuplicate = existingEvents.some(ev => 
        ev.title.toLowerCase() === formData.title.toLowerCase() && 
        new Date(ev.date).getTime() === new Date(formData.date).getTime()
      );

      if (isDuplicate) {
        setErrors(prev => ({ ...prev, title: 'An event with this title and date already exists' }));
        toast.error('Duplicate event detected');
        setIsSubmitting(false);
        return;
      }

      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('organizerName', formData.organizerName);
      payload.append('category', formData.category || 'Miscellaneous');
      payload.append('date', formData.date);
      if (formData.registrationDeadline) payload.append('registrationDeadline', formData.registrationDeadline);
      payload.append('location', formData.location);
      payload.append('description', formData.description);
      payload.append('capacity', formData.capacityType === 'Unlimited' ? 'Unlimited' : formData.capacity);
      payload.append('ticketing', JSON.stringify({
        enabled: formData.enableTickets,
        regularPrice: Number(formData.regularPrice),
        vipPrice: Number(formData.vipPrice)
      }));
      if (image) {
        payload.append('image', image);
      }

      await createEvent(payload);
      toast.success('Event created and is pending approval!');
      navigate('/events');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || err.response?.data?.error || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />
      <div className="pt-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12">
          <header className="mb-10">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Create New Event</h1>
            <p className="text-gray-500 font-medium">Fill out the details below to submit your event for approval.</p>
          </header>
          
          {/* Error Summary */}
          {Object.values(errors).some(err => err) && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
              <p className="text-rose-600 font-bold mb-2 flex items-center gap-2">
                <span>Please fix the following issues:</span>
              </p>
              <ul className="list-disc list-inside text-rose-500 text-sm space-y-1">
                {Object.entries(errors).map(([field, msg]) => msg && (
                  <li key={field}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Title */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 px-1">Event Title</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange}
                  placeholder="e.g. Annual Tech Symposium 2026"
                  className={`w-full bg-gray-50 border-2 rounded-2xl px-5 py-3 text-gray-900 font-medium transition-all outline-none ${errors.title ? 'border-rose-500 bg-rose-50/10' : 'border-transparent focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10'}`} 
                />
                {errors.title && <p className="text-xs font-bold text-rose-500 px-1">{errors.title}</p>}
              </div>

              {/* Organizer Name */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 px-1">Organizer Name</label>
                <input 
                  type="text" 
                  name="organizerName" 
                  value={formData.organizerName} 
                  onChange={handleChange}
                  placeholder="Department or Society Name"
                  className={`w-full bg-gray-50 border-2 rounded-2xl px-5 py-3 text-gray-900 font-medium transition-all outline-none ${errors.organizerName ? 'border-rose-500 bg-rose-50/10' : 'border-transparent focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10'}`} 
                />
                {errors.organizerName && <p className="text-xs font-bold text-rose-500 px-1">{errors.organizerName}</p>}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 px-1">Category</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange}
                  className={`w-full bg-gray-50 border-2 rounded-2xl px-5 py-3 text-gray-900 font-medium transition-all outline-none ${errors.category ? 'border-rose-500 bg-rose-50/10' : 'border-transparent focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10'}`}
                >
                  <option value="">Select Category</option>
                  <option value="Sports">Sports</option>
                  <option value="Music">Music</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Community">Community</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
                {errors.category && <p className="text-xs font-bold text-rose-500 px-1">{errors.category}</p>}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 px-1">Location / Venue</label>
                <input 
                  type="text" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange}
                  placeholder="Main Auditorium, Hall B, etc."
                  className={`w-full bg-gray-50 border-2 rounded-2xl px-5 py-3 text-gray-900 font-medium transition-all outline-none ${errors.location ? 'border-rose-500 bg-rose-50/10' : 'border-transparent focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10'}`} 
                />
                {errors.location && <p className="text-xs font-bold text-rose-500 px-1">{errors.location}</p>}
              </div>
              
              {/* Event Date */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 px-1">Event Date & Time</label>
                <input 
                  type="datetime-local" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange}
                  className={`w-full bg-gray-50 border-2 rounded-2xl px-5 py-3 text-gray-900 font-medium transition-all outline-none ${errors.date ? 'border-rose-500 bg-rose-50/10' : 'border-transparent focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10'}`} 
                />
                {errors.date && <p className="text-xs font-bold text-rose-500 px-1">{errors.date}</p>}
              </div>

              {/* Registration Deadline */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 px-1">Registration Deadline (Optional)</label>
                <input 
                  type="date" 
                  name="registrationDeadline" 
                  value={formData.registrationDeadline} 
                  onChange={handleChange}
                  className={`w-full bg-gray-50 border-2 rounded-2xl px-5 py-3 text-gray-900 font-medium transition-all outline-none ${errors.registrationDeadline ? 'border-rose-500 bg-rose-50/10' : 'border-transparent focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10'}`} 
                />
                {errors.registrationDeadline && <p className="text-xs font-bold text-rose-500 px-1">{errors.registrationDeadline}</p>}
              </div>

              {/* Capacity Type & Capacity */}
              <div className="space-y-4 md:col-span-2 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Capacity Setting</label>
                    <p className="text-xs text-gray-500">Define if your event has a seat limit.</p>
                  </div>
                  <div className="flex p-1 bg-white rounded-xl border border-gray-200 w-fit">
                    <button
                      type="button"
                      onClick={() => handleChange({ target: { name: 'capacityType', value: 'Limited' } })}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${formData.capacityType === 'Limited' ? 'bg-amber-400 text-zinc-950 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Limited
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange({ target: { name: 'capacityType', value: 'Unlimited' } })}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${formData.capacityType === 'Unlimited' ? 'bg-amber-400 text-zinc-950 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Unlimited
                    </button>
                  </div>
                </div>

                {formData.capacityType === 'Limited' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2 border-t border-gray-100">
                    <label className="block text-xs font-bold text-gray-500 mb-2 px-1 uppercase tracking-wider">Total Spots Available</label>
                    <input 
                      type="number" 
                      name="capacity" 
                      value={formData.capacity} 
                      onChange={handleChange}
                      placeholder="e.g. 150"
                      className={`w-full max-w-[200px] bg-white border-2 rounded-2xl px-5 py-3 text-gray-900 font-medium transition-all outline-none ${errors.capacity ? 'border-rose-500' : 'border-gray-200 focus:border-amber-400'}`} 
                    />
                    {errors.capacity && <p className="text-xs font-bold text-rose-500 mt-2 px-1">{errors.capacity}</p>}
                  </motion.div>
                )}
              </div>

              {/* Ticketing Toggle & Prices */}
              <div className="space-y-4 md:col-span-2 bg-amber-50/30 p-6 rounded-3xl border border-amber-100/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.enableTickets ? 'bg-amber-400 text-zinc-950' : 'bg-gray-200 text-gray-400'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700">Enable Ticketing</label>
                      <p className="text-xs text-gray-500">Allow users to book tickets for this event.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="enableTickets" 
                      checked={formData.enableTickets} 
                      onChange={handleChange}
                      className="sr-only peer" 
                    />
                    <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-400"></div>
                  </label>
                </div>

                {formData.enableTickets && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-amber-100/30">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-amber-700 px-1 uppercase tracking-wider">Regular Price (Rs.)</label>
                      <input 
                        type="number" 
                        name="regularPrice" 
                        value={formData.regularPrice} 
                        onChange={handleChange}
                        className={`w-full bg-white border-2 rounded-2xl px-5 py-3 text-gray-900 font-medium transition-all outline-none ${errors.regularPrice ? 'border-rose-500' : 'border-amber-200 focus:border-amber-400'}`} 
                      />
                      {errors.regularPrice && <p className="text-xs font-bold text-rose-500 px-1">{errors.regularPrice}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-amber-700 px-1 uppercase tracking-wider">VIP Price (Rs.)</label>
                      <input 
                        type="number" 
                        name="vipPrice" 
                        value={formData.vipPrice} 
                        onChange={handleChange}
                        className={`w-full bg-white border-2 rounded-2xl px-5 py-3 text-gray-900 font-medium transition-all outline-none ${errors.vipPrice ? 'border-rose-500' : 'border-amber-200 focus:border-amber-400'}`} 
                      />
                      {errors.vipPrice && <p className="text-xs font-bold text-rose-500 px-1">{errors.vipPrice}</p>}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 px-1">Detailed Description</label>
              <textarea 
                name="description" 
                rows={6} 
                value={formData.description} 
                onChange={handleChange}
                placeholder="Describe your event, agenda, and key highlights..."
                className={`w-full bg-gray-50 border-2 rounded-3xl px-6 py-4 text-gray-900 font-medium transition-all outline-none resize-none ${errors.description ? 'border-rose-500 bg-rose-50/10' : 'border-transparent focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10'}`} 
              />
              {errors.description && <p className="text-xs font-bold text-rose-500 px-1">{errors.description}</p>}
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700 px-1">Event Showcase Image</label>
              <div className={`relative border-2 border-dashed rounded-3xl p-8 transition-all ${errors.image ? 'border-rose-500 bg-rose-50/10' : 'border-gray-200 hover:border-amber-400 bg-gray-50/30'}`}>
                <input 
                  type="file" 
                  accept=".jpg,.jpeg,.png" 
                  onChange={handleImageChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <svg className={`w-8 h-8 ${errors.image ? 'text-rose-400' : 'text-amber-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <p className="text-sm font-bold text-gray-700">Click or drag to upload</p>
                  <p className="text-xs text-gray-400 mt-1">JPG or PNG (max. 2MB)</p>
                </div>
              </div>
              {errors.image && <p className="text-xs font-bold text-rose-500 px-1">{errors.image}</p>}
              
              {imagePreview && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 p-2 bg-white border border-gray-200 rounded-3xl shadow-sm inline-block">
                  <img src={imagePreview} alt="Preview" className="w-full max-w-md h-48 object-cover rounded-2xl shadow-inner" />
                </motion.div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-4">
              <button 
                type="button" 
                onClick={() => navigate('/events')} 
                className="px-8 py-4 rounded-2xl bg-amber-400 text-zinc-950 font-black hover:bg-amber-300 transition-all shadow-md active:scale-95"
              >
                Discard Draft
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-12 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-black transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 group active:scale-95"
              >
                {isSubmitting ? 'Processing...' : 'Submit for Approval'}
                {!isSubmitting && <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
