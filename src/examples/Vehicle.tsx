import React, { useState, useEffect, useRef } from 'react';
import MapGL from '..';
import policeCarImg from '../assets/police_car.png';

const STEP_SIZE = 0.0005 * 2;

type IconData = {
  image: string;
  coordinates: Position;
  width: number;
  height: number;
}[];

const Vehicle = () => {
  const [iconData, setIconData] = useState<IconData>([]);
  const viewState = useRef();
  const step = useRef(0);
  useEffect(() => {
    let timeout: null | NodeJS.Timeout = null;
    function calData() {
      const vehicleData: IconData = [
        {
          image: policeCarImg,
          coordinates: [
            120.026237 + step.current * STEP_SIZE,
            30.281735 + step.current * STEP_SIZE * 0.26,
          ],
          width: 50,
          height: 50,
        },
      ];
      setIconData(vehicleData);
      step.current += 1;
      timeout = setTimeout(() => {
        timeout = null;
        calData();
      }, 800);
    }
    setTimeout(() => {
      calData();
    }, 2000);
    return function unMount() {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);
  return (
    <MapGL
      iconData={iconData}
      onViewStateChange={(vs) => {
        viewState.current = vs;
      }}
    />
  );
};

Vehicle.propTypes = {};

export default Vehicle;
