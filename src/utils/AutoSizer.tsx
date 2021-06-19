import React from 'react';
import PropTypes from 'prop-types';
import RVAutoSizer from 'react-virtualized-auto-sizer';

const AutoSizer = ({
  width,
  height,
  children,
}: {
  width?: number;
  height?: number;
  children: (arg: { width: number; height: number }) => JSX.Element;
}) => {
  if (width !== null && width !== undefined && height !== null && height !== undefined) {
    return children({ width, height });
  }
  return <RVAutoSizer>{children}</RVAutoSizer>;
};

AutoSizer.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  children: PropTypes.func,
};

export default AutoSizer;
