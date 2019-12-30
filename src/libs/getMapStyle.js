import { fromJS } from 'immutable';
import defaultMapStyle from '../config/defaultMapStyle';

export default (mapStyle = {}) =>
  fromJS({
    ...defaultMapStyle,
    ...mapStyle,
  });
