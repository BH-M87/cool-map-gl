import { IconLayer } from '@deck.gl/layers';
import { AnyFunction, IconData } from 'typings';
import { ICON_SIZE } from '../config/config';

export default (
  data?: IconData | IconData[],
  events = {},
  {
    getIcon: defaultGetIcon,
    getPosition: defaultGetPosition,
    getSize: defaultGetSize,
  }: { getIcon?: AnyFunction; getPosition?: AnyFunction; getSize?: AnyFunction } = {},
) => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }
  const getPosition = (d: any) => {
    if (d.getPosition) {
      return d.getPosition(d);
    }
    if (defaultGetPosition) {
      return defaultGetPosition(d);
    }
    return d.coordinates;
  };
  const getLayer = (_data: IconData, index = 0) => {
    const getIcon = _data.getIcon || defaultGetIcon;
    const getSize = _data.getSize || defaultGetSize;
    return new IconLayer({
      id: `icon-layer-${index}`,
      data: (_data.data || []).filter((_d) => {
        const d = getIcon ? getIcon(_d) : _d;
        const position = getPosition(_d);
        return d.url && position && !isNaN(position[0]) && !isNaN(position[1]);
      }),
      pickable: _data.pickable === false ? false : true,
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
      getPosition,
      getSize: (d) => {
        if (getSize) {
          return getSize(d);
        }
        return d.height || d.width || ICON_SIZE;
      },
      // transitions: {
      //   getPosition: 500 as TransitionTiming,
      // },
      ...events,
    });
  };
  if (Array.isArray(data)) {
    return data.map((item = { data: [] }, index) => (item ? getLayer(item, index) : null));
  }
  return [getLayer(data)];
};
