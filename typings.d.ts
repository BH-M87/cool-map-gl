// import { RGBAColor } from '@deck.gl/aggregation-layers';
// import { LayerProps } from '@deck.gl/core/lib/layer';
// import { Position } from '@deck.gl/core/utils/positions';
// import { IconMapping } from '@deck.gl/layers/icon-layer/icon-layer';
// import { default as Texture2D } from '@luma.gl/webgl/classes/texture-2d';
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
  url: string;
  coordinates: Position;
  width?: number;
  height?: number;
  anchorX?: number;
  anchorY?: number;
  // eslint-disable-next-line react/forbid-prop-types
  properties?: AnyObject;
};
type HeatmapData = { COORDINATES: Position; WEIGHT: number };
type PathData = PathLayerProps<unknown> | null | undefined;
// declare module '@deck.gl/layers/icon-layer/icon-layer' {
//   export interface IconLayerProps<D> extends IconLayerProps<D> {
//     /*
//      *  atlas image url or texture
//      */
//     iconAtlas?: Texture2D | string;
//     iconMapping?: IconMapping;
//     sizeScale?: number;
//     fp64?: number;

//     /*
//      *  returns anchor position of the icon, in [lng, lat, z]
//      */
//     getPosition?: (x: D) => Position;

//     /*
//      *  returns icon name as a string
//      */
//     getIcon?:
//       | ((x: D) =>
//           | string
//           | {
//               id: string;
//               url: string;
//               width: number;
//               height: number;
//               anchorX: number;
//               anchorY: number;
//             })
//       | string;

//     /*
//      *  returns color of the icon in [r, g, b, a].
//      *  Only works on icons with mask: true.
//      */
//     getColor?: ((x: D) => RGBAColor) | RGBAColor;

//     /*
//      *  returns icon size multiplier as a number
//      */
//     getSize?: ((x: D) => number) | number;

//     /*
//      *  returns rotating angle (in degree) of the icon.
//      */
//     getAngle?: ((x: D) => number) | number;
//   }
// }
