import React, { memo, useState, useMemo, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-extraneous-dependencies
import DeckGL from '@deck.gl/react'; // The deck.gl master module includes all submodules except for `@deck.gl/test-utils`.
import { Layer } from '@deck.gl/core';
import { LineLayer } from '@deck.gl/layers';
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
import { useMeasure } from './hooks/useMeasure';
import { useCluster } from './hooks/useCluster';

import { fromJS } from 'immutable';
import { MapboxLayer } from '@deck.gl/mapbox';

export type BasicProps = {
  width?: number;
  height?: number;
  mapStyle?: {
    version?: number;
    sources?: {
      rasterTile: {
        type: string;
        tiles: string[];
        tileSize: number;
      };
    };
    layers?: {
      id: string;
      type: string;
      source: string;
    };
  };
  iconData?: IconData[];
  iconOptions?: { getIcon?: AnyFunction; getPosition?: AnyFunction; getSize?: AnyFunction };
  onIconClick?: AnyFunction;
  pathData?: PathData[];
  textData?: TextData[];
  geojsonData: GeojsonData | GeojsonData[];
  heatmapData?: HeatmapData[];
  tripsData?: TripsData[];
  tripsAnimationSpeed: number;
  trailLength: number;
  loopLength: number;
  editData?: AnyObject;
  editMode?: EditorMode;
  onEdit?: ({
    updatedData,
    editType,
    featureIndexes,
    editContext,
  }: {
    updatedData: any;
    editType: any;
    featureIndexes: any;
    editContext: any;
  }) => void;
  viewState?: any;
  initialViewState?: any;
  defaultViewState?: any;
  onViewStateChange?: AnyFunction;
  onMapLoad?: AnyFunction;
  onStaticMapLoad?: AnyFunction;
  onMapClick?: <D>(info: PickInfo<D>, pickedInfos: PickInfo<D>[], e: MouseEvent) => any;
  onMapHover?: <D>(info: PickInfo<D>, pickedInfos: PickInfo<D>[], e: MouseEvent) => any;
  getCursor: ((interactiveState: InteractiveState) => string) | undefined;
  layers?: Layer<any>;
  topLayers?: Layer<any>;
  bottomLayers?: Layer<any>;
  children: JSX.Element | JSX.Element[];
  measureConfig: {
    distanceMeasure: boolean;
    areaMeasure: boolean;
    mode: number;
  };
  clusterLayers: any[];
};

type ExtraProps = {
  viewState: any;
  time: number;
  setViewState: (vs: any) => void;
};

type Props = BasicProps & ExtraProps;

const DEFAULT_TRAIL_LENGTH = 100;

export const MapGLComponent = memo(
  ({
    width,
    height,
    initialViewState,
    mapStyle,
    iconData,
    iconOptions,
    onIconClick,
    geojsonData,
    pathData,
    textData,
    heatmapData,
    tripsData,
    trailLength = DEFAULT_TRAIL_LENGTH,
    editData,
    editMode,
    onEdit,
    viewState: _viewState,
    onViewStateChange,
    onMapLoad,
    onStaticMapLoad,
    onMapClick,
    onMapHover,
    getCursor,
    topLayers,
    layers,
    bottomLayers,
    children,
    viewState,
    setViewState,
    time,
    measureConfig,
    clusterLayers,
  }: Props) => {
    const [map, setMap] = useState<any>(null);
    const deckRef = useRef<any>(null);
    const mapRef = useRef<any>(null);
    const [glContext, setGLContext] = useState();
    const [measureLayers] = useMeasure(measureConfig);
    const [clusterMapStyle] = useCluster(clusterLayers, map, setViewState, onIconClick);

    const mapStyleMerged = useMemo(() => {
      const mapStyleMerged: any = getMapStyle(mapStyle);

      if (mapStyleMerged && clusterMapStyle) {
        mapStyleMerged.layers = [
          ...(mapStyleMerged.layers || []),
          ...(clusterMapStyle.layers || []),
        ];
        mapStyleMerged.sources = {
          ...(mapStyleMerged.sources || {}),
          ...(clusterMapStyle.sources || {}),
        };
      }
      return fromJS(mapStyleMerged);
    }, [mapStyle, clusterMapStyle]);
    const mergeLayers = [
      ...(Array.isArray(bottomLayers) ? bottomLayers : []),
      ...getGeojsonLayer(geojsonData),
      ...getIconLayer(iconData, { onClick: onIconClick }, iconOptions),
      ...getPathLayer(pathData),
      ...getHeatmapLayer(heatmapData),
      ...getTripsLayer(
        (tripsData || []).map((data) => ({
          trailLength,
          ...data,
          currentTime: time,
        })),
      ),
      ...getTextLayer(textData),
      ...(Array.isArray(layers) ? layers : []),
      ...getEditableGeoJsonLayer({ data: editData, mode: editMode }, { onEdit }),
      ...measureLayers,
      ...(Array.isArray(topLayers) ? topLayers : []),
    ];
    if (!mergeLayers.length) {
      mergeLayers.push(
        new LineLayer({
          id: 'empty-layer',
          data: [],
          pickable: true,
          getWidth: 50,
          getSourcePosition: (d: any) => d.coordinates,
          getTargetPosition: (d: any) => d.coordinates,
          getColor: (d) => [0, 140, 0],
        }),
      );
    }
    const onMapboxMapLoad = useCallback((event: any) => {
      const map = mapRef.current?.getMap();
      const deck = deckRef.current?.deck;
      map.addLayer({
        id: 'background',
        type: 'background',
        paint: {
          'background-opacity': 0,
        },
      });
      if (onStaticMapLoad) {
        onStaticMapLoad(event);
      }
      setMap(event.target);
    }, []);

    useEffect(() => {
      const map = mapRef.current?.getMap();
      const deck = deckRef.current?.deck;
      if (map && deck) {
        // You must initialize an empty deck.gl layer to prevent flashing
        if (mergeLayers && mergeLayers.length) {
          const allLayers = map.getStyle().layers;
          const index = allLayers
            .map((d) => {
              return d.type;
            })
            .lastIndexOf('raster');
          const beforeLayerId = allLayers[index + 1]?.id || null;
          console.log(beforeLayerId);
          mergeLayers.forEach((l) => {
            map.addLayer(
              // This id has to match the id of the deck.gl layer
              new MapboxLayer({ id: l.id, deck }),
              // Optionally define id from Mapbox layer stack under which to add deck layer
              beforeLayerId,
            );
          });
        }
      }
      return () => {};
    }, [
      iconData,
      geojsonData,
      pathData,
      textData,
      heatmapData,
      tripsData,
      editData,
      topLayers,
      layers,
      bottomLayers,
      children,
      clusterLayers,
      map,
    ]);

    return (
      <AutoSizer width={width} height={height}>
        {({ width: _width, height: _height }) => (
          <DeckGL
            ref={deckRef}
            width={_width}
            height={_height}
            initialViewState={initialViewState}
            viewState={viewState}
            getCursor={getCursor}
            controller={true}
            onViewStateChange={({ viewState: vs }) => {
              if (onViewStateChange) {
                onViewStateChange(vs);
                if (_viewState) {
                  return;
                }
              }
              setViewState(vs);
            }}
            layers={mergeLayers}
            onLoad={onMapLoad}
            onClick={onMapClick}
            onHover={onMapHover}
            // @ts-ignore
            onWebGLInitialized={setGLContext}
            glOptions={{
              antialias: true,
              alpha: true,
              premultipliedAlpha: true,
              // preserveDrawingBuffer: true,
              /* To render vector tile polygons correctly */
              stencil: true,
            }}
          >
            {glContext && (
              <StaticMap
                // @ts-ignore
                ref={mapRef}
                gl={glContext}
                key="static-map"
                mapStyle={mapStyleMerged}
                onLoad={onMapboxMapLoad}
              />
            )}
            {children}
          </DeckGL>
        )}
      </AutoSizer>
    );
  },
);
