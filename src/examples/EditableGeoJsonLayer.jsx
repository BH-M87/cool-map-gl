import React, { useState } from 'react';
import MapGL, { EditableGeoJsonLayer, DrawPolygonMode } from '..';

const selectedFeatureIndexes = [];
function getData(data) {
  if (data === null) {
    return {
      type: 'FeatureCollection',
      features: [],
    };
  }
  if (!data) {
    return data;
  }
  if (data.type !== 'FeatureCollection') {
    return {
      type: 'FeatureCollection',
      features: data,
    };
  }
  return data;
}

const EditableGeoJson = () => {
  const [data, setData] = useState(null);
  return (
    <MapGL
      layers={[
        new EditableGeoJsonLayer({
          id: 'geojson-layer',
          data: getData(data),
          mode: DrawPolygonMode,
          selectedFeatureIndexes: Array.isArray(selectedFeatureIndexes)
            ? selectedFeatureIndexes
            : [],
          onEdit: ({ updatedData }) => {
            setData(updatedData);
          },
        }),
      ]}
    />
  );
};

EditableGeoJson.propTypes = {};

export default EditableGeoJson;
