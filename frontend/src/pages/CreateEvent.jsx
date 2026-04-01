import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { createEvent } from '../services/eventService';
import toast from 'react-hot-toast';

export function CreateEvent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: 'Other',
    date: '',
    registrationDeadline: '',
    location: '',
    capacity: '',
    description: '',
    regularPrice: '0',
    vipPrice: '0'
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Front-end validation for past dates on deadline
    const deadlineDate = new Date(formData.registrationDeadline);
    const currentDate = new Date();
    currentDate.setHours(0,0,0,0); // normalize

    if (deadlineDate < currentDate) {
      toast.error('Registration Deadline cannot be in the past');
      return;
    }
    
    // Validate deadline is before event date
    const eventDate = new Date(formData.date);
    if (deadlineDate > eventDate) {
      toast.error('Registration Deadline must be before the event date');
      return;
    }

    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('category', formData.category);
      payload.append('date', formData.date);
      payload.append('registrationDeadline', formData.registrationDeadline);
      payload.append('location', formData.location);
      payload.append('capacity', formData.capacity);
      payload.append('description', formData.description);
      payload.append('ticketing', JSON.stringify({
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
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />
      <div className="pt-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Event</h1>
          <p className="text-gray-600 mb-8">Fill out the details below as an organizer.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2">
                  <option value="Academic">Academic</option>
                  <option value="Social">Social</option>
                  <option value="Sports">Sports</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
                <input required type="datetime-local" name="date" value={formData.date} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Registration Deadline</label>
                <input required type="date" name="registrationDeadline" value={formData.registrationDeadline} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location / Venue</label>
                <input required type="text" name="location" value={formData.location} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                <input required type="number" min="1" name="capacity" value={formData.capacity} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Regular Ticket Price ($)</label>
                <input type="number" min="0" name="regularPrice" value={formData.regularPrice} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">VIP Ticket Price ($)</label>
                <input type="number" min="0" name="vipPrice" value={formData.vipPrice} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea required name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2" />
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Image Preview:</p>
                  <img src={imagePreview} alt="Preview" className="w-full max-w-sm rounded-lg shadow-sm border border-gray-200" />
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-4">
              <button type="button" onClick={() => navigate('/events')} className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-6 py-2.5 rounded-lg bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300 transition-colors shadow-sm">
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
