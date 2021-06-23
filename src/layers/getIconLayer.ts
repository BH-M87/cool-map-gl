// eslint-disable-next-line import/no-extraneous-dependencies
import { TransitionTiming } from '@deck.gl/core/lib/layer';
import { Position } from '@deck.gl/core/utils/positions';
import { IconLayer } from '@deck.gl/layers';
import { AnyFunction, IconData } from 'typings';
import { ICON_SIZE } from '../config/config';

export default (
  data?: IconData[],
  events = {},
  { getIcon, getPosition }: { getIcon?: AnyFunction; getPosition?: AnyFunction } = {},
) => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }
  return [
    new IconLayer({
      id: 'icon-layer',
      data: data.filter((_d) => {
        const d = getIcon ? getIcon(_d) : _d;
        return d.url && d.coordinates && !isNaN(d.coordinates[0]) && !isNaN(d.coordinates[1]);
      }),
      pickable: true,
      // iconAtlas and iconMapping are required
      // getIcon: return a string
      getIcon: (d) => {
        if (getIcon) {
          return getIcon(d);
        }
        return {
          // If for the same icon identifier, getIcon returns different width or height,
          // IconLayer will only apply the first occurrence and ignore the rest of them.
          id: d.id || `${d.url}-${d.width || ICON_SIZE}-${d.height || ICON_SIZE}`,
          url: d.url,
          width: d.width || d.height || ICON_SIZE,
          height: d.height || d.width || ICON_SIZE,
          anchorX: d.anchorX,
          anchorY: d.anchorY, // Default: half height.
        } as unknown as string;
      },
      // @ts-ignore
      billboard: false,
      getPosition: (d) => {
        if (getPosition) {
          return getPosition(d);
        }
        return d.coordinates;
      },
      getSize: (d) => d.height || d.width || ICON_SIZE,
      transitions: {
        getPosition: 500 as TransitionTiming,
      },
      ...events,
    }),
  ];
};
