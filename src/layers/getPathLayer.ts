// eslint-disable-next-line import/no-extraneous-dependencies
import { PathLayer } from '@deck.gl/layers';
import { PathData } from 'typings';

export default (data?: PathData[]) => {
  if (data === undefined || data === null) {
    return [];
  }
  if (Array.isArray(data)) {
    return data.map((item = {}) => (item ? new PathLayer(item) : null));
  }
  return [new PathLayer(data)];
};
