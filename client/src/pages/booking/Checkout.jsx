import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "@/hooks/useApp";
import api from "@/api/axios";
import { isPaymentAuthError, payForBooking } from "@/utils/bookingPayment";
import { FiCheckCircle, FiLock, FiTrash2, FiTruck, FiEdit } from "react-icons/fi";

const DEFAULT_LOCATION = {
  latitude: 28.6369,
  longitude: 77.3696,
  address: "Indirapuram, Ghaziabad, 201014",
};

const getServicePrice = (service) =>
  service.basePrice || service.minPrice || service.price || 0;

const calculateHandlingFee = (totalServiceAmount) => {
  if (totalServiceAmount >= 300 && totalServiceAmount < 1000) return 30;
  if (totalServiceAmount >= 1000 && totalServiceAmount < 5000) return 99;
  if (totalServiceAmount >= 5000 && totalServiceAmount < 20000) return 249;
  if (totalServiceAmount >= 20000) return 500;

  return 99;
};

export default function Checkout() {
  const { cart, vehicle, location, setLocation, user, clearCart, clearBookingCaches } =
    useApp();
  const nav = useNavigate();
  const routeLocation = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    address: location?.address || "",
    area: location?.area || "",
    city: location?.city || "",
    pincode: location?.pincode || "",
  });

  const subTotal = cart.reduce((sum, item) => sum + getServicePrice(item), 0);
  const displaySubTotal = subTotal || 0;
  const fee = cart.length === 0 ? 0 : calculateHandlingFee(displaySubTotal);
  const payAtGarage = displaySubTotal;

  const buildLocationPayload = () => ({
    latitude: location?.latitude || DEFAULT_LOCATION.latitude,
    longitude: location?.longitude || DEFAULT_LOCATION.longitude,
    address:
      location?.address ||
      [location?.area, location?.city, location?.pincode].filter(Boolean).join(", ") ||
      DEFAULT_LOCATION.address,
  });

  const handleAddressChange = (e) => {
    setAddressForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const saveAddress = async () => {
    // Update app location state
    setLocation({
      address: addressForm.address,
      area: addressForm.area,
      city: addressForm.city,
      pincode: addressForm.pincode,
    });

    // Also update user profile
    try {
      const fullAddress = [addressForm.address, addressForm.area, addressForm.city, addressForm.pincode]
        .filter(Boolean).join(", ");
      await api.patch("/customer/profile", {
        address: fullAddress,
      });
    } catch (err) {
      console.error("Failed to save address to profile:", err);
    }

    setEditingAddress(false);
  };

  const pay = async () => {
    if (!vehicle?.id) {
      setError("Please select a vehicle before checkout.");
      nav("/booking/vehicle");
      return;
    }

    if (cart.length === 0) {
      setError("Please add at least one service before checkout.");
      nav("/booking/services");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const bookingRes = await api.post("/bookings/checkout", {
        vehicleId: vehicle.id,
        serviceIds: cart.map((item) => item.id),
        location: {
          latitude: location?.latitude || DEFAULT_LOCATION.latitude,
          longitude: location?.longitude || DEFAULT_LOCATION.longitude,
          address: [addressForm.address, addressForm.area, addressForm.city, addressForm.pincode].filter(Boolean).join(", "),
        },
      });

      const booking = bookingRes.data.data;

      if (booking.payableAmount <= 0 || booking.status === "SEARCHING_GARAGE") {
        clearCart();
        clearBookingCaches?.();
        nav("/tracking", {
          state: { bookingId: booking.id, bookingCode: booking.bookingCode },
        });
        return;
      }

      const verifiedBooking = await payForBooking({ booking, user });

      clearCart();
      clearBookingCaches?.();
      nav("/tracking", {
        state: {
          bookingId: verifiedBooking.id,
          bookingCode: verifiedBooking.bookingCode,
        },
      });
    } catch (err) {
      if (isPaymentAuthError(err)) {
        nav("/login", {
          state: {
            from: routeLocation,
            message: "Please login to continue payment.",
          },
        });
        return;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not complete payment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-x grid gap-8 py-12 lg:grid-cols-[1fr_400px]">
      <div>
        <h1 className="text-3xl font-bold sm:text-4xl">Checkout</h1>
        <p className="mt-1 text-muted">
          Pay a small fee to confirm your booking. Rest pays at garage.
        </p>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="card-soft mt-8 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Delivery Address</h3>
            {!editingAddress && (
              <button
                type="button"
                onClick={() => setEditingAddress(true)}
                className="flex items-center gap-1 text-sm font-medium text-ink"
              >
                <FiEdit /> Edit
              </button>
            )}
          </div>

          {editingAddress ? (
            <div className="grid gap-4">
              <label className="grid gap-1.5 text-sm">
                <span className="font-semibold">Full Address</span>
                <input
                  required
                  name="address"
                  value={addressForm.address}
                  onChange={handleAddressChange}
                  placeholder="House number, Street, Landmark"
                  className="rounded-xl border border-line px-4 py-3 outline-none focus:border-ink"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm">
                  <span className="font-semibold">Area</span>
                  <input
                    required
                    name="area"
                    value={addressForm.area}
                    onChange={handleAddressChange}
                    placeholder="Locality"
                    className="rounded-xl border border-line px-4 py-3 outline-none focus:border-ink"
                  />
                </label>

                <label className="grid gap-1.5 text-sm">
                  <span className="font-semibold">City</span>
                  <input
                    required
                    name="city"
                    value={addressForm.city}
                    onChange={handleAddressChange}
                    placeholder="City"
                    className="rounded-xl border border-line px-4 py-3 outline-none focus:border-ink"
                  />
                </label>
              </div>

              <label className="grid gap-1.5 text-sm">
                <span className="font-semibold">Pincode</span>
                <input
                  required
                  name="pincode"
                  value={addressForm.pincode}
                  onChange={handleAddressChange}
                  placeholder="6-digit pincode"
                  inputMode="numeric"
                  maxLength={6}
                  className="rounded-xl border border-line px-4 py-3 outline-none focus:border-ink"
                />
              </label>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingAddress(false)}
                  className="flex-1 rounded-xl border border-line px-4 py-3 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveAddress}
                  className="flex-1 btn-primary"
                >
                  Save Address
                </button>
              </div>
            </div>
          ) : (
            <div className="text-muted">
              {[addressForm.address, addressForm.area, addressForm.city, addressForm.pincode].filter(Boolean).join(", ") || "No address set"}
            </div>
          )}
        </div>

        <div className="card-soft mt-6 p-6">
          <h3 className="mb-4 text-lg font-semibold">Payment Method</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Cashfree", "UPI, cards, wallets"],
            ].map(([name, description], index) => (
              <label
                key={name}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${
                  index === 0 ? "border-ink bg-bg-soft" : "border-line"
                }`}
              >
                <input
                  type="radio"
                  name="pay"
                  defaultChecked={index === 0}
                  className="mt-1 accent-ink"
                />
                <div>
                  <div className="font-semibold">{name}</div>
                  <div className="text-xs text-muted">{description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="card-soft mt-6 p-6">
          <h3 className="mb-4 text-lg font-semibold">Benefits with this booking</h3>
          <ul className="grid gap-3 text-sm sm:grid-cols-2">
            {[
              "Booking Confirmation",
              "Priority Slot",
              "30-Day Warranty",
              "24x7 Customer Support",
            ].map((benefit) => (
              <li key={benefit} className="flex items-center gap-2">
                <FiCheckCircle className="text-brand-dark" /> {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <aside className="card-soft h-fit p-5 sm:p-6 lg:sticky lg:top-24">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand">
            <FiTruck />
          </span>
          <div className="text-sm">
            <div className="font-semibold">
              {vehicle?.brand || "Hyundai"} {vehicle?.model || "i20"}
            </div>
            <div className="text-xs text-muted">
              {vehicle?.fuelType || vehicle?.fuel || "Petrol"}
            </div>
          </div>
        </div>

        <hr className="my-4 border-line" />

        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="font-semibold">Order Summary</div>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-muted transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <FiTrash2 /> Clear
            </button>
          )}
        </div>
        <div className="grid gap-2 text-sm">
          {cart.length === 0 ? (
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 text-muted">
              <span className="min-w-0 truncate">No services selected</span>
              <span className="whitespace-nowrap text-right">Rs. 0</span>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3"
              >
                <span className="min-w-0 truncate">{item.name}</span>
                <span className="whitespace-nowrap text-right font-semibold">
                  Rs. {getServicePrice(item)}
                </span>
              </div>
            ))
          )}
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 text-muted">
            <span className="min-w-0">Platform fee</span>
            <span className="whitespace-nowrap text-right">Rs. {fee}</span>
          </div>
        </div>

        <hr className="my-4 border-line" />

        <div className="grid gap-2 text-sm">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <span className="text-muted">Pay at garage</span>
            <span className="whitespace-nowrap text-right font-semibold">
              Rs. {payAtGarage}
            </span>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 text-base">
            <span className="font-semibold">Pay now</span>
            <span className="whitespace-nowrap text-right text-xl font-bold">
              Rs. {fee}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={pay}
          disabled={loading}
          className="btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-70"
        >
          <FiLock /> {loading ? "Processing..." : `Pay Rs. ${fee} & Book Slot`}
        </button>
        <div className="mt-3 text-center text-xs text-muted">
          Secured by Cashfree. 100% refund on cancellation
        </div>
      </aside>
    </div>
  );
}
