import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { HeatmapData } from 'typings';

export default (data?: HeatmapData[] | HeatmapData) => {
  /**
   * Data format:
   * [
   *   {COORDINATES: [-122.42177834, 37.78346622], WEIGHT: 10},
   *   ...
   * ]
   */
  if (data === undefined || data === null) {
    return [];
  }
  const getLayer = (_data: HeatmapData, index: number = 0) =>
    new HeatmapLayer({
      id: `heatmap-layer-${index}`,
      ..._data,
      data: ((_data.data || []) as any[]).filter((_d) => {
        const position = _d.getPosition ? _d.getPosition(_d) : undefined;
        return position && !isNaN(position[0]) && !isNaN(position[1]);
      }),
    });
  if (Array.isArray(data)) {
    return data.map((item = { data: [] }, index) => (item ? getLayer(item, index) : null));
  }
  return [getLayer(data)];
};
