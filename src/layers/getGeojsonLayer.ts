import { GeoJsonLayer } from '@deck.gl/layers';
// @ts-ignore
import { PathStyleExtension } from '@deck.gl/extensions';
import { GeojsonData } from 'typings';

export default (data?: GeojsonData[] | GeojsonData) => {
  if (data === undefined || data === null) {
    return [];
  }
  const getLayer = (_data: GeojsonData, index = 0) => {
    return new GeoJsonLayer({
      id: `geojson-layer-${index}`,
      ..._data,
      filled: _data.filled === false ? false : true,
      stroked: _data.stroked === false ? false : true,
      opacity: _data.opacity || 1,
      getFillColor: _data.getFillColor || _data.fillColor,
      lineWidthMinPixels: _data.lineWidthMinPixels || 2,
      getLineColor: _data.getLineColor || _data.lineColor,
      getLineWidth: _data.getLineWidth || _data.lineWidth,
      pickable: _data.pickable === false ? false : true,
      ...(_data.dash ? { extensions: [new PathStyleExtension({ dash: true })] } : {}),
    });
  };
  if (Array.isArray(data)) {
    return data.map((item: GeojsonData, index: number) => (item ? getLayer(item, index) : null));
  }
  return [getLayer(data)];
};
