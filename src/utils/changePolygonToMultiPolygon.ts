export default geojson => {
  const features = geojson.features.map(value => {
    if (
      value.geometry.type === 'Polygon' &&
      value.geometry.coordinates.length > 1
    ) {
      return {
        id: value.properties.adcode,
        ...value,
        geometry: {
          type: 'MultiPolygon',
          coordinates: value.geometry.coordinates.map(coor => [coor]),
        },
      };
    }
    return { id: value.properties.adcode, ...value };
  });
  return { ...geojson, features };
};
