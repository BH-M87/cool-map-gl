/*
 * @Author: yongju
 * @Date: 2021-07-08 19:29:04
 * @LastEditors: yongju
 * @LastEditTime: 2021-07-09 00:01:45
 * @Description: 
 */
/* eslint-disable jsx-a11y/no-static-element-interactions */

import { createDefaultClusterBgImage } from '../layers/ClusterLayer';
import React from 'react';
import { MapGL } from '..';

function getData(){
  return new Array(2000).fill(0).map(()=>{
      return {
          x:120.02487258197095 + (120.03560141802996 - 120.02487258197095) * Math.random(),
          y:30.279418734056463 + (30.28405121126754 - 30.279418734056463) * Math.random(),
          url:"https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png"
      }
  }) 
}

const Cluster = () => {

  
  const clusterLayers = [
    {
      id:"cluster",
      clusterZooms:[14,16],
      getClusterBackgroundImage(){
          return createDefaultClusterBgImage(0,107,238);
      },
      getImage(data:any){
          return data.url;
      },
      getCoords(data:any){
          return [data.x,data.y];
      },
      data:getData()
    },
    {
      id:"cluster1",
      clusterZooms:[14,16],
      getClusterBackgroundImage(){
          return createDefaultClusterBgImage(40,165,135);
      },
      getImage(data:any){
          return data.url;
      },
      getCoords(data:any){
          return [data.x,data.y];
      },
      data:getData()
    },
    {
      id:"cluster3",
      clusterZooms:[14,16],
      getClusterBackgroundImage(){
          return createDefaultClusterBgImage(49,181,255);
      },
      getImage(data:any){
          return data.url;
      },
      getCoords(data:any){
          return [data.x,data.y];
      },
      data:getData()
    }
  ]
  
  return (
    <div style={{ width: 1000, height: 500 }}>
      <MapGL  clusterLayers={clusterLayers} />
    </div>
  );
};

Cluster.propTypes = {};

export default Cluster;


