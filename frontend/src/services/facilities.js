export async function searchFacilities({ lat, lng, type = 'all', limit = 10 }) {
  const params = new URLSearchParams({ lat, lng, type, limit });
  const response = await fetch(`/api/facilities?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Unable to load nearby facilities');
  }
  return response.json();
}
