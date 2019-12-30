import { interpolateRgb } from 'd3-interpolate';

export const MAX_VALUE = 50000;
const COLOR_CONFIG = {
  0: '#0a5e17',
  [50 / MAX_VALUE]: '#118123',
  [200 / MAX_VALUE]: '#27b22d',
  [500 / MAX_VALUE]: '#7ed321',
  [1200 / MAX_VALUE]: '#c2ff84',
  [2500 / MAX_VALUE]: '#fbfead',
  [4000 / MAX_VALUE]: '#fbe800',
  [8000 / MAX_VALUE]: '#ffc400',
  [15000 / MAX_VALUE]: '#ff5b00',
  [28000 / MAX_VALUE]: '#fb0303',
  1: '#a70f00',
};

const getI = (value, floor, upper) => {
  // 在COLOR_CONFIG相邻两个颜色中取色值
  const i = interpolateRgb(COLOR_CONFIG[floor], COLOR_CONFIG[upper]);
  return i((Number(value) - floor * MAX_VALUE) / (MAX_VALUE * (upper - floor)));
};

export default indicatorValue => {
  const sortedColorConfigKey = Object.keys(COLOR_CONFIG)
    .map(value => Number(value))
    .sort();
  if (indicatorValue <= 0) {
    return COLOR_CONFIG[sortedColorConfigKey[0]];
  }
  const result = sortedColorConfigKey
    .map((key, index) => {
      if (key === 0 || index === 0) {
        return undefined;
      }
      if (indicatorValue < key * MAX_VALUE) {
        return getI(indicatorValue, sortedColorConfigKey[index - 1], key);
      }
      return undefined;
    })
    .find(value => !!value);

  return (
    result ||
    COLOR_CONFIG[sortedColorConfigKey[sortedColorConfigKey.length - 1]]
  );
};
