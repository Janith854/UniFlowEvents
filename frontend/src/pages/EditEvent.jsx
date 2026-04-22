import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { getEventById, updateEvent, checkOrganizerConflict } from '../services/eventService';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

export function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    organizerName: '',
    category: '',
    date: '',
    registrationDeadline: '',
    location: '',
    capacity: '',
    description: '',
    enableTickets: false,
    regularPrice: '0',
    vipPrice: '0',
  });

  const [existingImage, setExistingImage] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [capacityType, setCapacityType] = useState('Limited');

  const [conflictData, setConflictData] = useState(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const hasConfirmedConflict = React.useRef(false);

  useEffect(() => {
    hasConfirmedConflict.current = false;
  }, [formData.date]);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const { data } = await getEventById(id);
        setFormData({
          title: data.title || '',
          organizerName: data.organizerName || data.organizer?.name || '',
          category: data.category || '',
          date: data.date ? new Date(data.date).toISOString().slice(0, 16) : '',
          registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline).toISOString().slice(0, 16) : '',
          location: data.location || '',
          capacity: data.capacity === -1 ? '' : (data.capacity || ''),
          description: data.description || '',
          enableTickets: data.ticketing?.enabled || false,
          regularPrice: data.ticketing?.regularPrice ?? '0',
          vipPrice: data.ticketing?.vipPrice ?? '0',
        });
        setCapacityType(data.capacity === -1 ? 'Unlimited' : 'Limited');
        if (data.image) {
          const imgUrl = data.image.startsWith('http') ? data.image : `http://localhost:5002${data.image}`;
          setExistingImage(imgUrl);
          setImagePreview(imgUrl);
        }
      } catch (err) {
        toast.error('Failed to load event details.');
      } finally {
        setIsLoading(false);
      }
    };
    loadEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, image: 'Only JPG and PNG files are accepted.' }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image must be under 2MB.' }));
      return;
    }
    setErrors(prev => ({ ...prev, image: '' }));
    setNewImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Organizer Schedule Conflict Check (Same Day)
      const { data: conflictRes } = await checkOrganizerConflict(formData.date, id);
      if (conflictRes.conflict && !hasConfirmedConflict.current) {
        setConflictData(conflictRes.event);
        setShowConflictModal(true);
        setIsSubmitting(false);
        return;
      }

      const form = new FormData();
      form.append('title', formData.title);
      form.append('organizerName', formData.organizerName);
      form.append('category', formData.category);
      form.append('date', formData.date);
      form.append('registrationDeadline', formData.registrationDeadline);
      form.append('location', formData.location);
      form.append('capacity', capacityType === 'Unlimited' ? 'Unlimited' : formData.capacity);
      form.append('description', formData.description);
      form.append('ticketing', JSON.stringify({
        enabled: formData.enableTickets,
        regularPrice: Number(formData.regularPrice),
        vipPrice: Number(formData.vipPrice),
      }));
      if (newImage) form.append('image', newImage);

      await updateEvent(id, form);
      toast.success('Event updated successfully!');
      navigate('/events');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to update event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceed = () => {
    setShowConflictModal(false);
    hasConfirmedConflict.current = true;
    handleSubmit();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-32 flex justify-center text-gray-500 font-medium">Loading event...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-16 max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/events" className="p-2 rounded-xl bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-zinc-950 tracking-tight">Edit Event</h1>
            <p className="text-gray-500 text-sm">Update event details. Changes are saved immediately.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="text-sm font-black text-gray-500 uppercase tracking-wider">Basic Information</h2>
            
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Event Title <span className="text-rose-500">*</span></label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter event title..."
                required
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:border-amber-400 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Organizer Name <span className="text-rose-500">*</span></label>
              <input
                type="text"
                name="organizerName"
                value={formData.organizerName}
                onChange={handleChange}
                placeholder="Your name or organization"
                required
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:border-amber-400 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Category <span className="text-rose-500">*</span></label>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                required
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:border-amber-400 outline-none transition-all"
              >
                <option value="">Select a category</option>
                {['Academic', 'Social', 'Sports', 'Workshop', 'Seminar', 'Cultural', 'Career', 'Tech', 'Music', 'Art', 'Other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Description <span className="text-rose-500">*</span></label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the event..."
                required
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:border-amber-400 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Time & Location */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="text-sm font-black text-gray-500 uppercase tracking-wider">Time & Location</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Event Date & Time <span className="text-rose-500">*</span></label>
                <input
                  type="datetime-local"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:border-amber-400 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Registration Deadline</label>
                <input
                  type="datetime-local"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:border-amber-400 outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Venue <span className="text-rose-500">*</span></label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Hall A, Main Auditorium..."
                required
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:border-amber-400 outline-none transition-all"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-700">Capacity Setting</label>
                <div className="flex p-1 bg-gray-100 rounded-xl border border-gray-200 w-fit">
                  {['Limited', 'Unlimited'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCapacityType(type)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${capacityType === type ? 'bg-amber-400 text-zinc-950 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              {capacityType === 'Limited' && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="text-sm font-bold text-gray-700">Total Capacity <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="e.g. 200"
                    required
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:border-amber-400 outline-none transition-all"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Image */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="text-sm font-black text-gray-500 uppercase tracking-wider">Event Image</h2>
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
            )}
            <label className="block w-full cursor-pointer border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-amber-400 transition-colors">
              <span className="text-sm text-gray-500 font-medium">Click to {existingImage ? 'replace' : 'upload'} image</span>
              <span className="block text-xs text-gray-400 mt-1">JPG, PNG — max 2MB</span>
              <input type="file" accept="image/jpeg,image/png" onChange={handleImageChange} className="hidden" />
            </label>
            {errors.image && <p className="text-xs text-rose-500 font-bold">{errors.image}</p>}
          </div>

          {/* Ticketing */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-gray-500 uppercase tracking-wider">Ticketing</h2>
                <p className="text-xs text-gray-400 mt-0.5">Enable paid tickets for this event</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="enableTickets" checked={formData.enableTickets} onChange={handleChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-checked:bg-amber-400 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>
            {formData.enableTickets && (
              <div className="grid grid-cols-2 gap-5 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Regular Price (Rs.)</label>
                  <input
                    type="number"
                    name="regularPrice"
                    value={formData.regularPrice}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:border-amber-400 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">VIP Price (Rs.)</label>
                  <input
                    type="number"
                    name="vipPrice"
                    value={formData.vipPrice}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:border-amber-400 outline-none transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Link to="/events" className="flex-1 py-4 text-center rounded-2xl border-2 border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-amber-400 text-zinc-950 py-4 rounded-2xl font-black hover:bg-amber-300 transition-all shadow-lg shadow-amber-200 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <><div className="w-5 h-5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-5 h-5" /> Save Changes</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Conflict Modal */}
      {showConflictModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 transition-all transform scale-100 opacity-100">
            <div className="p-8 md:p-10">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              
              <h2 className="text-2xl font-black text-gray-900 mb-4">Scheduling Conflict</h2>
              <p className="text-gray-600 font-medium mb-6">
                You already have an event on this date. Are you sure you want to proceed?
              </p>

              {conflictData && (
                <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Conflicting Event Details</p>
                  <h3 className="font-bold text-gray-900 mb-1">{conflictData.title}</h3>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      {new Date(conflictData.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      {new Date(conflictData.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      {conflictData.location}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  type="button"
                  onClick={() => setShowConflictModal(false)}
                  className="flex-1 px-6 py-4 rounded-2xl bg-gray-100 text-gray-900 font-bold hover:bg-gray-200 transition-all active:scale-95"
                >
                  Cancel Submission
                </button>
                <button 
                  type="button"
                  onClick={handleProceed}
                  className="flex-1 px-6 py-4 rounded-2xl bg-amber-400 text-zinc-950 font-black hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/20 active:scale-95"
                >
                  Yes, Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditEvent;
