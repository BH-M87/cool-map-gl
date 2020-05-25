import React, { useState } from 'react';
import MapGL from '..';

const EditableGeoJson = () => {
  const [editData, setEditData] = useState(null);
  return (
    <MapGL
      editData={editData}
      editMode="DrawCircleFromCenterMode"
      onEdit={({ updatedData }) => {
        setEditData(updatedData);
      }}
    />
  );
};

EditableGeoJson.propTypes = {};

export default EditableGeoJson;
