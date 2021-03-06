// eslint-disable-next-line import/no-extraneous-dependencies
import { IconLayer } from '@deck.gl/layers';
import { ICON_SIZE } from '../config/config';

export default (data, events = {}) => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }
  return [
    new IconLayer({
      id: 'icon-layer',
      data: data.filter(d => d.image),
      pickable: true,
      // iconAtlas and iconMapping are required
      // getIcon: return a string
      getIcon: d => ({
        // If for the same icon identifier, getIcon returns different width or height,
        // IconLayer will only apply the first occurrence and ignore the rest of them.
        id: `${d.image}-${d.width || ICON_SIZE}-${d.height || ICON_SIZE}`,
        url: d.image,
        width: d.width || d.height || ICON_SIZE,
        height: d.height || d.width || ICON_SIZE,
        anchorX: d.anchorX, // Default: half width.
        anchorY: d.anchorY, // Default: half height.
      }),
      billboard: false,
      getPosition: d => d.coordinates,
      getSize: d => d.height || d.width || ICON_SIZE,
      transitions: {
        getPosition: 500,
      },
      ...events,
    }),
  ];
};
