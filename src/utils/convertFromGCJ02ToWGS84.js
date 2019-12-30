import { transform, WGS84, GCJ02 } from 'gcoord';

export default data => transform(
  data, // 经纬度坐标
  GCJ02, // 当前坐标系
  WGS84 // 目标坐标系
);
// convertFromGCJ02ToWGS84 = data => ({
//   ...data,
//   features: data.features.map(feature => ({
//     ...feature,
//     geometry: {
//       ...feature.geometry,
//       coordinates: feature.geometry.coordinates.map(coordinate => coordinate.map(coord => transform(
//         coord, // 经纬度坐标
//         GCJ02, // 当前坐标系
//         WGS84 // 目标坐标系
//       ))),
//     },
//   })),
// });
