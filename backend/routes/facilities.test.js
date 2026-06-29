const { searchFacilities } = require('./facilities');

describe('searchFacilities', () => {
  test('does not return non-public venues', () => {
    const results = searchFacilities(1.4365, 103.7889, 'all', 20);
    const names = results.map((facility) => facility.name);

    expect(names).not.toContain('Jalan Besar');
    expect(names).not.toContain('Jurong East');
  });

  test('returns only tracks when type is track', () => {
    const results = searchFacilities(1.4365, 103.7889, 'track', 20);

    expect(results.every((facility) => facility.type === 'track')).toBe(true);
  });

  test('sorts results by distance_km ascending', () => {
    const results = searchFacilities(1.4365, 103.7889, 'all', 20);
    const distances = results.map((facility) => facility.distance_km);
    const sortedDistances = [...distances].sort((a, b) => a - b);

    expect(distances).toEqual(sortedDistances);
  });
});
