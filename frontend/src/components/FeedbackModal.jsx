import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Info, Star } from 'lucide-react';
import { createFeedback } from '../services/feedbackService';
import { getEvents } from '../services/eventService';
import { useAuth } from '../context/AuthContext';

const MAX_COMMENT_LENGTH = 500;

const StarRating = ({ value, onChange, disabled }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={disabled}
        onClick={() => onChange(star)}
        className={`p-1 rounded-full transition-colors ${disabled ? 'cursor-not-allowed opacity-60' : 'hover:bg-amber-50'}`}
        aria-label={`Rate ${star} out of 5`}
      >
        <Star
          className={`w-5 h-5 ${star <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
        />
      </button>
    ))}
  </div>
);

export function FeedbackModal({ isOpen, onClose, events, initialEventId }) {
  const { refreshProfile } = useAuth();
  const closeTimeoutRef = useRef(null);
  const [availableEvents, setAvailableEvents] = useState(Array.isArray(events) ? events : []);
  const [form, setForm] = useState({
    eventId: '',
    overallRating: 0,
    overallComment: '',
    foodRating: 0,
    foodComment: '',
    foodNotApplicable: false,
    parkingRating: 0,
    parkingComment: '',
    parkingNotApplicable: false
  });
  const [status, setStatus] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!Array.isArray(events) || events.length === 0) return;
    setAvailableEvents(events);
  }, [events]);

  useEffect(() => {
    if (!isOpen) return;
    if (Array.isArray(events) && events.length > 0) return;

    let isMounted = true;
    const fetchEvents = async () => {
      try {
        const { data } = await getEvents();
        if (!isMounted) return;
        setAvailableEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load events:', err);
      }
    };

    fetchEvents();
    return () => {
      isMounted = false;
    };
  }, [isOpen, events]);

  useEffect(() => {
    if (!isOpen) return;
    const eventIds = availableEvents.map((event) => event._id);
    const nextEventId = initialEventId && eventIds.includes(initialEventId)
      ? initialEventId
      : (availableEvents[0]?._id || '');

    setForm((prev) => ({ ...prev, eventId: nextEventId }));
    setStatus('');
    setReplyMessage('');
    setFieldErrors({});
  }, [isOpen, availableEvents, initialEventId]);

  useEffect(() => {
    if (isOpen) return;
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, [isOpen]);

  const selectedEvent = useMemo(
    () => availableEvents.find((event) => event._id === form.eventId),
    [availableEvents, form.eventId]
  );

  const validateSubmit = () => {
    const errors = {};
    if (!form.eventId) errors.eventId = 'Event is required.';
    if (form.overallRating < 1) errors.overallRating = 'Overall rating is required.';
    if (!form.foodNotApplicable && form.foodRating < 1) {
      errors.foodRating = 'Food rating is required or mark as not applicable.';
    }
    if (!form.parkingNotApplicable && form.parkingRating < 1) {
      errors.parkingRating = 'Parking rating is required or mark as not applicable.';
    }
    if (form.overallComment.length > MAX_COMMENT_LENGTH) {
      errors.overallComment = `Comment must be under ${MAX_COMMENT_LENGTH} characters.`;
    }
    if (form.foodComment.length > MAX_COMMENT_LENGTH) {
      errors.foodComment = `Comment must be under ${MAX_COMMENT_LENGTH} characters.`;
    }
    if (form.parkingComment.length > MAX_COMMENT_LENGTH) {
      errors.parkingComment = `Comment must be under ${MAX_COMMENT_LENGTH} characters.`;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildPayload = (statusValue) => ({
    eventId: form.eventId,
    status: statusValue,
    overallRating: form.overallRating || null,
    overallComment: form.overallComment,
    foodRating: form.foodNotApplicable ? null : (form.foodRating || null),
    foodComment: form.foodComment,
    foodNotApplicable: form.foodNotApplicable,
    parkingRating: form.parkingNotApplicable ? null : (form.parkingRating || null),
    parkingComment: form.parkingComment,
    parkingNotApplicable: form.parkingNotApplicable
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('');
    setReplyMessage('');

    if (!validateSubmit()) {
      setStatus('Please fix the errors before submitting.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await createFeedback(buildPayload('submitted'));
      setStatus('Feedback submitted successfully.');
      setReplyMessage(data?.replyMessage || '');
      setForm((prev) => ({
        ...prev,
        overallRating: 0,
        overallComment: '',
        foodRating: 0,
        foodComment: '',
        foodNotApplicable: false,
        parkingRating: 0,
        parkingComment: '',
        parkingNotApplicable: false
      }));
      setFieldErrors({});
      if (refreshProfile) {
        await refreshProfile();
      }
      if (onClose) {
        closeTimeoutRef.current = setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      const serverMsg = error.response?.data?.msg || error.response?.data?.error;
      setStatus(serverMsg || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setStatus('');
    setReplyMessage('');
    if (!form.eventId) {
      setStatus('Please select an event before saving a draft.');
      return;
    }

    setLoading(true);
    try {
      await createFeedback(buildPayload('draft'));
      setStatus('Draft saved.');
    } catch (error) {
      console.error('Draft save error:', error);
      const serverMsg = error.response?.data?.msg || error.response?.data?.error;
      setStatus(serverMsg || 'Failed to save draft.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-zinc-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-gray-100 my-10">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900">Submit Feedback</h2>
            <p className="text-xs text-gray-500">{selectedEvent?.title || 'Select an event to continue.'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-sm font-bold"
          >
            Close
          </button>
        </div>
        <div className="p-6">
          {status && (() => {
            const isSuccess = status.toLowerCase().includes('success') || status.toLowerCase().includes('saved');
            return (
              <div className="mb-6 rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg ${
                    isSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {isSuccess ? <CheckCircle2 className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-zinc-900">
                      {isSuccess ? 'Feedback submitted' : 'Submission error'}
                    </p>
                    <p className={`text-sm ${isSuccess ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {status}
                    </p>
                    {isSuccess && replyMessage && (
                      <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Organizer reply</p>
                        <p className="mt-1 text-sm font-medium text-amber-900">{replyMessage}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Event
              </label>
              <select
                name="eventId"
                value={form.eventId}
                onChange={(e) => setForm((prev) => ({ ...prev, eventId: e.target.value }))}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
              >
                {availableEvents.length === 0 && <option value="">No events available</option>}
                {availableEvents.map((event) => (
                  <option key={event._id} value={event._id}>{event.title}</option>
                ))}
              </select>
              {fieldErrors.eventId && <p className="mt-1 text-xs font-bold text-rose-500">{fieldErrors.eventId}</p>}
            </div>

            <div className="border border-gray-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Event Overall</h2>
                <span className="text-xs font-bold text-gray-500">Required</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5)</label>
                <StarRating
                  value={form.overallRating}
                  onChange={(value) => setForm((prev) => ({ ...prev, overallRating: value }))}
                />
                {fieldErrors.overallRating && <p className="mt-1 text-xs font-bold text-rose-500">{fieldErrors.overallRating}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment (optional)</label>
                <textarea
                  name="overallComment"
                  value={form.overallComment}
                  onChange={(e) => setForm((prev) => ({ ...prev, overallComment: e.target.value }))}
                  rows={4}
                  maxLength={MAX_COMMENT_LENGTH}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all resize-none ${fieldErrors.overallComment ? 'border-rose-500 bg-rose-50/10' : 'border-gray-300'}`}
                  placeholder="Share your experience..."
                />
                <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                  <span>{fieldErrors.overallComment || ''}</span>
                  <span>{form.overallComment.length}/{MAX_COMMENT_LENGTH}</span>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Food and Refreshments</h2>
                <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.foodNotApplicable}
                    onChange={(e) => setForm((prev) => ({
                      ...prev,
                      foodNotApplicable: e.target.checked,
                      foodRating: e.target.checked ? 0 : prev.foodRating
                    }))}
                  />
                  Not applicable
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5)</label>
                <StarRating
                  value={form.foodRating}
                  onChange={(value) => setForm((prev) => ({ ...prev, foodRating: value }))}
                  disabled={form.foodNotApplicable}
                />
                {fieldErrors.foodRating && <p className="mt-1 text-xs font-bold text-rose-500">{fieldErrors.foodRating}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment (optional)</label>
                <textarea
                  name="foodComment"
                  value={form.foodComment}
                  onChange={(e) => setForm((prev) => ({ ...prev, foodComment: e.target.value }))}
                  rows={3}
                  maxLength={MAX_COMMENT_LENGTH}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all resize-none ${fieldErrors.foodComment ? 'border-rose-500 bg-rose-50/10' : 'border-gray-300'}`}
                  placeholder="Optional notes about food..."
                />
                <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                  <span>{fieldErrors.foodComment || ''}</span>
                  <span>{form.foodComment.length}/{MAX_COMMENT_LENGTH}</span>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Parking and Transportation</h2>
                <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.parkingNotApplicable}
                    onChange={(e) => setForm((prev) => ({
                      ...prev,
                      parkingNotApplicable: e.target.checked,
                      parkingRating: e.target.checked ? 0 : prev.parkingRating
                    }))}
                  />
                  Not applicable
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5)</label>
                <StarRating
                  value={form.parkingRating}
                  onChange={(value) => setForm((prev) => ({ ...prev, parkingRating: value }))}
                  disabled={form.parkingNotApplicable}
                />
                {fieldErrors.parkingRating && <p className="mt-1 text-xs font-bold text-rose-500">{fieldErrors.parkingRating}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment (optional)</label>
                <textarea
                  name="parkingComment"
                  value={form.parkingComment}
                  onChange={(e) => setForm((prev) => ({ ...prev, parkingComment: e.target.value }))}
                  rows={3}
                  maxLength={MAX_COMMENT_LENGTH}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all resize-none ${fieldErrors.parkingComment ? 'border-rose-500 bg-rose-50/10' : 'border-gray-300'}`}
                  placeholder="Optional notes about parking..."
                />
                <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                  <span>{fieldErrors.parkingComment || ''}</span>
                  <span>{form.parkingComment.length}/{MAX_COMMENT_LENGTH}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={loading}
                className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Save Draft
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-400 text-zinc-950 font-bold py-3 px-6 rounded-lg hover:bg-amber-300 transition-colors shadow-[0_4px_14px_0_rgba(251,191,36,0.39)]"
              >
                {loading ? 'Processing...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
