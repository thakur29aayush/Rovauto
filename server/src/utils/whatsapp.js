const DEFAULT_COUNTRY_CODE = "91";

const normalizeWhatsappNumber = (phone, countryCode = DEFAULT_COUNTRY_CODE) => {
  const digits = String(phone || "").replace(/\D/g, "");

  if (!digits) return null;
  if (digits.length === 10) return `${countryCode}${digits}`;
  if (digits.length > 10) return digits.replace(/^0+/, "");

  return null;
};

const createWhatsappLink = (phone, message) => {
  const normalizedNumber = normalizeWhatsappNumber(phone);
  if (!normalizedNumber) return null;

  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${normalizedNumber}${query}`;
};

const addGarageWhatsappLink = (garage, message) => {
  if (!garage) return garage;

  return {
    ...garage,
    whatsappLink: createWhatsappLink(garage.whatsappNo || garage.phone, message),
  };
};

module.exports = {
  addGarageWhatsappLink,
  createWhatsappLink,
  normalizeWhatsappNumber,
};
