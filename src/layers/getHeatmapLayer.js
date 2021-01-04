import { HeatmapLayer } from '@deck.gl/aggregation-layers';

export default data => {
  /**
   * Data format:
   * [
   *   {COORDINATES: [-122.42177834, 37.78346622], WEIGHT: 10},
   *   ...
   * ]
   */
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }
  return [
    new HeatmapLayer({
      id: 'heatmapLayer',
      data,
      getPosition: d => d.COORDINATES,
      getWeight: d => d.WEIGHT,
    }),
  ];
};
