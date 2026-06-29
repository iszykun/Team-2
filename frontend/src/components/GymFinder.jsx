export function renderFacilityList(results) {
  if (!results.length) {
    return '<p class="empty-state">No facilities found nearby.</p>';
  }

  return results
    .map((facility) => `
      <article class="card">
        <h3>${facility.name}</h3>
        <p>${facility.type.toUpperCase()}</p>
        <p>${facility.distance_km.toFixed(2)} km away</p>
      </article>
    `)
    .join('');
}
