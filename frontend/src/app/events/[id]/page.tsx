"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/Toast";
import { Event } from "@/types";
import { Navbar } from "@/components/Navbar";
import SeatSelection from "@/components/SeatSelection";
import CongratulationsPopup from "@/components/CongratulationsPopup";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  CreditCard,
  Info,
  Tag,
} from "lucide-react";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [lastBooking, setLastBooking] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [seatRefreshTrigger, setSeatRefreshTrigger] = useState(0);

  const eventId = params?.id as string;

  const getCategoryColor = (category: string) => {
    const colors = {
      CONFERENCE: "bg-blue-100 text-blue-800",
      WORKSHOP: "bg-green-100 text-green-800",
      NETWORKING: "bg-purple-100 text-purple-800",
      SOCIAL: "bg-pink-100 text-pink-800",
      BUSINESS: "bg-gray-100 text-gray-800",
      ENTERTAINMENT: "bg-yellow-100 text-yellow-800",
      SPORTS: "bg-orange-100 text-orange-800",
      EDUCATION: "bg-indigo-100 text-indigo-800",
      CULTURAL: "bg-red-100 text-red-800",
      OTHER: "bg-gray-100 text-gray-800",
    };
    return colors[category as keyof typeof colors] || colors.OTHER;
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return numPrice === 0 ? "Free" : numPrice.toFixed(2);
  };

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const response = await apiClient.getEvent(eventId);

        // Handle different response structures from backend
        const responseData = (response as any)?.data || response;
        const eventData = responseData?.event || responseData;
        const userStatus = responseData?.userStatus || null;
        const availability = responseData?.availability || null;

        // Combine all data into the event object
        const fullEventData = {
          ...eventData,
          userStatus,
          availability,
          _count: {
            ...(eventData._count || { bookings: 0 }),
            waitlist: availability?.waitlistCount || 0,
          },
        };

        setEvent(fullEventData);
      } catch (error) {
        console.error("Failed to load event:", error);
        setError("Event not found");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const completeBookingSuccess = async (bookingDetails: any) => {
    setLastBooking(bookingDetails);
    showToast(`Successfully booked ${bookingDetails.ticketCount} ticket(s)!`, "success");
    setShowCongratulations(true);
    
    setQuantity(1);
    setSelectedSeats([]);
    setTotalPrice(0);
    
    setEvent(prev => prev ? {
      ...prev,
      availableCapacity: Math.max(0, prev.availableCapacity - bookingDetails.ticketCount)
    } : prev);
    
    // Fetch updated data in background
    apiClient.getEvent(eventId).then(updatedResponse => {
      const updatedEvent = (updatedResponse as any)?.data?.event || updatedResponse;
      setEvent(updatedEvent);
    }).catch(console.error);
    setSeatRefreshTrigger((prev) => prev + 1);
  };

  const processPaymentAndComplete = async (bookingId: string, finalAmount: number, bookingDetails: any) => {
    return new Promise<void>(async (resolve, reject) => {
      if (finalAmount <= 0) {
        await completeBookingSuccess(bookingDetails);
        resolve();
        return;
      }
      
      try {
        showToast("Initializing payment...", "info");
        const orderResponse = await apiClient.createPaymentOrder(bookingId);
        const orderData = (orderResponse as any)?.data || orderResponse;
        
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Evently",
          description: `Payment for ${event?.name}`,
          order_id: orderData.orderId,
          handler: async function (response: any) {
            try {
              showToast("Verifying payment...", "info");
              await apiClient.verifyPayment({
                bookingId: bookingId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });
              await completeBookingSuccess(bookingDetails);
              resolve();
            } catch (err: any) {
              setError("Payment verification failed");
              showToast("Payment verification failed", "error");
              reject(err);
            }
          },
          prefill: {
            name: user?.name || "Customer",
            email: user?.email || "customer@example.com",
            contact: "9999999999"
          },
          config: {
            display: {
              blocks: {
                upi: {
                  name: "Pay via UPI",
                  instruments: [
                    { method: "upi" }
                  ]
                },
                other: {
                  name: "Other Methods",
                  instruments: [
                    { method: "card" },
                    { method: "netbanking" },
                    { method: "wallet" }
                  ]
                }
              },
              sequence: ["block.upi", "block.other"],
              preferences: {
                show_default_blocks: false,
              },
            },
          },
          theme: {
            color: "#2563eb"
          },
          modal: {
            ondismiss: function() {
              showToast("Payment cancelled", "error");
              resolve();
            }
          }
        };
        
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setError(`Payment failed: ${response.error.description}`);
          showToast(`Payment failed: ${response.error.description}`, "error");
          reject(new Error("Payment failed"));
        });
        rzp.open();
      } catch (err: any) {
        setError("Failed to initialize payment");
        showToast("Failed to initialize payment", "error");
        reject(err);
      }
    });
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!event) {
      setError("Event not found");
      return;
    }

    // Validate booking based on event type
    if (event.seatLevelBooking) {
      if (selectedSeats.length === 0) {
        setError("Please select at least one seat");
        return;
      }
    } else {
      if (quantity <= 0) {
        setError("Invalid quantity");
        return;
      }
      if (quantity > event.availableCapacity) {
        setError(`Only ${event.availableCapacity} tickets available`);
        return;
      }
    }

    setBookingLoading(true);
    setError("");
    setSuccess("");

    try {
      let response;

      if (event.seatLevelBooking && selectedSeats.length > 0) {
        // Book specific seats (asynchronous)
        response = await apiClient.bookSeats({
          eventId: event.id,
          seatIds: selectedSeats,
          idempotencyKey: `${user?.id}-${event.id}-${Date.now()}`,
        });

        const responseData = (response as any)?.data || response;
        const jobId = responseData.jobId;

        if (jobId) {
          // Show processing message
          showToast("Processing your seat booking...", "info");

          // Poll for booking status
          const pollBookingStatus = async (
            jobId: string,
            maxAttempts = 30
          ): Promise<boolean> => {
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
              try {
                const statusResponse = await apiClient.checkBookingStatus(
                  jobId
                );
                const statusData = (statusResponse as any)?.data;

                if (statusData?.success) {
                  // Booking successful, now process payment
                  const finalAmount = statusData.totalPrice || parseFloat(calculateTotalPrice());
                  await processPaymentAndComplete(
                    statusData.bookingId || jobId,
                    finalAmount,
                    {
                      id: statusData.bookingId || jobId,
                      eventName: event.name,
                      ticketCount: selectedSeats.length,
                      totalPrice: finalAmount
                    }
                  );
                  return true;
                } else if (
                  statusData?.message &&
                  !statusData.message.includes("processing")
                ) {
                  // Booking failed
                  showToast(statusData.message || "Booking failed", "error");
                  return false;
                }

                // Still processing, wait and retry
                await new Promise((resolve) => setTimeout(resolve, 200));
              } catch (error) {
                console.error("Error checking booking status:", error);
                await new Promise((resolve) => setTimeout(resolve, 200));
              }
            }

            // Timeout
            showToast(
              "Booking is taking longer than expected. Please check your bookings.",
              "info"
            );
            return false;
          };
          await pollBookingStatus(jobId);
        }
      } else {
        // Regular booking (synchronous)
        const bookingData = {
          eventId: event.id,
          quantity,
          totalPrice: calculateTotalPrice(),
        };
        response = await apiClient.createBooking(bookingData);

        if (response) {
          const responseData = (response as any)?.data || response;
          const booking = responseData.booking || responseData;
          
          const finalAmount = parseFloat(calculateTotalPrice());
          await processPaymentAndComplete(
            booking.id,
            finalAmount,
            {
              id: booking.id,
              eventName: event.name,
              ticketCount: quantity,
              totalPrice: finalAmount
            }
          );
        }
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create booking";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!event) {
      setError("Event not found");
      return;
    }

    setBookingLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiClient.joinWaitlist(event.id);

      if (response?.status === "success") {
        const position = response?.data?.waitlistEntry?.position || "?";
        showToast(
          `You've been added to the waitlist at position #${position}!`,
          "success"
        );

        // Refresh event data to update waitlist status
        const updatedResponse = await apiClient.getEvent(eventId);
        const updatedEventData =
          (updatedResponse as any)?.data || updatedResponse;

        // Parse the response properly
        const updatedEvent = updatedEventData?.event || updatedEventData;
        const userStatus = updatedEventData?.userStatus || null;
        const availability = updatedEventData?.availability || null;

        // Combine data
        const fullEventData = {
          ...updatedEvent,
          userStatus,
          availability,
          _count: {
            ...(updatedEvent._count || { bookings: 0 }),
            waitlist: availability?.waitlistCount || 0,
          },
        };

        setEvent(fullEventData);
        setSuccess(
          `You've successfully joined the waitlist at position #${position}. We'll notify you when a spot becomes available.`
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to join waitlist";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSeatsSelected = useCallback(
    (seatIds: string[], price: number) => {
      setSelectedSeats(seatIds);
      setTotalPrice(price);
    },
    []
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate total price based on event type
  const calculateTotalPrice = () => {
    if (!event) return "0.00";
    if (event.seatLevelBooking && selectedSeats.length > 0) {
      return totalPrice.toFixed(2);
    }
    return (parseFloat(event.price) * quantity).toFixed(2);
  };

  if (loading) {
    return (
      <div style={{minHeight:'100vh',background:'var(--bg-primary)'}}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading event details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div style={{minHeight:'100vh',background:'var(--bg-primary)'}}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-600 text-lg font-medium mb-4">{error}</div>
            <Link
              href="/events"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-primary)',position:'relative'}}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar />

      <div style={{maxWidth:'900px',margin:'0 auto',padding:'36px 24px'}}>
        {/* Back Button */}
        <div style={{marginBottom:'20px'}}>
          <Link href="/events" style={{display:'inline-flex',alignItems:'center',gap:'6px',color:'#94a3b8',textDecoration:'none',fontSize:'14px',fontWeight:500}}>
            <ArrowLeft style={{width:'15px',height:'15px'}}/> Back to Events
          </Link>
        </div>

        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'20px',overflow:'hidden',backdropFilter:'blur(10px)'}}>
          {/* Event Image */}
          {event.imageUrl && (
            <div className="w-full h-64 md:h-80 relative">
              <Image
                src={event.imageUrl}
                alt={event.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Event Header */}
          <div className="px-6 py-8 border-b border-gray-200" style={{borderColor:'rgba(255,255,255,0.07)'}}>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <h1 style={{fontSize:'28px',fontWeight:800,color:'#f1f5f9',marginBottom:'16px'}}>{event.name}</h1>

                {/* Category and Tags */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {event.category && (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(
                        event.category
                      )}`}
                    >
                      {event.category}
                    </span>
                  )}
                  {event.tags && event.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag, index) => (
                          <span
                            key={index}
                            style={{padding:'3px 10px',background:'rgba(255,255,255,0.06)',color:'#94a3b8',borderRadius:'6px',fontSize:'11px'}}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'20px'}}>
                  {[{Icon:Calendar,text:formatDate(event.startTime)},{Icon:MapPin,text:event.venue},{Icon:Users,text:`${event.availableCapacity} of ${event.capacity} spots available`}].map(({Icon,text},i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',fontSize:'14px',color:'#94a3b8'}}>
                      <Icon style={{width:'16px',height:'16px',color:'#6366f1',flexShrink:0}}/><span>{text}</span>
                    </div>
                  ))}
                  {event.endTime&&<div style={{fontSize:'13px',color:'#64748b',marginLeft:'26px'}}>Ends: {formatDate(event.endTime)}</div>}
                </div>

                <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
                  <span style={{fontSize:'30px',fontWeight:900,background:'linear-gradient(135deg,#6366f1,#3b82f6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>₹{formatPrice(event.price)}</span>
                  <span style={{padding:'4px 14px',borderRadius:'999px',fontSize:'12px',fontWeight:700,background:event.availableCapacity>0?'rgba(16,185,129,0.12)':'rgba(239,68,68,0.12)',color:event.availableCapacity>0?'#6ee7b7':'#fca5a5',border:`1px solid ${event.availableCapacity>0?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'}`}}>
                    {event.availableCapacity>0?'Available':'Sold Out'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Event Description */}
          <div style={{padding:'24px 32px',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
            <h2 style={{fontSize:'18px',fontWeight:700,color:'#f1f5f9',marginBottom:'12px'}}>About This Event</h2>
            <div style={{color:'#94a3b8',lineHeight:'1.7',fontSize:'14px'}}>
              {event.description?<p style={{margin:0}}>{event.description}</p>:<p style={{margin:0,color:'#475569',fontStyle:'italic'}}>No description available.</p>}
            </div>
          </div>

          {/* Booking Section */}
          {event.availableCapacity > 0 && (
            <div style={{padding:'24px 32px'}}>
              <h2 style={{fontSize:'18px',fontWeight:700,color:'#f1f5f9',marginBottom:'16px'}}>Book Your Tickets</h2>

              {error&&<div style={{marginBottom:'14px',padding:'12px 16px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'10px',color:'#fca5a5',fontSize:'13px',display:'flex',alignItems:'center',gap:'8px'}}><Info style={{width:'15px',height:'15px',flexShrink:0}}/>{error}</div>}
              {success&&<div style={{marginBottom:'14px',padding:'12px 16px',background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.25)',borderRadius:'10px',color:'#6ee7b7',fontSize:'13px',display:'flex',alignItems:'center',gap:'8px'}}><Info style={{width:'15px',height:'15px',flexShrink:0}}/>{success}</div>}

                <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'14px',padding:'20px'}}>
                {/* Seat Selection for seat-level booking events */}
                {event.seatLevelBooking ? (
                  <div className="space-y-6">
                    <SeatSelection
                      eventId={event.id}
                      onSeatsSelected={handleSeatsSelected}
                      maxSeats={10}
                      refreshTrigger={seatRefreshTrigger}
                    />

                    {selectedSeats.length>0&&(
                      <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'14px'}}>
                        <div style={{fontSize:'12px',color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'10px'}}>Order Summary</div>
                        <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',color:'#94a3b8',marginBottom:'8px'}}><span>Selected seats</span><span>{selectedSeats.length}</span></div>
                        <div style={{display:'flex',justifyContent:'space-between',fontSize:'15px',fontWeight:700,color:'#f1f5f9',borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:'8px'}}><span>Total</span><span style={{color:'#6ee7b7'}}>₹{totalPrice.toFixed(2)}</span></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'16px'}}>
                    <div>
                      <label htmlFor="quantity" style={{display:'block',fontSize:'12px',fontWeight:600,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'8px'}}>Number of Tickets</label>
                      <input id="quantity" type="number" min="1" max={Math.min(event.availableCapacity,10)} value={quantity}
                        onChange={e=>{const v=parseInt(e.target.value);if(v>=1&&v<=Math.min(event.availableCapacity,10))setQuantity(v);}}
                        onBlur={e=>{const v=parseInt(e.target.value);if(isNaN(v)||v<1)setQuantity(1);else if(v>Math.min(event.availableCapacity,10))setQuantity(Math.min(event.availableCapacity,10));}}
                        disabled={bookingLoading}
                        style={{width:'100%',padding:'10px 14px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'9px',color:'#f1f5f9',fontSize:'15px',outline:'none',boxSizing:'border-box'}}/>
                      <div style={{fontSize:'11px',color:'#475569',marginTop:'4px'}}>Max {Math.min(event.availableCapacity,10)} tickets</div>
                    </div>
                    <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'14px'}}>
                      <div style={{fontSize:'12px',color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'10px'}}>Order Summary</div>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',color:'#94a3b8',marginBottom:'6px'}}><span>Per ticket</span><span>₹{formatPrice(event.price)}</span></div>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',color:'#94a3b8',marginBottom:'8px'}}><span>Quantity</span><span>{quantity}</span></div>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:'16px',fontWeight:700,color:'#f1f5f9',borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:'8px'}}><span>Total</span><span style={{color:'#6ee7b7'}}>₹{calculateTotalPrice()}</span></div>
                    </div>
                  </div>
                )}

                <div style={{marginTop:'18px'}}>
                  {isAuthenticated?(
                    <button onClick={handleBooking} disabled={bookingLoading||(event.seatLevelBooking&&selectedSeats.length===0)}
                      style={{width:'100%',padding:'13px 24px',background:'linear-gradient(135deg,#6366f1,#3b82f6)',color:'white',border:'none',borderRadius:'12px',fontSize:'15px',fontWeight:700,cursor:bookingLoading?'not-allowed':'pointer',opacity:bookingLoading?0.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',boxShadow:'0 0 20px rgba(99,102,241,0.35)'}}>
                      <CreditCard style={{width:'18px',height:'18px'}}/>
                      {bookingLoading?'Processing…':event.seatLevelBooking?`Book ${selectedSeats.length} Seat${selectedSeats.length!==1?'s':''}`:`Book ${quantity} Ticket${quantity>1?'s':''}`}
                    </button>
                  ):(
                    <Link href="/login" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',padding:'13px 24px',background:'linear-gradient(135deg,#6366f1,#3b82f6)',color:'white',borderRadius:'12px',fontSize:'15px',fontWeight:700,textDecoration:'none',boxShadow:'0 0 20px rgba(99,102,241,0.35)'}}>
                      Sign In to Book
                    </Link>
                  )}
                  {isAuthenticated&&<p style={{fontSize:'12px',color:'#475569',textAlign:'center',marginTop:'10px'}}>Your booking will be confirmed immediately with a confirmation email.</p>}
                </div>
              </div>
            </div>
          )}

          {/* Sold Out Message with Waitlist Option */}
          {event.availableCapacity === 0 && (
            <div style={{padding:'24px 32px'}}>
              <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'14px',padding:'24px',textAlign:'center'}}>
                <h3 style={{fontSize:'18px',fontWeight:700,color:'#fca5a5',marginBottom:'8px'}}>Event Sold Out</h3>

                {success && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md" style={{background:'rgba(16,185,129,0.1)',borderColor:'rgba(16,185,129,0.2)'}}>
                    <div className="flex items-center justify-center">
                      <Info className="h-5 w-5 text-green-600 mr-2" style={{color:'#34d399'}} />
                      <p className="text-green-600 text-sm" style={{color:'#34d399'}}>{success}</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md" style={{background:'rgba(239,68,68,0.1)',borderColor:'rgba(239,68,68,0.2)'}}>
                    <div className="flex items-center justify-center">
                      <Info className="h-5 w-5 text-red-600 mr-2" style={{color:'#f87171'}} />
                      <p className="text-red-600 text-sm" style={{color:'#f87171'}}>{error}</p>
                    </div>
                  </div>
                )}

                {!isAuthenticated ? (
                  <>
                    <p className="text-red-600 mb-4" style={{color:'#fca5a5'}}>
                      This event has reached its capacity. You can join the
                      waitlist to be notified if spots become available.
                    </p>
                    <Link
                      href={`/login?redirect=/events/${eventId}`}
                      className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 mr-3"
                    >
                      Sign In to Join Waitlist
                    </Link>
                  </>
                ) : event.userStatus?.waitlistPosition ? (
                  <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md mb-4" style={{background:'rgba(234,179,8,0.1)',color:'#fbbf24'}}>
                    <p className="font-semibold mb-1">
                      🎯 You're on the waitlist!
                    </p>
                    <p className="text-lg">
                      Position #{event.userStatus.waitlistPosition} in line
                    </p>
                    <p className="text-sm mt-2">
                      We'll notify you immediately if a spot becomes available.
                    </p>
                    {event._count?.waitlist && (
                      <p className="text-xs mt-1">
                        {event._count.waitlist} total people on waitlist
                      </p>
                    )}
                  </div>
                ) : event.userStatus?.hasBooking ? (
                  <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4" style={{background:'rgba(16,185,129,0.1)',color:'#34d399'}}>
                    <p className="font-semibold">
                      ✅ You already have a ticket for this event!
                    </p>
                  </div>
                ) : event.userStatus?.canJoinWaitlist !== false ? (
                  <>
                    <p className="text-red-600 mb-4" style={{color:'#fca5a5'}}>
                      This event has reached its capacity. Join the waitlist to
                      be notified if spots become available.
                    </p>
                    <button
                      onClick={handleJoinWaitlist}
                      disabled={bookingLoading}
                      className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                    >
                      {bookingLoading ? "Processing..." : "📝 Join Waitlist"}
                    </button>
                    {event._count?.waitlist ? (
                      <p className="text-sm text-gray-600 mb-4" style={{color:'#94a3b8'}}>
                        {event._count.waitlist} people are currently on the
                        waitlist
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="text-red-600 mb-4" style={{color:'#fca5a5'}}>
                    This event has reached its capacity. Check back later or
                    explore other events.
                  </p>
                )}

                <Link
                  href="/events"
                  className="inline-flex items-center px-4 py-2 mt-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Browse Other Events
                </Link>
              </div>
            </div>
          )}

          {/* Waitlist Status Section - Show if user is on waitlist */}
          {event.userStatus?.waitlistPosition &&
            event.availableCapacity > 0 && (
              <div style={{padding:'28px 32px',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6" style={{background:'rgba(234,179,8,0.1)',borderColor:'rgba(234,179,8,0.2)'}}>
                  <div className="flex items-center mb-3">
                    <div className="bg-yellow-500 text-white rounded-full p-2 mr-3">
                      <Users className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-yellow-800" style={{color:'#fbbf24'}}>
                      You're on the Waitlist
                    </h3>
                  </div>
                  <div className="text-yellow-700">
                    <p className="mb-2">
                      <strong>
                        Position #{event.userStatus.waitlistPosition}
                      </strong>{" "}
                      in line
                    </p>
                    <p className="text-sm">
                      Even though tickets are currently available, you'll be
                      notified when it's your turn or if you want to book
                      directly.
                    </p>
                    {event._count?.waitlist && (
                      <p className="text-xs mt-2 text-yellow-600">
                        {event._count.waitlist} total people on waitlist
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Congratulations Popup */}
      {showCongratulations && lastBooking && (
        <CongratulationsPopup
          isOpen={showCongratulations}
          onClose={() => setShowCongratulations(false)}
          eventName={lastBooking.eventName}
          ticketCount={lastBooking.ticketCount}
          bookingId={lastBooking.id}
          totalPrice={lastBooking.totalPrice}
        />
      )}
    </div>
  );
}
