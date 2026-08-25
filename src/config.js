// ---------------------------------------------------------------------------
// Standalone prototype configuration
// ---------------------------------------------------------------------------

// The ONLY Firestore collection this standalone touches. It is deliberately
// separate from the main app's `bookings` collection so nothing is shared.
// Remember to allow this collection in firestore.rules (see README.md).
export const COLLECTION = "standalone_bookings";

export const APP_VERSION = "0.1.0-prototype";

// Business identity printed on the invoice header (kept local instead of
// reading the main app's `settings` collection, to stay fully independent).
export const businessConfig = {
  name: "Seroja Corner Homestay",
  location: "Sepang, Selangor",
  phone: "" // optional; shown as "Tel: ..." on the invoice if set
};

// Service types offered. Drives the Type dropdown + calendar colour coding.
export const SERVICE_TYPES = [
  { value: "room", label: "Room" },
  { value: "parking", label: "Parking" }
];

// Maximum number of extended (add-on) services per invoice/booking.
export const MAX_EXTRA_SERVICES = 25;

// Payment status options for the Manual Invoice form.
// NOTE: "Deposit" is stored as `confirmed` so the value stays compatible with
// the main app's existing status vocabulary. Display labels are mapped below.
export const PAYMENT_STATUSES = [
  { value: "checked_out", label: "Checked Out" }, // default
  { value: "checked_in", label: "Checked In" },
  { value: "confirmed", label: "Deposit" }
];

// Turn a stored status value into a human label for the invoice badge.
export const statusLabel = (status) => {
  const map = {
    checked_out: "Checked Out",
    checked_in: "Checked In",
    confirmed: "Deposit",
    pending_payment: "Pending",
    cancelled: "Cancelled"
  };
  return map[status] || (status || "").replace(/_/g, " ");
};

// Invoice heading text based on status.
export const invoiceTitle = (status) => {
  if (status === "confirmed") return "Deposit Receipt";
  if (status === "pending_payment") return "Booking Quote";
  return "Official Receipt";
};
