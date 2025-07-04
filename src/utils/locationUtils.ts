// src/utils/locationUtils.ts
export const extractLocationDetails = (
  place: google.maps.places.PlaceResult
): { city: string; state: string; country: string } => {
  const addressComponents = place.address_components || [];

  let city = '';
  let state = '';
  let country = '';

  addressComponents.forEach((component) => {
    const types = component.types;
    if (types.includes('locality')) {
      city = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      state = component.long_name;
    } else if (types.includes('country')) {
      country = component.long_name;
    }
  });

  return { city, state, country };
};
export function extractStateFromAddress(addressComponents: google.maps.GeocoderAddressComponent[]): string | null {
  const stateComponent = addressComponents.find(
    (component) => component.types.includes('administrative_area_level_1')
  );
  return stateComponent?.long_name || null;
}

// Google Places Autocomplete helpers
export const extractAddressComponents = (place: google.maps.places.PlaceResult) => {
  const components: any = {
    address: place.formatted_address || '',
    city: '',
    state: '',
    zip: '',
  };

  place.address_components?.forEach((component) => {
    const types = component.types;
    if (types.includes('locality')) {
      components.city = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      components.state = component.long_name;
    } else if (types.includes('postal_code')) {
      components.zip = component.long_name;
    }
  });

  return components;
};