// eslint-disable-next-line import/no-extraneous-dependencies
import { PathLayer } from '@deck.gl/layers';

export default data => {
  if (data === undefined || data === null) {
    return [];
  }
  if (Array.isArray(data)) {
    return data.map((item = {}) => new PathLayer(item));
  }
  return [new PathLayer(data)];
};
