'use client'

import { useState } from 'react'
import { CalendarIcon, MapPinIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/outline'

export default function EventsPage() {
  const [events] = useState([
    {
      id: '1',
      title: 'BIG Networking Mixer',
      description: 'Connect with fellow multi-hyphenates in an intimate networking setting.',
      date: '2024-02-15T18:00:00Z',
      location: 'Los Angeles, CA',
      price: 50,
      capacity: 100,
      image: '/Images/663c7a22e233c27b7722622e_big-center_stage-hero__feature.webp',
      availableTickets: 25
    },
    {
      id: '2',
      title: 'Athlete Entrepreneurship Summit',
      description: 'Learn from successful athlete-entrepreneurs and build your business network.',
      date: '2024-03-20T09:00:00Z',
      location: 'New York, NY',
      price: 150,
      capacity: 200,
      image: '/Images/663c7a22e233c27b7722622e_big-center_stage-hero__feature.webp',
      availableTickets: 50
    },
    {
      id: '3',
      title: 'Creator Collective Workshop',
      description: 'Hands-on workshop for content creators and digital entrepreneurs.',
      date: '2024-04-10T14:00:00Z',
      location: 'Miami, FL',
      price: 75,
      capacity: 50,
      image: '/Images/663c7a22e233c27b7722622e_big-center_stage-hero__feature.webp',
      availableTickets: 12
    }
  ])

  const [selectedEvent, setSelectedEvent] = useState(null)
  const [ticketQuantity, setTicketQuantity] = useState(1)

  const handlePurchaseTicket = (eventId) => {
    // TODO: Implement ticket purchase
    alert(`Purchasing ${ticketQuantity} ticket(s) for event ${eventId}`)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">Upcoming Events</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our curated events and connect with the BIG community
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Event Image */}
              <div className="h-48 bg-gray-200 relative">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-blue-900 text-white px-3 py-1 rounded-full text-sm font-medium">
                  ${event.price}
                </div>
              </div>

              {/* Event Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {event.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {event.description}
                </p>

                {/* Event Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    {event.availableTickets} tickets remaining
                  </div>
                </div>

                {/* Purchase Button */}
                <button
                  onClick={() => handlePurchaseTicket(event.id)}
                  disabled={event.availableTickets === 0}
                  className="w-full bg-blue-900 text-white py-2 px-4 rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {event.availableTickets === 0 ? 'Sold Out' : 'Purchase Ticket'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Ticket Purchase Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-semibold mb-4">Purchase Tickets</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <select
                  value={ticketQuantity}
                  onChange={(e) => setTicketQuantity(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {[...Array(Math.min(selectedEvent.availableTickets, 10))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-lg font-semibold mb-4">
                Total: ${selectedEvent.price * ticketQuantity}
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePurchaseTicket(selectedEvent.id)}
                  className="flex-1 bg-blue-900 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors"
                >
                  Purchase
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
