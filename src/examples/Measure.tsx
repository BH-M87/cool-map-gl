/* eslint-disable jsx-a11y/no-static-element-interactions */
/*
 * @Author: yongju
 * @Date: 2021-07-08 11:17:58
 * @LastEditors: yongju
 * @LastEditTime: 2021-07-08 14:13:39
 * @Description:
 */
import React, { useState } from 'react';
import { MapGL } from '..';

const styleBtn = {
  float: 'left',
  width: '80px',
  height: '40px',
  lineHeight: '40px',
  textAlign: 'center',
  margin: '0px 10px',
  color: 'black',
  backgroundColor: 'white',
};

const Measure = () => {
  const [measureState, setMeasureState] = useState({
    distanceMeasure: true, //是否创建测距层
    areaMeasure: true, //是否创建侧面层
    mode: 0, // -1清除并关闭激活状态 0关闭激活状态 1开启测距模式关闭测面模式 2开启测面模式关闭测距模式
  });

  const handleMeasureDistance = () => {
    setMeasureState({
      mode: 1,
    });
  };

  const handleMeasureArea = () => {
    setMeasureState({
      mode: 2,
    });
  };

  const handleClear = () => {
    setMeasureState({
      mode: -1,
    });
  };

  return (
    <div style={{ width: 1000, height: 500 }}>
      <MapGL measureConfig={measureState} />
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}>
        <div style={styleBtn} onClick={handleMeasureDistance}>
          测距
        </div>
        <div style={styleBtn} onClick={handleMeasureArea}>
          测面
        </div>
        <div style={styleBtn} onClick={handleClear}>
          清除
        </div>
      </div>
    </div>
  );
};

Measure.propTypes = {};

export default Measure;
