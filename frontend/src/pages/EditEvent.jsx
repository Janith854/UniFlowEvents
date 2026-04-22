import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEventById, updateEvent } from '../services/eventService';
import { BASE_URL } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

import { Link } from 'react-router-dom';

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

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const { data } = await getEventById(id);
        setFormData({
          title: data.title || '',
          organizerName: data.organizerName || '',
          category: data.category || '',
          date: data.date ? new Date(data.date).toISOString().slice(0, 16) : '',
          registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline).toISOString().slice(0, 16) : '',
          location: data.location || '',
          capacity: data.capacity || '',
          description: data.description || '',
          enableTickets: data.ticketing?.enabled || false,
          regularPrice: data.ticketing?.regularPrice ?? '0',
          vipPrice: data.ticketing?.vipPrice ?? '0',
        });
        if (data.image) {
          const imgUrl = data.image.startsWith('http') ? data.image : `${BASE_URL}${data.image}`;
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
    e.preventDefault();
    setIsSubmitting(true);

    const form = new FormData();
    form.append('title', formData.title);
    form.append('organizerName', formData.organizerName);
    form.append('category', formData.category);
    form.append('date', formData.date);
    form.append('registrationDeadline', formData.registrationDeadline);
    form.append('location', formData.location);
    form.append('capacity', formData.capacity);
    form.append('description', formData.description);
    form.append('ticketing', JSON.stringify({
      enabled: formData.enableTickets,
      regularPrice: Number(formData.regularPrice),
      vipPrice: Number(formData.vipPrice),
    }));
    if (newImage) form.append('image', newImage);

    try {
      await updateEvent(id, form);
      toast.success('Event updated successfully!');
      navigate('/events');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to update event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-32 flex justify-center text-gray-500 font-medium">Loading event...</div>
    );
  }

  const InputField = ({ label, name, type = 'text', placeholder, required = false, children }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-gray-700">{label}{required && <span className="text-rose-500 ml-1">*</span>}</label>
      {children || (
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium placeholder:text-gray-300 focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 outline-none transition-all"
        />
      )}
    </div>
  );

  return (
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
            <InputField label="Event Title" name="title" placeholder="Enter event title..." required />
            <InputField label="Organizer Name" name="organizerName" placeholder="Your name or organization" required />
            <InputField label="Category" name="category">
              <select name="category" value={formData.category} onChange={handleChange} required
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:border-amber-400 outline-none transition-all"
              >
                <option value="">Select a category</option>
                {['Sports', 'Music', 'Workshop', 'Seminar', 'Cultural', 'Community', 'Academic', 'Career', 'Miscellaneous'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </InputField>
            <InputField label="Description" name="description">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the event..."
                required
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium placeholder:text-gray-300 focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 outline-none transition-all resize-none"
              />
            </InputField>
          </div>

          {/* Time & Location */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="text-sm font-black text-gray-500 uppercase tracking-wider">Time & Location</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField label="Event Date & Time" name="date" type="datetime-local" required />
              <InputField label="Registration Deadline" name="registrationDeadline" type="datetime-local" />
            </div>
            <InputField label="Venue" name="location" placeholder="Hall A, Main Auditorium..." required />
            <InputField label="Capacity" name="capacity" type="number" placeholder="e.g. 200" required />
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
              <div className="grid grid-cols-2 gap-5">
                <InputField label="Regular Ticket Price (Rs.)" name="regularPrice" type="number" placeholder="0" />
                <InputField label="VIP Ticket Price (Rs.)" name="vipPrice" type="number" placeholder="0" />
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
    </div>
  );
}

export default EditEvent;
