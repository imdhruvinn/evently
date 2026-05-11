'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { withAdminAuth } from '@/components/hoc/withAuth';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users, FileText, Tag, Image } from 'lucide-react';

function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const categoryOptions = [
    { value: 'CONFERENCE', label: 'Conference' },
    { value: 'WORKSHOP', label: 'Workshop' },
    { value: 'NETWORKING', label: 'Networking' },
    { value: 'SOCIAL', label: 'Social' },
    { value: 'BUSINESS', label: 'Business' },
    { value: 'ENTERTAINMENT', label: 'Entertainment' },
    { value: 'SPORTS', label: 'Sports' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'CULTURAL', label: 'Cultural' },
    { value: 'OTHER', label: 'Other' }
  ];

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    venue: '',
    capacity: '',
    price: '',
    category: 'OTHER' as const,
    tags: '',
    imageUrl: '',
    seatLevelBooking: false
  });

  const [sectionConfig, setSectionConfig] = useState([
    { name: 'General', capacity: 100, price: 500, seatsPerRow: 10, seatType: 'REGULAR' as const },
    { name: 'VIP', capacity: 50, price: 1500, seatsPerRow: 10, seatType: 'VIP' as const }
  ]);

  const addSection = () => {
    setSectionConfig([...sectionConfig, { name: 'New Section', capacity: 50, price: 1000, seatsPerRow: 10, seatType: 'REGULAR' as const }]);
  };

  const updateSection = (index: number, field: string, value: string | number) => {
    const newConfig = [...sectionConfig];
    newConfig[index] = { ...newConfig[index], [field]: value };
    setSectionConfig(newConfig as any);
  };

  const removeSection = (index: number) => {
    if (sectionConfig.length <= 1) return;
    setSectionConfig(sectionConfig.filter((_, i) => i !== index));
  };

const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;

  setFormData(prev => ({
  ...prev,
  [name]: name === "price" ? parseFloat(value) || 0 : value
}));
};

const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, checked } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: checked
  }));
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!formData.name.trim()) {
      setError('Event name is required');
      setLoading(false);
      return;
    }

    if (!formData.venue.trim()) {
      setError('Venue is required');
      setLoading(false);
      return;
    }

    if (!formData.startTime) {
      setError('Start time is required');
      setLoading(false);
      return;
    }

    const totalCapacity = formData.seatLevelBooking ? sectionConfig.reduce((sum, section) => sum + section.capacity, 0) : parseInt(formData.capacity);
    const minPrice = formData.seatLevelBooking ? (sectionConfig.length ? Math.min(...sectionConfig.map(s => s.price)) : 0) : parseFloat(formData.price);

    if (!totalCapacity || totalCapacity <= 0) {
      setError('Valid capacity is required');
      setLoading(false);
      return;
    }

    if (minPrice === undefined || isNaN(minPrice) || minPrice < 0) {
      setError('Valid price is required');
      setLoading(false);
      return;
    }

    // Check if end time is after start time
    if (formData.endTime && new Date(formData.endTime) <= new Date(formData.startTime)) {
      setError('End time must be after start time');
      setLoading(false);
      return;
    }

    try {
      const eventData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        venue: formData.venue.trim(),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
        capacity: totalCapacity,
        price: minPrice,
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        imageUrl: formData.imageUrl.trim() || null,
        seatLevelBooking: formData.seatLevelBooking,
        sectionConfig: formData.seatLevelBooking ? sectionConfig : undefined
      };

      await apiClient.createEvent(eventData);
      router.push('/admin/events');
    } catch (error: any) {
      setError(error.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Set minimum datetime to current time
  const minDateTime = formatDateTimeLocal(new Date());

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/admin/events"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          <p className="mt-1 text-gray-600">
            Fill in the details below to create a new event
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="text-red-600 text-sm">{error}</div>
                </div>
              </div>
            )}

            {/* Event Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Event Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="Enter event name"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="Enter event description (optional)"
              />
            </div>

            {/* Venue */}
            <div>
              <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Venue *
              </label>
              <input
                type="text"
                id="venue"
                name="venue"
                required
                value={formData.venue}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="Enter venue location"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="inline h-4 w-4 mr-1" />
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  id="startTime"
                  name="startTime"
                  required
                  min={minDateTime}
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                />
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="endTime"
                  name="endTime"
                  min={formData.startTime || minDateTime}
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                />
                <p className="mt-1 text-xs text-gray-500">Leave empty if no specific end time</p>
              </div>
            </div>

            {/* Capacity and Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  Capacity *
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  required
                  min="1"
                  value={formData.seatLevelBooking ? sectionConfig.reduce((sum, s) => sum + s.capacity, 0) : formData.capacity}
                  onChange={handleInputChange}
                  disabled={formData.seatLevelBooking}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${formData.seatLevelBooking ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                  placeholder="Maximum attendees"
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.seatLevelBooking ? Math.min(...sectionConfig.map(s => s.price)) || 0 : formData.price}
                  onChange={handleInputChange}
                  disabled={formData.seatLevelBooking}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${formData.seatLevelBooking ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Seating Type */}
            <div className="flex items-center space-x-3 mb-6">
              <input
                type="checkbox"
                id="seatLevelBooking"
                name="seatLevelBooking"
                checked={formData.seatLevelBooking}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="seatLevelBooking" className="text-sm font-medium text-gray-700">
                Enable Seat Selection
              </label>
            </div>
            <p className="mt-0 pt-0 text-xs text-gray-500 mb-4">
              If enabled, users will be able to select specific seats. Otherwise, it is general admission.
            </p>

            {formData.seatLevelBooking && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Seat Section Configuration</h4>
                {sectionConfig.map((section, index) => (
                  <div key={index} className="flex flex-wrap gap-3 mb-4 items-end bg-white p-3 rounded border">
                    <div className="flex-1 min-w-[120px]">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Section Name</label>
                      <input
                        type="text"
                        value={section.name}
                        onChange={(e) => updateSection(index, 'name', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Capacity</label>
                      <input
                        type="number"
                        min="1"
                        value={section.capacity}
                        onChange={(e) => updateSection(index, 'capacity', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={section.price}
                        onChange={(e) => updateSection(index, 'price', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Seats / Row</label>
                      <input
                        type="number"
                        min="1"
                        value={section.seatsPerRow}
                        onChange={(e) => updateSection(index, 'seatsPerRow', parseInt(e.target.value) || 10)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                    <div className="w-28">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={section.seatType}
                        onChange={(e) => updateSection(index, 'seatType', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 text-gray-900 bg-white"
                      >
                        <option value="REGULAR">Regular</option>
                        <option value="VIP">VIP</option>
                        <option value="PREMIUM">Premium</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSection(index)}
                      className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm h-8"
                      disabled={sectionConfig.length <= 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSection}
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"
                >
                  + Add Another Section
                </button>
              </div>
            )}

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="inline h-4 w-4 mr-1" />
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="Enter tags separated by commas (e.g., tech, innovation, startup)"
              />
              <p className="mt-1 text-xs text-gray-500">Separate multiple tags with commas</p>
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                <Image className="inline h-4 w-4 mr-1" />
                Event Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="https://example.com/event-image.jpg"
              />
              <p className="mt-1 text-xs text-gray-500">Optional: Add an image to make your event more appealing</p>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/admin/events"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default withAdminAuth(CreateEventPage);
