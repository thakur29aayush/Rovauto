const compactParts = (parts = []) =>
  parts.map((part) => String(part || '').trim()).filter(Boolean);

export const buildFullAddress = (parts = {}) =>
  compactParts([parts.address, parts.area, parts.city, parts.pincode]).join(', ');

export const parseAddressParts = (fullAddress = '') => {
  const value = String(fullAddress || '').trim();
  if (!value) return { address: '', area: '', city: '', pincode: '' };

  const parts = compactParts(value.split(','));
  const lastPart = parts[parts.length - 1] || '';
  const pincodeMatch = value.match(/\b\d{5,6}\b/);
  const pincode = pincodeMatch?.[0] || '';
  const withoutPincode = pincode
    ? parts.map((part) => part.replace(pincode, '').trim()).filter(Boolean)
    : parts;

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

export const getAddressPartsFromNominatim = (data = {}) => {
  const address = data.address || {};
  const pincode = address.postcode || '';
  const city =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    address.state_district ||
    '';
  const area =
    address.suburb ||
    address.neighbourhood ||
    address.quarter ||
    address.city_district ||
    address.hamlet ||
    address.road ||
    '';
  const street = compactParts([
    address.house_number,
    address.road,
    address.pedestrian,
    address.footway,
    address.landmark || address.amenity || address.building,
  ]).join(', ');
  const parsedFallback = parseAddressParts(data.display_name || '');

  return {
    address: street || parsedFallback.address || data.display_name || '',
    area: area || parsedFallback.area,
    city: city || parsedFallback.city,
    pincode: pincode || parsedFallback.pincode,
    fullAddress: data.display_name || buildFullAddress(parsedFallback),
  };
};

export const reverseGeocodeCoordinates = async ({ latitude, longitude }) => {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('lat', String(latitude));
  url.searchParams.set('lon', String(longitude));

  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Could not resolve address for current location.');
  }

  return getAddressPartsFromNominatim(await response.json());
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
