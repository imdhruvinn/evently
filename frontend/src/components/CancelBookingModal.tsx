'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  booking: {
    id: string;
    eventName: string;
    quantity: number;
    totalPrice: number;
    isSeatLevel: boolean;
  } | null;
}

export default function CancelBookingModal({
  isOpen,
  onClose,
  onConfirm,
  booking
}: CancelBookingModalProps) {
  const [cancelQuantity, setCancelQuantity] = useState<number>(1);

  useEffect(() => {
    if (isOpen && booking) {
      setCancelQuantity(booking.quantity);
    }
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const isPartialAllowed = !booking.isSeatLevel && booking.quantity > 1;
  const pricePerTicket = booking.totalPrice / booking.quantity;
  const refundAmount = pricePerTicket * cancelQuantity;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Cancel Booking</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel your booking for "{booking.eventName}"? 
              </p>
              
              {isPartialAllowed ? (
                <div className="mb-6">
                  <label htmlFor="cancelQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                    How many tickets would you like to cancel?
                  </label>
                  <select
                    id="cancelQuantity"
                    value={cancelQuantity}
                    onChange={(e) => setCancelQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    {Array.from({ length: booking.quantity }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'ticket' : 'tickets'} {num === booking.quantity ? '(All)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="mb-6 bg-gray-50 p-3 rounded-md text-sm text-gray-700">
                  {booking.isSeatLevel 
                    ? "Partial cancellation is not available for events with assigned seating. This will cancel all your tickets."
                    : `This will cancel your ticket.`}
                </div>
              )}

              <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-green-800 mb-1">Refund Information</h4>
                <div className="flex justify-between text-sm text-green-700 mt-2">
                  <span>Tickets to Cancel:</span>
                  <span className="font-semibold">{cancelQuantity}</span>
                </div>
                <div className="flex justify-between text-sm text-green-700 mt-1">
                  <span>Estimated Refund:</span>
                  <span className="font-semibold">₹{refundAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
                >
                  Keep Tickets
                </button>
                <button
                  onClick={() => {
                    onConfirm(cancelQuantity);
                    onClose();
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors font-medium flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Cancel Tickets
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
