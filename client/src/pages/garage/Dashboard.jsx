
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiCalendar, FiBriefcase, FiCheckCircle, FiCreditCard, FiStar } from "react-icons/fi";
import StatsCard from "@/components/garage/StatsCard";
import BookingCard from "@/components/garage/BookingCard";
import { setBookings, setServices, setReviews } from "@/store/garageSlice";
import { mockBookings, mockServices, mockReviews } from "@/data/garageData";

export default function GarageDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { garage, bookings, wallet, reviews } = useSelector(state => state.garage);

  useEffect(() => {
    dispatch(setBookings(mockBookings));
    dispatch(setServices(mockServices));
    dispatch(setReviews(mockReviews));
  }, [dispatch]);

  const stats = [
    {
      label: "Today's Bookings",
      value: bookings.filter(b => b.status !== "COMPLETED" && b.status !== "CANCELLED").length,
      icon: FiCalendar,
      color: "brand"
    },
    {
      label: "Active Services",
      value: bookings.filter(b => ["SERVICE_STARTED", "VEHICLE_RECEIVED", "INSPECTION_COMPLETED"].includes(b.status)).length,
      icon: FiBriefcase,
      color: "blue"
    },
    {
      label: "Completed Services",
      value: bookings.filter(b => b.status === "COMPLETED").length + 24,
      icon: FiCheckCircle,
      color: "purple"
    },
    {
      label: "Wallet Balance",
      value: `₹${wallet.balance.toLocaleString()}`,
      icon: FiCreditCard,
      color: "orange"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, {garage?.ownerName?.split(' ')[0]}!</h1>
        <p className="text-muted">Here's what's happening at {garage?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            {...stat}
          />
        ))}
      </div>

      <div className="card-soft p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Ratings & Reviews</h2>
          <div className="flex items-center gap-2">
            <FiStar className="w-6 h-6 text-brand" />
            <span className="text-2xl font-bold">{garage?.rating}</span>
            <span className="text-muted">({garage?.reviewCount} reviews)</span>
          </div>
        </div>
        <div className="space-y-4">
          {reviews.slice(0, 2).map(review => (
            <div key={review.id} className="p-4 bg-bg-soft rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{review.name}</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className={i < review.rating ? "text-brand" : "text-line"} />
                  ))}
                </div>
              </div>
              <p className="text-muted text-sm">{review.comment}</p>
              <p className="text-xs text-muted mt-2">{review.date}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Bookings</h2>
          <button
            onClick={() => navigate("/garage/bookings")}
            className="text-brand font-semibold hover:underline"
          >
            View All
          </button>
        </div>
        <div className="grid gap-4">
          {bookings.slice(0, 3).map(booking => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      </div>

      <div className="card-soft p-6">
        <h2 className="text-xl font-bold mb-4">Revenue Overview</h2>
        <div className="h-48 flex items-center justify-center text-muted">
          Chart placeholder (Revenue chart will appear here)
        </div>
      </div>
    </div>
  );
}
