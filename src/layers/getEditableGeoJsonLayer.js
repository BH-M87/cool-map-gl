// eslint-disable-next-line import/no-extraneous-dependencies
import {
  EditableGeoJsonLayer,
  GeoJsonEditMode,
  ModifyMode,
  TranslateMode,
  ScaleMode,
  RotateMode,
  DuplicateMode,
  ExtendLineStringMode,
  SplitPolygonMode,
  ExtrudeMode,
  ElevationMode,
  TransformMode,
  DrawPointMode,
  DrawLineStringMode,
  DrawPolygonMode,
  DrawRectangleMode,
  DrawCircleByDiameterMode,
  DrawCircleFromCenterMode,
  DrawEllipseByBoundingBoxMode,
  DrawEllipseUsingThreePointsMode,
  DrawRectangleUsingThreePointsMode,
  Draw90DegreePolygonMode,
  DrawPolygonByDraggingMode,
  ViewMode,
  MeasureDistanceMode,
  MeasureAreaMode,
  MeasureAngleMode,
  CompositeMode,
  SnappableMode,
} from 'nebula.gl';

const MODE = {
  GeoJsonEditMode,
  ModifyMode,
  TranslateMode,
  ScaleMode,
  RotateMode,
  DuplicateMode,
  ExtendLineStringMode,
  SplitPolygonMode,
  ExtrudeMode,
  ElevationMode,
  TransformMode,
  DrawPointMode,
  DrawLineStringMode,
  DrawPolygonMode,
  DrawRectangleMode,
  DrawCircleByDiameterMode,
  DrawCircleFromCenterMode,
  DrawEllipseByBoundingBoxMode,
  DrawEllipseUsingThreePointsMode,
  DrawRectangleUsingThreePointsMode,
  Draw90DegreePolygonMode,
  DrawPolygonByDraggingMode,
  ViewMode,
  MeasureDistanceMode,
  MeasureAreaMode,
  MeasureAngleMode,
  CompositeMode,
  SnappableMode,
};

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

export default (
  { data = null, mode = 'DrawPolygonMode', selectedFeatureIndexes } = {},
  { onEdit } = {},
) => {
  if (data === undefined) {
    return [];
  }
  return [
    new EditableGeoJsonLayer({
      id: 'geojson-layer',
      data: getData(data),
      mode: MODE[mode],
      selectedFeatureIndexes: Array.isArray(selectedFeatureIndexes) ? selectedFeatureIndexes : [],
      onEdit: ({ updatedData, editType, featureIndexes, editContext }) => {
        if (onEdit) {
          onEdit({ updatedData, editType, featureIndexes, editContext });
        }
      },
    }),
  ];
};
