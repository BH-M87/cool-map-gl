// eslint-disable-next-line import/no-extraneous-dependencies
import { PathLayer } from '@deck.gl/layers';
// @ts-ignore
import { PathStyleExtension } from '@deck.gl/extensions';
import { PathData } from 'typings';

export default (data?: PathData[] | undefined | null) => {
  if (data === undefined || data === null) {
    return [];
  }
  const getLayer = (_data: PathData) => {
    return new PathLayer(
      // @ts-ignore
      {
        ..._data,
        ...(_data.dash
          ? {
              extensions: [new PathStyleExtension({ dash: true })],
              getDashArray: _data.getDashArray || [6, 4],
              dashJustified: _data.dashJustified === false ? false : true,
            }
          : {}),
      },
    );
  };
  if (Array.isArray(data)) {
    return data.map((item = {}) => (item ? getLayer(item) : null));
  }
  return [getLayer(data)];
};
