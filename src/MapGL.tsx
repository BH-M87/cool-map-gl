import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-extraneous-dependencies
import DeckGL from '@deck.gl/react'; // The deck.gl master module includes all submodules except for `@deck.gl/test-utils`.
import { Layer } from '@deck.gl/core';
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
  AnyFunction,
  AnyObject,
  EditorMode,
  GeojsonData,
  HeatmapData,
  IconData,
  PathData,
  TextData,
  TripsData,
} from 'typings';
import getTripsLayer from './layers/getTripsLayer';
import getGeojsonLayer from './layers/getGeojsonLayer';
import getTextLayer from './layers/getTextLayer';
import { BasicProps, MapGLComponent } from './MapGLComponent';

type State = {
  viewState: any;
  time: number;
};

const DEFAULT_LOOP_LENGTH = 100;
const DEFAULT_TRIPS_ANIMATION_SPEED = 1;

export class MapGL extends PureComponent<BasicProps, State> {
  private animationId?: any;
  constructor(props: Props) {
    super(props);
    const { defaultViewState, viewState } = props;
    this.state = {
      viewState: viewState || defaultViewState || systemDefaultViewState,
      time: 0,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    const { viewState } = nextProps;
    if (
      viewState.longitude !== this.props.viewState.longitude ||
      viewState.latitude !== this.props.viewState.latitude ||
      viewState.zoom !== this.props.viewState.zoom ||
      viewState.pitch !== this.props.viewState.pitch ||
      viewState.bearing !== this.props.viewState.bearing
    ) {
      this.setViewState(viewState);
    }
  }

  componentDidMount() {
    this.animationId = window.requestAnimationFrame(this.animate);
  }

  componentWillUnmount() {
    window.cancelAnimationFrame(this.animationId);
  }

  setViewState = (viewState: any) => {
    this.setState({
      viewState,
    });
  };

  animate = () => {
    const {
      tripsAnimationSpeed = DEFAULT_TRIPS_ANIMATION_SPEED,
      loopLength = DEFAULT_LOOP_LENGTH,
      tripsData,
    } = this.props;
    if (tripsData) {
      this.setState(({ time }) => ({ time: (time + tripsAnimationSpeed) % loopLength }));
    }
  };

  render() {
    const { viewState, time } = this.state;
    return <MapGLComponent {...this.props} viewState={viewState} time={time} setViewState={this.setViewState} />;
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
