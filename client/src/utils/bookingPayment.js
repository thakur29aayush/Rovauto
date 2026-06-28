import api from "@/api/axios";

export const loadRazorpayCheckout = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout"));
    document.body.appendChild(script);
  });

export const payForBooking = async ({ booking, user }) => {
  if (!booking?.id) {
    throw new Error("Booking not found");
  }

  const orderRes = await api.post("/payments/create-order", {
    bookingId: booking.id,
  });

  const { razorpayOrder, keyId } = orderRes.data.data;

  await loadRazorpayCheckout();

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: keyId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "Rovauto",
      description: `Booking ${booking.bookingCode}`,
      order_id: razorpayOrder.id,
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.phone || "",
      },
      notes: {
        bookingId: booking.id,
      },
      handler: async (response) => {
        try {
          const verifyRes = await api.post("/payments/verify", {
            bookingId: booking.id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          resolve(verifyRes.data.data.booking);
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
      theme: {
        color: "#b9f000",
      },
    });

    checkout.open();
  });
};
