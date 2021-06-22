import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-extraneous-dependencies
import DeckGL from '@deck.gl/react'; // The deck.gl master module includes all submodules except for `@deck.gl/test-utils`.
import { Layer } from '@deck.gl/core';
import { isEqual } from 'lodash-es';
import { InteractiveState, PickInfo } from '@deck.gl/core/lib/deck';
import { StaticMap } from 'react-map-gl';
import systemDefaultViewState from './config/systemDefaultViewState';
import getMapStyle from './libs/getMapStyle';
import AutoSizer from './utils/AutoSizer';
import getIconLayer from './layers/getIconLayer';
import getPathLayer from './layers/getPathLayer';
import getHeatmapLayer from './layers/getHeatmapLayer';
import getEditableGeoJsonLayer from './layers/getEditableGeoJsonLayer';
import {
  AnyObject,
  EditorMode,
  GeojsonData,
  HeatmapData,
  IconData,
  PathData,
  TripsData,
} from 'typings';
import getTripsLayer from './layers/getTripsLayer';
import getGeojsonLayer from './layers/getGeojsonLayer';

type Props = {
  width?: number;
  height?: number;
  mapStyle?: {
    version?: number;
    sources?: {
      rasterTile: {
        type: string;
        tiles: string[];
        tileSize: number;
      };
    };
    layers?: {
      id: string;
      type: string;
      source: string;
    };
  };
  iconData?: IconData[];
  onIconClick?: Function;
  pathData?: PathData[];
  geojsonData: GeojsonData | GeojsonData[];
  heatmapData?: HeatmapData[];
  tripsData?: TripsData[];
  editData?: AnyObject;
  editMode?: EditorMode;
  onEdit?: ({
    updatedData,
    editType,
    featureIndexes,
    editContext,
  }: {
    updatedData: any;
    editType: any;
    featureIndexes: any;
    editContext: any;
  }) => void;
  viewState?: any;
  defaultViewState?: any;
  onViewStateChange?: Function;
  onMapLoad?: () => any;
  onMapClick?: <D>(info: PickInfo<D>, pickedInfos: PickInfo<D>[], e: MouseEvent) => any;
  onMapHover?: <D>(info: PickInfo<D>, pickedInfos: PickInfo<D>[], e: MouseEvent) => any;
  getCursor: ((interactiveState: InteractiveState) => string) | undefined;
  layers?: Layer<any>;
  children: JSX.Element | JSX.Element[];
};

type State = {
  viewState: any;
};

export class MapGL extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    const { defaultViewState, viewState } = props;
    this.state = { viewState: viewState || defaultViewState || systemDefaultViewState };
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    const { viewState } = nextProps;
    if (!isEqual(nextProps.viewState, this.props.viewState)) {
      this.setState({
        viewState,
      });
    }
  }

  render() {
    const {
      width,
      height,
      mapStyle,
      iconData,
      onIconClick,
      geojsonData,
      pathData,
      heatmapData,
      tripsData,
      editData,
      editMode,
      onEdit,
      viewState: _viewState,
      onViewStateChange,
      onMapLoad,
      onMapClick,
      onMapHover,
      getCursor,
      layers,
      children,
    } = this.props;
    const { viewState } = this.state;

    return (
      <AutoSizer width={width} height={height}>
        {({ width: _width, height: _height }) => (
          <DeckGL
            width={_width}
            height={_height}
            useDevicePixels={false}
            viewState={viewState}
            getCursor={getCursor}
            controller
            onViewStateChange={({ viewState: vs }) => {
              if (onViewStateChange) {
                onViewStateChange(vs);
                if (_viewState) {
                  return;
                }
              }
              this.setState({
                viewState: vs,
              });
            }}
            layers={[
              ...getGeojsonLayer(geojsonData),
              ...getIconLayer(iconData, { onClick: onIconClick }),
              ...getPathLayer(pathData),
              ...getHeatmapLayer(heatmapData),
              ...getTripsLayer(tripsData),
              ...(Array.isArray(layers) ? layers : []),
              ...getEditableGeoJsonLayer({ data: editData, mode: editMode }, { onEdit }),
            ]}
            onLoad={onMapLoad}
            onClick={onMapClick}
            onHover={onMapHover}
          >
            <StaticMap key="static-map" mapStyle={getMapStyle(mapStyle)} />
            {children}
          </DeckGL>
        )}
      </AutoSizer>
    );
  }
}

// MapGL.propTypes = {
//   width: PropTypes.number,
//   height: PropTypes.number,
//   mapStyle: PropTypes.shape({
//     version: PropTypes.number,
//     sources: PropTypes.shape({
//       rasterTile: PropTypes.shape({
//         type: PropTypes.oneOf(['raster']),
//         tiles: PropTypes.arrayOf(PropTypes.string),
//         tileSize: PropTypes.number,
//       }),
//     }),
//     layers: PropTypes.arrayOf(
//       PropTypes.shape({
//         id: PropTypes.string,
//         type: PropTypes.oneOf(['raster']),
//         source: PropTypes.string,
//       }),
//     ),
//   }),
//   iconData: PropTypes.arrayOf(
//     PropTypes.shape({
//       image: PropTypes.string,
//       coordinates: PropTypes.arrayOf(PropTypes.number).isRequired,
//       width: PropTypes.number,
//       height: PropTypes.number,
//       anchorX: PropTypes.number,
//       anchorY: PropTypes.number,
//       // eslint-disable-next-line react/forbid-prop-types
//       properties: PropTypes.object,
//     }),
//   ),
//   onIconClick: PropTypes.func,
//   pathData: PropTypes.arrayOf(PropTypes.object),
//   heatmapData: PropTypes.arrayOf(
//     PropTypes.shape({
//       COORDINATES: PropTypes.arrayOf(PropTypes.number),
//       WEIGHT: PropTypes.number,
//     }),
//   ),
//   // eslint-disable-next-line react/forbid-prop-types
//   editData: PropTypes.object,
//   editMode: PropTypes.oneOf([
//     'GeoJsonEditMode',
//     'ModifyMode',
//     'TranslateMode',
//     'ScaleMode',
//     'RotateMode',
//     'DuplicateMode',
//     'ExtendLineStringMode',
//     'SplitPolygonMode',
//     'ExtrudeMode',
//     'ElevationMode',
//     'TransformMode',
//     'DrawPointMode',
//     'DrawLineStringMode',
//     'DrawPolygonMode',
//     'DrawRectangleMode',
//     'DrawCircleByDiameterMode',
//     'DrawCircleFromCenterMode',
//     'DrawEllipseByBoundingBoxMode',
//     'DrawEllipseUsingThreePointsMode',
//     'DrawRectangleUsingThreePointsMode',
//     'Draw90DegreePolygonMode',
//     'DrawPolygonByDraggingMode',
//     'ViewMode',
//     'MeasureDistanceMode',
//     'MeasureAreaMode',
//     'MeasureAngleMode',
//     'CompositeMode',
//     'SnappableMode',
//   ]),
//   onEdit: PropTypes.func,
//   viewState: PropTypes.shape({
//     longitude: PropTypes.number,
//     latitude: PropTypes.number,
//     zoom: PropTypes.number,
//   }),
//   onViewStateChange: PropTypes.func,
//   onMapLoad: PropTypes.func,
//   onMapClick: PropTypes.func,
//   onMapHover: PropTypes.func,
//   // eslint-disable-next-line react/no-unused-prop-types
//   layers: PropTypes.arrayOf(PropTypes.object),
// };

// MapGL.defaultProps = {
//   onIconClick: (info: any, event: any) => {
//     // eslint-disable-next-line no-console
//     console.log(info, event);
//     // returns a truthy value, the click event is marked as handled
//     // and will not bubble up to the onMapClick callback.
//     return true;
//   },
//   onEdit: ({
//     updatedData,
//     editType,
//     featureIndexes,
//     editContext,
//   }: {
//     updatedData: any;
//     editType: any;
//     featureIndexes: any;
//     editContext: any;
//   }) => {
//     // eslint-disable-next-line no-console
//     console.log({ updatedData, editType, featureIndexes, editContext });
//   },
//   onMapLoad: () => {
//     // eslint-disable-next-line no-console
//     console.log('MapGL loaded.');
//   },
//   onMapClick: (info: any, event: any) => {
//     // eslint-disable-next-line no-console
//     console.log(info, event);
//   },
//   onMapHover: (info: any, event: any) => {
//     // eslint-disable-next-line no-console
//     // console.log(info, event);
//   },
// };

export default MapGL;
