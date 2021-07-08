/* eslint-disable no-underscore-dangle */
/* eslint-disable no-useless-constructor */
/* eslint-disable import/no-extraneous-dependencies */
/*
 * @Author: yongju
 * @Date: 2021-07-08 12:24:48
 * @LastEditors: yongju
 * @LastEditTime: 2021-07-08 12:30:09
 * @Description:
 */
// @ts-nocheck
import nearestPointOnLine from '@turf/nearest-point-on-line';
import { point, lineString as toLineString } from '@turf/helpers';
import turfArea from '@turf/area';
import turfCentroid from '@turf/centroid';
import { utils, ImmutableFeatureCollection, DrawPolygonMode } from '@nebula.gl/edit-modes';

const {
  recursivelyTraverseNestedArrays,
  nearestPointOnProjectedLine,
  getEditHandlesForGeometry,
  getPickedEditHandles,
  getPickedEditHandle,
  getPickedExistingEditHandle,
  getPickedIntermediateEditHandle,
} = utils;
export class MeasureAreaMode extends DrawPolygonMode {
  constructor() {
    super();
  }

  handleClick(event, props) {
    const { data, onEdit, active } = props;
    if (!active) return;

    if (this._isMeasuringSessionFinished) {
      this._isMeasuringSessionFinished = false;
      this.resetClickSequence();
    }

    const { picks } = event;

    const clickedEditHandle = getPickedEditHandle(picks);

    let positionAdded = false;
    if (!clickedEditHandle) {
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
      // They clicked the last point (or double-clicked), so add the LineString
      this._isMeasuringSessionFinished = true;
      const polygonToAdd = this._toFeatures(clickSequence);
      this.resetClickSequence();
      const editAction = this.getAddFeatureOrBooleanPolygonAction(polygonToAdd, props);
      if (editAction) {
        props.onEdit(editAction);
      }
    } else if (positionAdded) {
      onEdit({
        updatedData: data,
        editType: 'addTentativePosition',
        editContext: {
          position: event.mapCoords,
        },
      });
    }
  }

  _toFeatures(clickSequence) {
    //const features = []
    // features.push({
    //     properties:{},
    //     geometry:{
    //         type: 'Polygon',
    //         coordinates: [
    //             [
    //                 ...clickSequence
    //             ]
    //         ],
    //     }
    // });
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
    return {
      type: 'Polygon',
      coordinates: [[...clickSequence, clickSequence[0]]],
    };
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

  getTooltips(props) {
    const { data, modeConfig } = props;
    const { features } = data;

    const { formatTooltip, measurementCallback } = modeConfig || {};

    const tentativeGuide = this.getTentativeGuide(props);

    const tootips = [];

    if (tentativeGuide && tentativeGuide.geometry.type === 'Polygon') {
      const units = '平方米';

      const centroid = turfCentroid(tentativeGuide);
      const area = turfArea(tentativeGuide);

      let text;
      if (formatTooltip) {
        text = formatTooltip(area);
      } else {
        // By default, round to 2 decimal places and append units
        // @ts-ignore
        text = `${parseFloat(area).toFixed(2)} ${units}`;
      }

      if (measurementCallback) {
        measurementCallback(area);
      }

      tootips.push({
        position: centroid.geometry.coordinates,
        text,
      });
    }
    if (features && features.length > 0) {
      for (let i = 0; i < features.length; i += 1) {
        const feature = features[i];
        if (feature && feature.geometry.type === 'Polygon') {
          const units = '平方米';
          const centroid = turfCentroid(feature);
          const area = turfArea(feature);
          let text;
          if (formatTooltip) {
            text = formatTooltip(area);
          } else {
            text = `${parseFloat(area).toFixed(2)} ${units}`;
          }
          tootips.push({
            position: centroid.geometry.coordinates,
            text,
          });
        }
      }
    }

    return tootips;
  }

  getGuides(props) {
    const handles = [];

    const { data, lastPointerMoveEvent } = props;

    const { features } = data;
    const picks = lastPointerMoveEvent && lastPointerMoveEvent.picks;
    const mapCoords = lastPointerMoveEvent && lastPointerMoveEvent.mapCoords;

    const clickSequence = this.getClickSequence();

    const tentativeFeature = this.createTentativeFeature(props);
    if (tentativeFeature) {
      handles.push(tentativeFeature);
    }

    if (clickSequence.length > 0) {
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
