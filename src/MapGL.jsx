import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-extraneous-dependencies
import DeckGL from '@deck.gl/react'; // The deck.gl master module includes all submodules except for `@deck.gl/test-utils`.
import { StaticMap } from 'react-map-gl';
import defaultViewState from './config/defaultViewState';
import getMapStyle from './libs/getMapStyle';
import AutoSizer from './utils/AutoSizer';
import getIconLayer from './layers/getIconLayer';
import getPathLayer from './layers/getPathLayer';
import getEditableGeoJsonLayer from './layers/getEditableGeoJsonLayer';

function MapGL({
  width,
  height,
  mapStyle,
  iconData,
  onIconClick,
  pathData,
  editData,
  editMode,
  onEdit,
  viewState: _viewState,
  onViewStateChange,
  onMapLoad,
  onMapClick,
  onMapHover,
  layers,
}) {
  const [viewState, setViewState] = useState(defaultViewState);

  useEffect(() => {
    if (onViewStateChange) {
      return;
    }
    setViewState(v => ({
      ...v,
      _viewState,
    }));
  }, [_viewState, onViewStateChange]);

  return (
    <AutoSizer width={width} height={height}>
      {({ width: _width, height: _height }) => (
        <DeckGL
          width={_width}
          height={_height}
          useDevicePixels={false}
          viewState={_viewState || viewState}
          controller
          onViewStateChange={({ viewState: vs }) => {
            if (onViewStateChange) {
              onViewStateChange(vs);
              return;
            }
            setViewState(vs);
          }}
          layers={[
            ...getIconLayer(iconData, { onClick: onIconClick }),
            ...getPathLayer(pathData),
            ...(Array.isArray(layers) ? layers : []),
            ...getEditableGeoJsonLayer({ data: editData, mode: editMode }, { onEdit }),
          ]}
          onLoad={onMapLoad}
          onClick={onMapClick}
          onHover={onMapHover}
        >
          <StaticMap key="static-map" mapStyle={getMapStyle(mapStyle)} />
        </DeckGL>
      )}
    </AutoSizer>
  );
}

MapGL.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  mapStyle: PropTypes.shape({
    version: PropTypes.number,
    sources: PropTypes.shape({
      rasterTile: PropTypes.shape({
        type: PropTypes.oneOf(['raster']),
        tiles: PropTypes.arrayOf(PropTypes.string),
        tileSize: PropTypes.number,
      }),
    }),
    layers: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        type: PropTypes.oneOf(['raster']),
        source: PropTypes.string,
      }),
    ),
  }),
  iconData: PropTypes.arrayOf(
    PropTypes.shape({
      image: PropTypes.string,
      coordinates: PropTypes.arrayOf(PropTypes.number).isRequired,
      width: PropTypes.number,
      height: PropTypes.number,
      anchorX: PropTypes.number,
      anchorY: PropTypes.number,
      properties: PropTypes.object,
    }),
  ),
  onIconClick: PropTypes.func,
  pathData: PropTypes.arrayOf(PropTypes.object),
  // eslint-disable-next-line react/forbid-prop-types
  editData: PropTypes.object,
  editMode: PropTypes.oneOf([
    'GeoJsonEditMode',
    'ModifyMode',
    'TranslateMode',
    'ScaleMode',
    'RotateMode',
    'DuplicateMode',
    'ExtendLineStringMode',
    'SplitPolygonMode',
    'ExtrudeMode',
    'ElevationMode',
    'TransformMode',
    'DrawPointMode',
    'DrawLineStringMode',
    'DrawPolygonMode',
    'DrawRectangleMode',
    'DrawCircleByDiameterMode',
    'DrawCircleFromCenterMode',
    'DrawEllipseByBoundingBoxMode',
    'DrawEllipseUsingThreePointsMode',
    'DrawRectangleUsingThreePointsMode',
    'Draw90DegreePolygonMode',
    'DrawPolygonByDraggingMode',
    'ViewMode',
    'MeasureDistanceMode',
    'MeasureAreaMode',
    'MeasureAngleMode',
    'CompositeMode',
    'SnappableMode',
  ]),
  onEdit: PropTypes.func,
  viewState: PropTypes.shape({
    longitude: PropTypes.number,
    latitude: PropTypes.number,
    zoom: PropTypes.number,
  }),
  onViewStateChange: PropTypes.func,
  onMapLoad: PropTypes.func,
  onMapClick: PropTypes.func,
  onMapHover: PropTypes.func,
  // eslint-disable-next-line react/no-unused-prop-types
  layers: PropTypes.arrayOf(PropTypes.object),
};

MapGL.defaultProps = {
  onIconClick: (info, event) => {
    // eslint-disable-next-line no-console
    console.log(info, event);
    // returns a truthy value, the click event is marked as handled
    // and will not bubble up to the onMapClick callback.
    return true;
  },
  onEdit: ({ updatedData, editType, featureIndexes, editContext }) => {
    // eslint-disable-next-line no-console
    console.log({ updatedData, editType, featureIndexes, editContext });
  },
  onMapLoad: () => {
    // eslint-disable-next-line no-console
    console.log('MapGL loaded.');
  },
  onMapClick: (info, event) => {
    // eslint-disable-next-line no-console
    console.log(info, event);
  },
  onMapHover: (info, event) => {
    // eslint-disable-next-line no-console
    // console.log(info, event);
  },
};

export default MapGL;
