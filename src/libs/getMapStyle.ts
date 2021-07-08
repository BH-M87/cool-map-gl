/*
 * @Author: yongju
 * @Date: 2021-07-08 17:16:54
 * @LastEditors: yongju
 * @LastEditTime: 2021-07-08 22:27:38
 * @Description: 
 */

import defaultMapStyle from '../config/defaultMapStyle';

export default (mapStyle = {}) =>
  ({
    ...defaultMapStyle,
    ...mapStyle,
  });
