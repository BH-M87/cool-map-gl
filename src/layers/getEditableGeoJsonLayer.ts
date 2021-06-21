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
import { AnyObject, EditorMode } from 'typings';

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

function getData(data?: any) {
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
  {
    data = undefined,
    mode = 'DrawPolygonMode',
    selectedFeatureIndexes = [],
  }: { data?: AnyObject | null; mode?: EditorMode; selectedFeatureIndexes?: any } = {},
  { onEdit = console.log } = {},
) => {
  if (data === undefined) {
    return [];
  }
  return [
    new EditableGeoJsonLayer({
      id: 'geojson-layer',
      data: getData(data),
      // @ts-ignore
      mode: MODE[mode],
      selectedFeatureIndexes: Array.isArray(selectedFeatureIndexes) ? selectedFeatureIndexes : [],
      onEdit: ({
        updatedData,
        editType,
        featureIndexes,
        editContext,
      }: {
        updatedData: any;
        editType: any;
        featureIndexes: any;
        editContext: any;
      }) => {
        if (onEdit) {
          onEdit({ updatedData, editType, featureIndexes, editContext });
        }
      },
    }),
  ];
};
