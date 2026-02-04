import React from 'react';
import { useAnimatedCounter } from '../../../../utils/beaty';

const AnimatedNumbers = ({ total }) => {
  const animatedTotal = useAnimatedCounter(total);
  return <>{animatedTotal.toLocaleString()}</>;
};

export default AnimatedNumbers;
