import React from 'react';
import MapGL from '..';

const Heatmap = () => {
  return <MapGL heatmapData={[{ COORDINATES: [120.030237, 30.281735], WEIGHT: 100 }]} />;
};

Heatmap.propTypes = {};

export default Heatmap;
