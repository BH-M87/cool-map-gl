// eslint-disable-next-line import/no-extraneous-dependencies
import { RGBAColor } from '@deck.gl/aggregation-layers/utils/color-utils';
import { LayerInputHandler } from '@deck.gl/core/lib/layer';
import { TripsLayer } from '@deck.gl/geo-layers';
import { TripsLayerProps } from '@deck.gl/geo-layers/trips-layer/trips-layer';
import { TripsData } from 'typings';

export default (
  data?: TripsData[],
  events: {
    onClick?: LayerInputHandler;
    onHover?: LayerInputHandler;
    onDragStart?: LayerInputHandler;
    onDrag?: LayerInputHandler;
    onDragEnd?: LayerInputHandler;
  } = {},
  options: TripsLayerProps<any> & { color?: RGBAColor } = {},
) => {
  if (data === undefined || data === null || (Array.isArray(data) && data.length === 0)) {
    return [];
  }
  const trailLength = options.trailLength || 10;
  return [
    new TripsLayer<TripsData>({
      id: 'trips-layer',
      data,
      getPath: (d) => d.path,
      // deduct start timestamp from each data point to avoid overflow
      getTimestamps: (
        d: TripsData,
        { index, data: _data }: { index: number; data: TripsData[]; target: any },
      ) => (index / _data.length) * trailLength,
      getColor: (d) => d.color || options.color || [45, 103, 240],
      ...options,
      opacity: options.opacity || 0.8,
      widthMinPixels: options.widthMinPixels || 5,
      rounded: options.rounded === false ? false : true,
      trailLength,
      currentTime: options.currentTime || 0,
      ...events,
    }),
  ];
};
