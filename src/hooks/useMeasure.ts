/*
 * @Author: yongju
 * @Date: 2021-07-08 11:59:47
 * @LastEditors: yongju
 * @LastEditTime: 2021-07-08 15:31:19
 * @Description:
 */
// @ts-nocheck

import { useEffect, useState } from 'react';
import { getMeasureLayer } from '../layers/getMeasureLayer';

export const useMeasure = (
  measureConfig = {
    distanceMeasure: false,
    areaMeasure: false,
    mode: -1,
  },
) => {
  const [layers, setLayers] = useState([]);
  const [mode, setMode] = useState(-1);
  const [distance, setDistance] = useState(false);
  const [area, setArea] = useState(false);
  const [geojsonLine, setGeojsonLine] = useState({
    type: 'FeatureCollection',
    features: [],
  });
  const [geojsonPolygon, setGeojsonPolygon] = useState({
    type: 'FeatureCollection',
    features: [],
  });
  const [featureIndexesLine, setFeatureIndexesLine] = useState([]);
  const [featureIndexesPolygon, setFeatureIndexesPolygon] = useState([]);

  const onEditLine = (data) => {
    setGeojsonLine(data.data);
    setFeatureIndexesLine(data.featureIndexes);
  };

  const onEditPolygon = (data) => {
    setGeojsonPolygon(data.data);
    setFeatureIndexesPolygon(data.featureIndexes);
  };

  useEffect(() => {
    if (mode === -1) {
      setGeojsonLine({
        type: 'FeatureCollection',
        features: [],
      });
      setFeatureIndexesLine([]);
      setGeojsonPolygon({
        type: 'FeatureCollection',
        features: [],
      });
      setFeatureIndexesPolygon([]);
    }
  }, [mode]);

  useEffect(() => {
    if ('distanceMeasure' in measureConfig) {
      setDistance(measureConfig.distanceMeasure);
    }
    if ('areaMeasure' in measureConfig) {
      setArea(measureConfig.areaMeasure);
    }
    if ('mode' in measureConfig) {
      setMode(measureConfig.mode);
    }

    return () => {};
  }, [measureConfig]);

  useEffect(() => {
    const activeLine = mode === 1;
    const activePolygon = mode === 2;

    setLayers(
      getMeasureLayer(
        distance,
        area,
        activeLine,
        activePolygon,
        geojsonLine,
        geojsonPolygon,
        featureIndexesLine,
        featureIndexesPolygon,
        onEditLine,
        onEditPolygon,
      ),
    );
  }, [
    mode,
    distance,
    area,
    featureIndexesLine,
    featureIndexesPolygon,
    geojsonLine,
    geojsonPolygon,
  ]);

  return [layers];
};
