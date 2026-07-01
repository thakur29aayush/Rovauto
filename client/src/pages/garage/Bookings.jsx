
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import BookingCard from "@/components/garage/BookingCard";

const statusFilters = ["All", "New", "Accepted", "Vehicle Received", "Service Started", "Completed", "Cancelled"];

export default function GarageBookings() {
  const { bookings } = useSelector(state => state.garage);
  const [activeFilter, setActiveFilter] = useState("All");
  const navigate = useNavigate();

  const filteredBookings = activeFilter === "All"
    ? bookings
    : bookings.filter(b => b.status === activeFilter.replace(" ", "_").toUpperCase());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bookings</h1>
        <p className="text-muted">Manage all your bookings</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
              activeFilter === filter
                ? "bg-brand text-black"
                : "bg-bg-soft text-muted hover:bg-line"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredBookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
          />
        ))}
      </div>
    </div>
  );
}
