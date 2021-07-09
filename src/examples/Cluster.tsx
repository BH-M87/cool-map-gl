/*
 * @Author: yongju
 * @Date: 2021-07-08 19:29:04
 * @LastEditors: yongju
 * @LastEditTime: 2021-07-09 02:32:57
 * @Description:
 */
/* eslint-disable jsx-a11y/no-static-element-interactions */

import { createDefaultClusterBgImage } from '../layers/ClusterLayer';
import React from 'react';
import { MapGL } from '..';
import { PolygonLayer } from '@deck.gl/layers';

function getData() {
  return new Array(2000).fill(0).map(() => {
    return {
      x: 120.02487258197095 + (120.03560141802996 - 120.02487258197095) * Math.random(),
      y: 30.279418734056463 + (30.28405121126754 - 30.279418734056463) * Math.random(),
      url: 'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
    };
  });
}

const Cluster = () => {
  const clusterLayers = [
    {
      id: 'cluster',
      clusterZooms: [14, 16],
      getSize() {
        return 50;
      },
      getClusterBackgroundImage() {
        return createDefaultClusterBgImage(0, 107, 238);
      },
      getIcon(data: any) {
        return data.url;
      },
      getPosition(data: any) {
        return [data.x, data.y];
      },
      data: getData(),
    },
    {
      id: 'cluster1',
      clusterZooms: [14, 16],
      getClusterBackgroundImage() {
        return createDefaultClusterBgImage(40, 165, 135);
      },
      getSize() {
        return 50;
      },

      getIcon(data: any) {
        return data.url;
      },
      getPosition(data: any) {
        return [data.x, data.y];
      },
      data: getData(),
    },
    {
      id: 'cluster3',
      clusterZooms: [14, 16],
      etSize() {
        return 50;
      },
      getClusterBackgroundImage() {
        return createDefaultClusterBgImage(49, 181, 255);
      },
      getIcon(data: any) {
        return data.url;
      },
      getPosition(data: any) {
        return [data.x, data.y];
      },
      data: getData(),
    },
  ];

  const layer = new PolygonLayer({
    id: 'polygon-layer',
    data: [
      {
        type: 'Polygon',
        coordinates: [
          [
            [119.41864013671875, 29.707139348134145],
            [120.47882080078125, 29.707139348134145],
            [120.47882080078125, 30.529145036680408],
            [119.41864013671875, 30.529145036680408],
            [119.41864013671875, 29.707139348134145],
          ],
        ],
      },
    ],
    pickable: true,
    stroked: true,
    filled: true,
    wireframe: true,
    lineWidthMinPixels: 1,
    getPolygon: (d) => d.coordinates,
    getFillColor: (d) => [255, 0, 0, 100],
    getLineColor: [80, 80, 80],
    getLineWidth: 1,
  });

  return (
    <div style={{ width: 1000, height: 500 }}>
      <MapGL
        layers={[layer]}
        onIconClick={(a, b) => {
          console.log(a, b);
        }}
        clusterLayers={clusterLayers}
      />
    </div>
  );
};

Cluster.propTypes = {};

export default Cluster;
