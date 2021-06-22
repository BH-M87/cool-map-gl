import { GeoJsonLayer } from '@deck.gl/layers';
import { GeojsonData } from 'typings';

export default (data?: GeojsonData[] | GeojsonData) => {
  if (data === undefined || data === null) {
    return [];
  }
  const getLayer = (_data: GeojsonData) => {
    return new GeoJsonLayer({
      id: 'geojson-layer',
      data: _data.data,
      ..._data,
      filled: _data.filled === false ? false : true,
      stroked: _data.stroked === false ? false : true,
      opacity: _data.opacity || 1,
      getFillColor: _data.getFillColor || _data.fillColor,
      lineWidthMinPixels: _data.lineWidthMinPixels || 1,
      getLineColor: _data.getLineColor || _data.lineColor,
      getLineWidth: _data.getLineWidth || _data.lineWidth,
      pickable: _data.pickable === false ? false : true,
    });
  };
  if (Array.isArray(data)) {
    return data.map((item: GeojsonData) => (item ? getLayer(item) : null));
  }
  return [getLayer(data)];
};
