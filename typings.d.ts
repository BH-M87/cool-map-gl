// import { RGBAColor } from '@deck.gl/aggregation-layers';
// import { LayerProps } from '@deck.gl/core/lib/layer';
// import { Position } from '@deck.gl/core/utils/positions';
// import { IconMapping } from '@deck.gl/layers/icon-layer/icon-layer';
// import { default as Texture2D } from '@luma.gl/webgl/classes/texture-2d';
import { RGBAColor } from '@deck.gl/aggregation-layers/utils/color-utils';
import { DataSet } from '@deck.gl/core/lib/layer';
import { GeoJsonLayerProps } from '@deck.gl/layers/geojson-layer/geojson-layer';
import { PathLayerProps } from '@deck.gl/layers/path-layer/path-layer';

declare module '*.css';
declare module '*.less';
declare module '*.png';
declare module '*.svg' {
  export function ReactComponent(props: React.SVGProps<SVGSVGElement>): React.ReactElement;
  const url: string;
  export default url;
}

interface AnyObject {
  [key: string]: any;
}
/** 定义一个任意类型的函数声明 */
type AnyFunction = (...args: any[]) => any;

interface HTMLScriptElement {
  readyState: 'loaded' | 'complete' | undefined;
  onreadystatechange: Function;
}

interface Window {
  env: 'dev' | 'DEV' | 'prod' | 'PRDO' | undefined;
}

type Position = [number, number];

type EditorMode =
  | 'GeoJsonEditMode'
  | 'ModifyMode'
  | 'TranslateMode'
  | 'ScaleMode'
  | 'RotateMode'
  | 'DuplicateMode'
  | 'ExtendLineStringMode'
  | 'SplitPolygonMode'
  | 'ExtrudeMode'
  | 'ElevationMode'
  | 'TransformMode'
  | 'DrawPointMode'
  | 'DrawLineStringMode'
  | 'DrawPolygonMode'
  | 'DrawRectangleMode'
  | 'DrawCircleByDiameterMode'
  | 'DrawCircleFromCenterMode'
  | 'DrawEllipseByBoundingBoxMode'
  | 'DrawEllipseUsingThreePointsMode'
  | 'DrawRectangleUsingThreePointsMode'
  | 'Draw90DegreePolygonMode'
  | 'DrawPolygonByDraggingMode'
  | 'ViewMode'
  | 'MeasureDistanceMode'
  | 'MeasureAreaMode'
  | 'MeasureAngleMode'
  | 'CompositeMode'
  | 'SnappableMode';

type IconData = {
  id?: string;
  url: string;
  coordinates: Position;
  width?: number;
  height?: number;
  anchorX?: number;
  anchorY?: number;
  index?: number;
  getIcon?: AnyFunction;
  getPositio?: AnyFunction;
  // eslint-disable-next-line react/forbid-prop-types
  properties?: AnyObject;
};
type HeatmapData = { COORDINATES: Position; WEIGHT: number };
type PathData = PathLayerProps<unknown> & {
  dash?: Boolean;
};
type TripsData = {
  path: Position[];
  color?: RGBAColor;
  opacity?: number;
  widthMinPixels?: number;
  rounded?: Boolean;
  trailLength?: number;
  currentTime?: number;
};
type GeojsonData = {
  data: string | DataSet<unknown> | Promise<DataSet<unknown>> | undefined;
  fillColor?: RGBAColor;
  lineColor?: RGBAColor;
  lineWidth?: number;
  dash?: Boolean;
} & GeoJsonLayerProps<GeojsonData>;
