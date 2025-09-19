'use client'

import { useState } from 'react'
import { TicketIcon, CalendarIcon, MapPinIcon, QrCodeIcon } from '@heroicons/react/24/outline'

export default function TicketsPage() {
  const [tickets] = useState([
    {
      id: '1',
      eventTitle: 'BIG Networking Mixer',
      eventDate: '2024-02-15T18:00:00Z',
      eventLocation: 'Los Angeles, CA',
      status: 'active',
      qrCode: 'QR123456789',
      purchaseDate: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      eventTitle: 'Athlete Entrepreneurship Summit',
      eventDate: '2024-03-20T09:00:00Z',
      eventLocation: 'New York, NY',
      status: 'active',
      qrCode: 'QR987654321',
      purchaseDate: '2024-01-20T14:15:00Z'
    },
    {
      id: '3',
      eventTitle: 'Creator Collective Workshop',
      eventDate: '2024-04-10T14:00:00Z',
      eventLocation: 'Miami, FL',
      status: 'used',
      qrCode: 'QR456789123',
      purchaseDate: '2024-02-01T09:45:00Z'
    }
  ])

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'used':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">My Tickets</h1>
          <p className="text-xl text-gray-600">
            Manage your event tickets and access
          </p>
        </div>

        {/* Tickets List */}
        <div className="space-y-6">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                {/* Ticket Info */}
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <TicketIcon className="h-6 w-6 text-blue-900 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      {ticket.eventTitle}
                    </h3>
                    <span className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {formatDate(ticket.eventDate)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      {ticket.eventLocation}
                    </div>
                    <div className="text-sm text-gray-500">
                      Purchased: {formatDate(ticket.purchaseDate)}
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <QrCodeIcon className="h-8 w-8 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Ticket ID</p>
                      <p className="text-sm text-gray-500 font-mono">{ticket.qrCode}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="ml-6 flex flex-col space-y-2">
                  {ticket.status === 'active' && (
                    <button className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors text-sm">
                      View Details
                    </button>
                  )}
                  <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {tickets.length === 0 && (
          <div className="text-center py-12">
            <TicketIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tickets yet</h3>
            <p className="text-gray-600 mb-6">Start by purchasing tickets to our upcoming events</p>
            <a
              href="/events"
              className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors"
            >
              Browse Events
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
