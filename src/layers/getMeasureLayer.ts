/*
 * @Author: yongju
 * @Date: 2021-07-08 11:12:23
 * @LastEditors: yongju
 * @LastEditTime: 2021-07-08 18:24:11
 * @Description:
 */
// @ts-nocheck
import { EditableGeoJsonLayer as A } from '@nebula.gl/layers';

import { MeasureAreaMode } from './modes/MeasureAreaMode';
import { MeasureDistanceMode } from './modes/MeasureDistanceMode';

export class EditableGeoJsonLayer extends A {
  constructor(options = {}) {
    super(options);
  }

  getModeProps(props) {
    const p = super.getModeProps(props);
    return {
      context:this.context,
      active: props.active,
      ...p,
    };
  }

  getModeType() {
    return this.props.modeType;
  }

  onLayerDblClick(event){
    console.log(123);
  }

  clear() {
    this.setProps({
      active: false,
      data: {
        type: 'FeatureCollection',
        features: [],
      },
      selectedFeatureIndexes: [],
    });
  }
}

export const getMeasureLayer = (
  distance: boolean,
  area: boolean,
  activeLine: boolean,
  activePolygon: boolean,
  geojsonLine,
  geojsonPolygon,
  featureIndexesLine,
  featureIndexesPolygon,
  onEditLine,
  onEditPolygon,
) => {
  const layers = [];
  if (distance) {
    layers.push(
      createMeasureDistanceLayer(activeLine, geojsonLine, featureIndexesLine, onEditLine),
    );
  }
  if (area) {
    layers.push(
      createMeasureAreaLayer(activePolygon, geojsonPolygon, featureIndexesPolygon, onEditPolygon),
    );
  }
  return layers;
};

export function createMeasureDistanceLayer(active, geojson, featureIndexes, onEdit) {
  const layer = new EditableGeoJsonLayer({
    id: 'measure_line',
    active,
    data: geojson,
    mode: MeasureDistanceMode,
    //mode: new _editModes.CompositeMode([new _editModes.DrawLineStringMode(), new _editModes.ModifyMode()]) ,
    selectedFeatureIndexes: featureIndexes,
    modeConfig: {
      map: {
        dragPan: {
          disable: () => {},
          enable: () => {},
        },
      },
      formatTooltip(distance) {
        const number = parseFloat(distance);
        if (number > 1) {
          return ' '.concat(parseFloat(number.toFixed(2)), '').concat('千米 ');
        }
        return ' '.concat(parseFloat((1000 * number).toFixed(2)), ' ').concat('米 ');
      },
    },
    _subLayerProps: {
      geojson: {
        getLineColor: () => {
          return [255, 115, 18];
        },
        _subLayerProps: {
          points: {
            radiusUnits: 'pixels',
            getFillColor: () => {
              return [255, 255, 255];
            },
            getLineColor: () => {
              return [255, 115, 18];
            },
            getRadius: () => {
              return 4;
            },
            getLineWidth: () => {
              return 1;
            },
          },
        },
      },
      tooltips: {
        characterSet: '12345678910|x.千米 平方'.split(''),
        getSize: () => {
          return 16;
        },
        getPixelOffset() {
          return [6, 0];
        },
        sizeScale: 1,
        getColor: () => {
          return [255, 255, 255];
        },
        backgroundColor: [0, 65, 141],
        getTextAnchor: () => {
          return 'start';
        },
      },
      guides: {
        getLineColor: () => {
          return [255, 115, 18];
        },
        _subLayerProps: {
          points: {
            radiusUnits: 'pixels',
            getFillColor: () => {
              return [255, 255, 255];
            },
            getPixelOffset() {
              return [6, 0];
            },
            getLineColor: () => {
              return [255, 115, 18];
            },
            getRadius: () => {
              return 4;
            },
            getLineWidth: () => {
              return 1;
            },
          },
        },
      },
    },

    onEdit: ({ updatedData }) => {
      const selectedFeatureIndexes = updatedData.features.map((feature, index) => {
        return index;
      });
      onEdit({
        data: updatedData,
        featureIndexes: selectedFeatureIndexes,
      });
    },
  });

  return layer;
}

export function createMeasureAreaLayer(active, geojson, featureIndexes, onEdit) {
  const layer = new EditableGeoJsonLayer({
    id: 'measure_polygon',
    active,
    data: geojson,
    mode: MeasureAreaMode,
    selectedFeatureIndexes: featureIndexes,
    modeType: 2,
    modeConfig: {
      map: {
        dragPan: {
          disable: () => {},
          enable: () => {},
        },
      },
      formatTooltip(area) {
        return ` ${parseFloat(area).toFixed(2)} 平方米 `;
      },
    },
    _subLayerProps: {
      geojson: {
        getLineColor: () => {
          return [255, 115, 18];
        },
        getFillColor: () => {
          return [255, 115, 18, 80];
        },
        _subLayerProps: {
          points: {
            radiusUnits: 'pixels',
            getFillColor: () => {
              return [255, 255, 255];
            },
            getLineColor: () => {
              return [255, 115, 18];
            },
            getRadius: () => {
              return 4;
            },
            getLineWidth: () => {
              return 1;
            },
          },
        },
      },
      tooltips: {
        characterSet: '12345678910|x.千米 平方'.split(''),
        getSize: () => {
          return 16;
        },
        getPixelOffset() {
          return [0, 0];
        },
        sizeScale: 1,
        getColor: () => {
          return [255, 255, 255];
        },
        backgroundColor: [0, 65, 141],
        getTextAnchor: () => {
          return 'middle';
        },
      },
      guides: {
        getLineColor: () => {
          return [255, 115, 18];
        },
        getFillColor: () => {
          return [255, 115, 18, 80];
        },
        _subLayerProps: {
          points: {
            radiusUnits: 'pixels',
            getFillColor: () => {
              return [255, 255, 255];
            },
            getPixelOffset() {
              return [0, 0];
            },
            getLineColor: () => {
              return [255, 115, 18];
            },
            getRadius: () => {
              return 4;
            },
            getLineWidth: () => {
              return 1;
            },
          },
        },
      },
    },

    onEdit: ({ updatedData }) => {
      const selectedFeatureIndexes = updatedData.features.map((feature, index) => {
        return index;
      });

      onEdit({
        data: updatedData,
        featureIndexes: selectedFeatureIndexes,
      });
    },
  });

  return layer;
}
