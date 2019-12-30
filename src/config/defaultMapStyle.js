export default {
  version: 8,
  sources: {
    rasterTile: {
      type: 'raster',
      tiles: [
        'http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
        // 'https://api.mapbox.com/styles/v1/lth707/cjye3ariq3nxz1cpbsh255fw5/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibHRoNzA3IiwiYSI6ImNqbzRhM25kbTE1YnIzd3BvY2JkYnVpZXkifQ.ZhCTjm2UkNXw2MX4Ns9S_g',
      ],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: 'raster-layer',
      type: 'raster',
      source: 'rasterTile',
    },
  ],
};
