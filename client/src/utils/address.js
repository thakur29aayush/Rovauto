const compactParts = (parts = []) =>
  parts.map((part) => String(part || '').trim()).filter(Boolean);

export const buildFullAddress = (parts = {}) =>
  compactParts([parts.address, parts.area, parts.city, parts.pincode]).join(', ');

export const parseAddressParts = (fullAddress = '') => {
  const value = String(fullAddress || '').trim();
  if (!value) return { address: '', area: '', city: '', pincode: '' };

  const parts = compactParts(value.split(','));
  const lastPart = parts[parts.length - 1] || '';
  const pincodeMatch = lastPart.match(/\b\d{6}\b/);
  const pincode = pincodeMatch?.[0] || '';
  const withoutPincode = pincode ? parts.slice(0, -1) : parts;

  const city = withoutPincode[withoutPincode.length - 1] || '';
  const area = withoutPincode.length > 1 ? withoutPincode[withoutPincode.length - 2] : '';
  const addressParts = withoutPincode.length > 2 ? withoutPincode.slice(0, -2) : withoutPincode.slice(0, 1);

  return {
    address: addressParts.join(', ') || value,
    area,
    city,
    pincode,
  };
};

export const getDefaultUserLocation = (user) => {
  const locations = Array.isArray(user?.locations) ? user.locations : [];
  return locations.find((item) => item.isDefault) || locations[0] || null;
};

export const getProfileAddress = (user) =>
  user?.customerProfile?.address || user?.address || '';

export const getLocationAddress = (location) => {
  if (!location) return '';
  return location.fullAddress || buildFullAddress(location) || location.address || '';
};

export const getLocationStateFromAddress = (fullAddress = '', base = {}) => {
  const parsed = parseAddressParts(fullAddress);
  const addressText = fullAddress || buildFullAddress(parsed);

  return {
    ...parsed,
    fullAddress: addressText,
    latitude: base?.latitude ?? null,
    longitude: base?.longitude ?? null,
  };
};

export const getLocationStateFromUser = (user, fallbackLocation = null) => {
  const defaultLocation = getDefaultUserLocation(user);
  const addressText =
    defaultLocation?.address ||
    getProfileAddress(user) ||
    getLocationAddress(fallbackLocation);

  if (!addressText) return fallbackLocation || null;

  return getLocationStateFromAddress(addressText, {
    latitude: defaultLocation?.latitude ?? fallbackLocation?.latitude,
    longitude: defaultLocation?.longitude ?? fallbackLocation?.longitude,
  });
};
