
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FiCheck, FiX } from "react-icons/fi";
import { acceptBooking, declineBooking } from "@/store/garageSlice";

const statusColors = {
  NEW: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  VEHICLE_RECEIVED: "bg-purple-100 text-purple-700",
  SERVICE_STARTED: "bg-brand-soft text-ink",
  INSPECTION_COMPLETED: "bg-pink-100 text-pink-700",
  READY_FOR_DELIVERY: "bg-green-100 text-green-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function BookingCard({ booking }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isNewBooking = booking.status === "NEW";

  const handleAccept = (e) => {
    e.stopPropagation();
    dispatch(acceptBooking(booking.id));
  };

  const handleDecline = (e) => {
    e.stopPropagation();
    dispatch(declineBooking(booking.id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-soft p-5 hover:shadow-lg transition-shadow"
    >
      <div 
        className="cursor-pointer"
        onClick={() => navigate(`/garage/bookings/${booking.id}`)}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-muted text-sm font-medium">{booking.id}</p>
            <h3 className="text-lg font-bold">
              {booking.vehicle.brand} {booking.vehicle.model}
            </h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[booking.status]}`}>
            {booking.status.replace("_", " ")}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="font-medium text-ink">
              {booking.services.map(s => s.name).join(", ")}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">{booking.distance} km away</span>
            <span className="font-bold text-ink">₹{booking.estimatedBill}</span>
          </div>
        </div>
      </div>

      {isNewBooking && (
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            className="flex-1 bg-green-600 text-white hover:bg-green-700 transition-colors px-4 py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <FiCheck className="w-4 h-4" />
            Accept
          </button>
          <button
            onClick={handleDecline}
            className="flex-1 bg-red-600 text-white hover:bg-red-700 transition-colors px-4 py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <FiX className="w-4 h-4" />
            Decline
          </button>
        </div>
      )}
    </motion.div>
  );
}
