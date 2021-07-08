/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-extraneous-dependencies */
/*
 * @Author: yongju
 * @Date: 2021-07-08 12:20:25
 * @LastEditors: yongju
 * @LastEditTime: 2021-07-08 18:38:10
 * @Description:
 */
// @ts-nocheck
import nearestPointOnLine from '@turf/nearest-point-on-line';
import { point, lineString as toLineString } from '@turf/helpers';
import turfDistance from '@turf/distance';
import {
  DrawLineStringMode,
  ModeProps,
  FeatureCollection,
  GuideFeatureCollection,
  ImmutableFeatureCollection,
} from 'nebula.gl';

const {
  recursivelyTraverseNestedArrays,
  nearestPointOnProjectedLine,
  getEditHandlesForGeometry,
  getPickedEditHandles,
  getPickedEditHandle,
  getPickedExistingEditHandle,
  getPickedIntermediateEditHandle,
} = require('@nebula.gl/edit-modes/dist/utils');

export class MeasureDistanceMode extends DrawLineStringMode {
  constructor() {
    super();
    this._currentTooltips = [];
    this._currentDistance = 0;
  }

  handleClick(event, props) {
    const { modeConfig, data, onEdit, active, context } = props;

    if (!active) return;

    if (this._isMeasuringSessionFinished) {
      this._isMeasuringSessionFinished = false;
      this.resetClickSequence();
      this._currentTooltips = [];
      this._currentDistance = 0;
    } else if (context) {
      context.deck.viewManager.controllers['default-view'].doubleClickZoom = false;
    }

    const { picks } = event;
    const clickedEditHandle = getPickedEditHandle(picks);

    const pickedExistingHandle = getPickedExistingEditHandle(picks);
    const pickedIntermediateHandle = getPickedIntermediateEditHandle(picks);

    if (pickedExistingHandle) {
      const { featureIndex, positionIndexes } = pickedExistingHandle.properties;

      let updatedData;
      try {
        updatedData = new ImmutableFeatureCollection(props.data)
          .removePosition(featureIndex, positionIndexes)
          .getObject();
      } catch (ignored) {
        // This happens if user attempts to remove the last point
      }

      if (updatedData) {
        props.onEdit({
          updatedData,
          editType: 'removePosition',
          editContext: {
            featureIndexes: [featureIndex],
            positionIndexes,
            position: pickedExistingHandle.geometry.coordinates,
          },
        });
        return;
      }
    } else if (pickedIntermediateHandle) {
      const { featureIndex, positionIndexes } = pickedIntermediateHandle.properties;

      const updatedData = new ImmutableFeatureCollection(props.data)
        .addPosition(featureIndex, positionIndexes, pickedIntermediateHandle.geometry.coordinates)
        .getObject();

      if (updatedData) {
        props.onEdit({
          updatedData,
          editType: 'addPosition',
          editContext: {
            featureIndexes: [featureIndex],
            positionIndexes,
            position: pickedIntermediateHandle.geometry.coordinates,
          },
        });
        return;
      }
    }

    let positionAdded = false;
    if (!clickedEditHandle) {
      // Don't add another point right next to an existing one
      this.addClickSequence(event);
      positionAdded = true;
    }

    const clickSequence = this.getClickSequence();

    if (
      clickSequence.length > 1 &&
      clickedEditHandle &&
      Array.isArray(clickedEditHandle.properties.positionIndexes) &&
      clickedEditHandle.properties.positionIndexes[0] === clickSequence.length - 1
    ) {
      if (context) {
        context.deck.viewManager.controllers['default-view'].doubleClickZoom = true;
      }
      // They clicked the last point (or double-clicked), so add the LineString
      this._isMeasuringSessionFinished = true;
      const lineStringToAdd = this._toFeatures(clickSequence);
      this.resetClickSequence();
      const editAction = this.getAddManyFeaturesAction(
        {
          features: lineStringToAdd,
        },
        props.data,
      );
      if (editAction) {
        props.onEdit(editAction);
      }
    } else if (positionAdded) {
      if (clickSequence.length > 1) {
        this._currentDistance += this._calculateDistanceForTooltip({
          positionA: clickSequence[clickSequence.length - 2],
          positionB: clickSequence[clickSequence.length - 1],
          modeConfig,
        });
        this._currentTooltips.push({
          position: event.mapCoords,
          text: this._formatTooltip(this._currentDistance, modeConfig),
        });
      }
      // new tentative point
      onEdit({
        // data is the same
        updatedData: data,
        editType: 'addTentativePosition',
        editContext: {
          position: event.mapCoords,
        },
      });
    }
  }

  _toFeatures(clickSequence) {
    const features = [];
    features.push({
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [...clickSequence],
      },
    });
    // for(let i = 0 ; i < clickSequence.length; i ++){
    //     features.push({
    //         properties:{

    //         },
    //         geometry:{
    //             type: 'Point',
    //             coordinates: [...clickSequence[i]],
    //         }
    //     })
    // }
    return features;
  }

  handleKeyUp(event, props) {
    const { active } = props;

    if (!active) return;

    if (this._isMeasuringSessionFinished) return;

    event.stopPropagation();
    const { key } = event;

    const clickSequence = this.getClickSequence();
    const clickSequenceLength = clickSequence.length;

    switch (key) {
      case 'Escape':
        this._isMeasuringSessionFinished = true;
        if (clickSequenceLength === 1) {
          this.resetClickSequence();
          this._currentTooltips = [];
        }
        // force update drawings
        props.onUpdateCursor('cell');
        break;
      case 'Enter':
        this.handleClick(props.lastPointerMoveEvent, props);
        this._isMeasuringSessionFinished = true;

        if (clickSequenceLength > 1) {
          const lineStringToAdd = this._toFeatures(clickSequence);
          this.resetClickSequence();
          const editAction = this.getAddManyFeaturesAction(
            {
              features: lineStringToAdd,
            },
            props.data,
          );

          if (editAction) {
            props.onEdit(editAction);
          }
        }

        break;
      default:
        break;
    }
  }

  _calculateDistanceForTooltip = ({ positionA, positionB, modeConfig }) => {
    const { turfOptions, measurementCallback } = modeConfig || {};
    const distance = turfDistance(positionA, positionB, turfOptions);

    if (measurementCallback) {
      measurementCallback(distance);
    }

    return distance;
  };

  _formatTooltip(distance, modeConfig) {
    const { formatTooltip, turfOptions } = modeConfig || {};
    const units = (turfOptions && turfOptions.units) || 'kilometers';

    let text;
    if (formatTooltip) {
      text = formatTooltip(distance);
    } else {
      // By default, round to 2 decimal places and append units
      text = `${parseFloat(distance).toFixed(2)} ${units}`;
    }

    return text;
  }

  getTooltips(props) {
    const { lastPointerMoveEvent, modeConfig, data } = props;
    const { features } = data;
    const positions = this.getClickSequence();
    const tootips = [];
    if (positions.length > 0) {
      if (positions.length > 0 && lastPointerMoveEvent && !this._isMeasuringSessionFinished) {
        const distance = this._calculateDistanceForTooltip({
          positionA: positions[positions.length - 1],
          positionB: lastPointerMoveEvent.mapCoords,
          modeConfig: props.modeConfig,
        });
        tootips.push(...this._currentTooltips, {
          position: lastPointerMoveEvent.mapCoords,
          text: this._formatTooltip(this._currentDistance + distance, modeConfig),
        });
        // return [
        //     ...this._currentTooltips,
        //     {
        //         position: lastPointerMoveEvent.mapCoords,
        //         text: this._formatTooltip(this._currentDistance + distance, modeConfig),
        //     },
        // ];
      } else {
        tootips.push(this._currentTooltips);
      }
    }

    if (features && features.length > 0) {
      for (let j = 0; j < features.length; j += 1) {
        const lineFeature = features[j];
        let sum = 0;
        if (lineFeature && lineFeature.geometry.coordinates.length >= 2) {
          const { coordinates } = lineFeature.geometry;
          for (let i = 1; i < coordinates.length; i += 1) {
            const positionA = coordinates[i - 1];
            const positionB = coordinates[i];
            const distance = this._calculateDistanceForTooltip({
              positionA,
              positionB,
              modeConfig: props.modeConfig,
            });
            tootips.push({
              position: positionB,
              text: this._formatTooltip(sum + distance, modeConfig),
            });
            sum += distance;
          }
        }
      }
    }

    return tootips;
  }

  getGuides(props: ModeProps<FeatureCollection>): GuideFeatureCollection {
    const { active, context } = props;

    const clickSequence = this.getClickSequence();
    if (!active) {
      if (!this._isMeasuringSessionFinished) {
        if (context) {
          context.deck.viewManager.controllers['default-view'].doubleClickZoom = true;
        }
      }
      if (clickSequence.length > 0) {
        this.resetClickSequence();
        this._currentTooltips = [];
        this._isMeasuringSessionFinished = true;
      }
      return {
        type: 'FeatureCollection',
        features: [],
      };
    }

    const handles = [];

    const { data, lastPointerMoveEvent } = props;

    const { features } = data;
    const picks = lastPointerMoveEvent && lastPointerMoveEvent.picks;
    const mapCoords = lastPointerMoveEvent && lastPointerMoveEvent.mapCoords;

    const lastCoords = lastPointerMoveEvent ? [mapCoords] : [];

    // const guides = {
    //   type: 'FeatureCollection',
    //   features: [],
    // };

    let tentativeFeature;
    if (clickSequence.length > 0) {
      tentativeFeature = {
        type: 'Feature',
        properties: {
          guideType: 'tentative',
        },
        geometry: {
          type: 'LineString',
          coordinates: [...clickSequence, ...lastCoords],
        },
      };
      handles.push(tentativeFeature);

      const editHandles = clickSequence.map((clickedCoord, index) => ({
        type: 'Feature',
        properties: {
          guideType: 'editHandle',
          editHandleType: 'existing',
          featureIndex: index,
          positionIndexes: [index],
        },
        geometry: {
          type: 'Point',
          coordinates: clickedCoord,
        },
      }));

      handles.push(...editHandles);
    }

    // if (tentativeFeature) {
    //     guides.features.push(tentativeFeature);
    // }

    for (const index of props.selectedIndexes) {
      if (index < features.length) {
        const { geometry } = features[index];
        handles.push(...getEditHandlesForGeometry(geometry, index));
      } else {
        console.warn(`selectedFeatureIndexes out of range ${index}`); // eslint-disable-line no-console,no-undef
      }
    }

    // intermediate edit handle
    if (picks && picks.length && mapCoords) {
      const existingEditHandle = getPickedExistingEditHandle(picks);
      // don't show intermediate point when too close to an existing edit handle
      const featureAsPick = !existingEditHandle && picks.find((pick) => !pick.isGuide);

      // is the feature in the pick selected
      if (
        false
        //   featureAsPick &&
        //   featureAsPick.object.geometry&&
        //   !featureAsPick.object.geometry.type.includes('Point') &&
        //   props.selectedIndexes.includes(featureAsPick.index)
      ) {
        let intermediatePoint = null;
        let positionIndexPrefix = [];
        const referencePoint = point(mapCoords);
        // process all lines of the (single) feature
        recursivelyTraverseNestedArrays(
          featureAsPick.object.geometry.coordinates,
          [],
          (lineString, prefix) => {
            const lineStringFeature = toLineString(lineString);
            const candidateIntermediatePoint = this.nearestPointOnLine(
              // @ts-ignore
              lineStringFeature,
              referencePoint,
              props.modeConfig && props.modeConfig.viewport,
            );
            if (
              !intermediatePoint ||
              candidateIntermediatePoint.properties.dist < intermediatePoint.properties.dist
            ) {
              intermediatePoint = candidateIntermediatePoint;
              positionIndexPrefix = prefix;
            }
          },
        );
        // tack on the lone intermediate point to the set of handles
        if (intermediatePoint) {
          const {
            geometry: { coordinates: position },
            properties: { index },
          } = intermediatePoint;
          handles.push({
            type: 'Feature',
            properties: {
              guideType: 'editHandle',
              editHandleType: 'intermediate',
              featureIndex: featureAsPick.index,
              positionIndexes: [...positionIndexPrefix, index + 1],
            },
            geometry: {
              type: 'Point',
              coordinates: position,
            },
          });
        }
      }
    }

    // @ts-ignore
    //return guides;

    return {
      type: 'FeatureCollection',
      features: handles,
    };
  }

  nearestPointOnLine(line, inPoint, viewport) {
    const { coordinates } = line.geometry;
    if (coordinates.some((coord) => coord.length > 2)) {
      if (viewport) {
        // This line has elevation, we need to use alternative algorithm
        return nearestPointOnProjectedLine(line, inPoint, viewport);
      }
      // eslint-disable-next-line no-console,no-undef
      console.log(
        'Editing 3D point but modeConfig.viewport not provided. Falling back to 2D logic.',
      );
    }

    return nearestPointOnLine(line, inPoint);
  }

  handleDragging(event, props) {
    const { modeConfig, active } = props;
    if (!active) return;
    const editHandle = getPickedEditHandle(event.pointerDownPicks);

    if (editHandle) {
      // Cancel map panning if pointer went down on an edit handle
      event.cancelPan();

      modeConfig.map.dragPan.disable();

      const editHandleProperties = editHandle.properties;

      const updatedData = new ImmutableFeatureCollection(props.data)
        .replacePosition(
          editHandleProperties.featureIndex,
          editHandleProperties.positionIndexes,
          event.mapCoords,
        )
        .getObject();

      props.onEdit({
        updatedData,
        editType: 'movePosition',
        editContext: {
          featureIndexes: [editHandleProperties.featureIndex],
          positionIndexes: editHandleProperties.positionIndexes,
          position: event.mapCoords,
        },
      });
    }
  }

  handlePointerMove(event, props) {
    const { active } = props;
    if (!active) return;
    const cursor = this.getCursor(event);
    props.onUpdateCursor(cursor);
  }

  handleStartDragging(event, props) {
    const { modeConfig, active } = props;
    if (!active) return;
    const selectedFeatureIndexes = props.selectedIndexes;

    const editHandle = getPickedIntermediateEditHandle(event.picks);
    if (selectedFeatureIndexes.length && editHandle) {
      modeConfig.map.dragPan.disable();
      const editHandleProperties = editHandle.properties;

      const updatedData = new ImmutableFeatureCollection(props.data)
        .addPosition(
          editHandleProperties.featureIndex,
          editHandleProperties.positionIndexes,
          event.mapCoords,
        )
        .getObject();

      props.onEdit({
        updatedData,
        editType: 'addPosition',
        editContext: {
          featureIndexes: [editHandleProperties.featureIndex],
          positionIndexes: editHandleProperties.positionIndexes,
          position: event.mapCoords,
        },
      });
    }
  }

  handleStopDragging(event, props) {
    const { modeConfig, active } = props;
    if (!active) return;
    const selectedFeatureIndexes = props.selectedIndexes;
    const editHandle = getPickedEditHandle(event.picks);
    if (selectedFeatureIndexes.length && editHandle) {
      modeConfig.map.dragPan.enable();
      const editHandleProperties = editHandle.properties;
      const updatedData = new ImmutableFeatureCollection(props.data)
        .replacePosition(
          editHandleProperties.featureIndex,
          editHandleProperties.positionIndexes,
          event.mapCoords,
        )
        .getObject();

      props.onEdit({
        updatedData,
        editType: 'finishMovePosition',
        editContext: {
          featureIndexes: [editHandleProperties.featureIndex],
          positionIndexes: editHandleProperties.positionIndexes,
          position: event.mapCoords,
        },
      });
    }
  }

  getCursor(event) {
    const picks = (event && event.picks) || [];

    const handlesPicked = getPickedEditHandles(picks);
    if (handlesPicked.length) {
      return 'cell';
    }
    return null;
  }
}
