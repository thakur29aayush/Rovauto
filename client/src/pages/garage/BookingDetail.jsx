
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { FiPhone, FiMessageSquare, FiMapPin, FiClock, FiCheckCircle } from "react-icons/fi";
import ImageUpload from "@/components/garage/ImageUpload";
import { setBookings } from "@/store/garageSlice";

const timelineSteps = [
  { status: "NEW", label: "Booking Created" },
  { status: "ACCEPTED", label: "Booking Accepted" },
  { status: "VEHICLE_RECEIVED", label: "Vehicle Received" },
  { status: "SERVICE_STARTED", label: "Service Started" },
  { status: "COMPLETED", label: "Completed" },
];

export default function GarageBookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { bookings } = useSelector(state => state.garage);
  const [preServiceImages, setPreServiceImages] = useState([]);
  const [postServiceImages, setPostServiceImages] = useState([]);
  const [notes, setNotes] = useState("");
  
  const booking = bookings.find(b => b.id === id) || bookings[0];
  const [status, setStatus] = useState(booking.status);

  const currentStepIndex = timelineSteps.findIndex(s => s.status === status);

  const handleStatusUpdate = (newStatus) => {
    setStatus(newStatus);
    // Update the booking in the Redux store too!
    const updatedBookings = bookings.map(b =>
      b.id === booking.id ? { ...b, status: newStatus } : b
    );
    dispatch(setBookings(updatedBookings));
  };

  // Sync status when booking changes (like when we accept a booking)
  useEffect(() => {
    if (booking && booking.status !== status) {
      setStatus(booking.status);
    }
  }, [booking?.status]);

  const openGoogleMaps = () => {
    const { lat, lng } = booking.customer.location;
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  const renderStatusContent = () => {
    switch (status) {
      case "ACCEPTED":
        return (
          <div className="card-soft p-6">
            <h3 className="text-xl font-bold mb-4">Receive Vehicle</h3>
            <p className="text-muted mb-4">Upload at least 5 photos of the vehicle before starting service</p>
            <ImageUpload
              min={5}
              max={10}
              value={preServiceImages}
              onChange={setPreServiceImages}
            />
            <button
              onClick={() => handleStatusUpdate("VEHICLE_RECEIVED")}
              disabled={preServiceImages.length < 5}
              className="btn-primary w-full mt-6"
            >
              Start Service
            </button>
          </div>
        );
      case "VEHICLE_RECEIVED":
      case "SERVICE_STARTED":
        return (
          <div className="space-y-6">
            <div className="card-soft p-6">
              <h3 className="text-xl font-bold mb-4">Service In Progress</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add service notes..."
                    rows={4}
                    className="w-full p-3 border border-line rounded-xl focus:outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Additional Charges (Optional)</label>
                  <input
                    type="number"
                    placeholder="₹0"
                    className="w-full p-3 border border-line rounded-xl focus:outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Estimated Completion Time</label>
                  <input
                    type="time"
                    className="w-full p-3 border border-line rounded-xl focus:outline-none focus:border-ink"
                  />
                </div>
                {status === "VEHICLE_RECEIVED" ? (
                  <button
                    onClick={() => handleStatusUpdate("SERVICE_STARTED")}
                    className="btn-dark w-full"
                  >
                    Mark Inspection Complete
                  </button>
                ) : (
                  <>
                    <p className="text-muted mb-4">Upload at least 5 photos of the vehicle after service</p>
                    <ImageUpload
                      min={5}
                      max={10}
                      value={postServiceImages}
                      onChange={setPostServiceImages}
                    />
                    <button
                      onClick={() => handleStatusUpdate("COMPLETED")}
                      disabled={postServiceImages.length < 5}
                      className="btn-primary w-full mt-6"
                    >
                      Finish Service
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="card-soft p-6">
              <h3 className="text-xl font-bold mb-4">Live Timeline</h3>
              <div className="space-y-4">
                {timelineSteps.slice(0, currentStepIndex + 1).map((step, index) => (
                  <div key={step.status} className="flex gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      index === currentStepIndex ? "bg-brand text-black" : "bg-line text-muted"
                    }`}>
                      {index < currentStepIndex ? <FiCheckCircle /> : <FiClock />}
                    </div>
                    <div className="pb-4 border-l-2 border-line pl-4 -ml-1 mt-1">
                      <p className="font-semibold">{step.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "INSPECTION_COMPLETED":
      case "READY_FOR_DELIVERY":
        return null; // We don't need this anymore since we moved post-service photos to SERVICE_STARTED
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/garage/bookings")}
        className="text-muted hover:text-ink flex items-center gap-2"
      >
        ← Back to Bookings
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card-soft p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold">{booking.id}</h1>
                <p className="text-muted">{new Date(booking.createdAt).toLocaleDateString()}</p>
              </div>
              <span className="chip-brand">{status.replace("_", " ")}</span>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-bold mb-3">Vehicle Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted">Make & Model:</span> {booking.vehicle.brand} {booking.vehicle.model}</p>
                  <p><span className="text-muted">Year:</span> {booking.vehicle.year}</p>
                  <p><span className="text-muted">Number:</span> {booking.vehicle.number}</p>
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-3">Services</h3>
                <div className="space-y-1 text-sm">
                  {booking.services.map((service, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{service.name}</span>
                      <span className="font-semibold">₹{service.price}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-line mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Estimated Total</span>
                      <span>₹{booking.estimatedBill}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {renderStatusContent()}
        </div>

        <div className="space-y-6">
          <div className="card-soft p-6">
            <h3 className="font-bold mb-4">Customer Details</h3>
            <div className="space-y-3 text-sm mb-4">
              <p><span className="text-muted">Name:</span> <span className="font-semibold">{booking.customer.name}</span></p>
              <p><span className="text-muted">Phone:</span> <span className="font-semibold">{booking.customer.phone}</span></p>
              <p><span className="text-muted">Address:</span> <span className="font-semibold">{booking.customer.address}</span></p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => window.open(`tel:${booking.customer.phone}`, "_blank")}
                className="btn-ghost flex-col gap-2 py-3"
              >
                <FiPhone className="w-5 h-5" />
                <span className="text-xs font-semibold">Call</span>
              </button>
              <button
                onClick={() => window.open(`https://wa.me/${booking.customer.phone.replace(/\D/g, '')}`, "_blank")}
                className="btn-ghost flex-col gap-2 py-3"
              >
                <FiMessageSquare className="w-5 h-5" />
                <span className="text-xs font-semibold">WhatsApp</span>
              </button>
              <button
                onClick={openGoogleMaps}
                className="btn-primary flex-col gap-2 py-3"
              >
                <FiMapPin className="w-5 h-5" />
                <span className="text-xs font-semibold">Navigate</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
