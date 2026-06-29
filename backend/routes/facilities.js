const express = require('express');
const facilities = require('../data/facilities.json');

const router = express.Router();

function calculateDistanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const radiusKm = 6371;
  const deltaLat = toRad(lat2 - lat1);
  const deltaLng = toRad(lng2 - lng1);
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(deltaLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radiusKm * c;
}

function searchFacilities(lat, lng, type = 'all', limit = 10) {
  const requestedLat = Number(lat);
  const requestedLng = Number(lng);
  const normalizedType = String(type || 'all').toLowerCase();
  const normalizedLimit = Math.max(1, Number(limit) || 10);

  return facilities
    .filter((facility) => facility.public !== false)
    .filter((facility) => normalizedType === 'all' || facility.type === normalizedType)
    .map((facility) => ({
      ...facility,
      distance_km: calculateDistanceKm(requestedLat, requestedLng, facility.lat, facility.lng)
    }))
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, normalizedLimit);
}

router.get('/', (req, res) => {
  const { lat, lng, type = 'all', limit = 10 } = req.query;
  const results = searchFacilities(lat, lng, type, limit);
  res.json(results);
});

module.exports = router;
module.exports.searchFacilities = searchFacilities;
