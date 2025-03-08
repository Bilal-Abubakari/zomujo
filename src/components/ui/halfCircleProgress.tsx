import { motion } from 'framer-motion';
import React, { JSX, ReactNode } from 'react';

type halfCircleProgressProps = {
  progress?: number;
  size?: number;
  stroke?: number;
  color?: string;
  secondaryColor?: string;
  bottomComponent?: ReactNode;
};

const HalfCircleProgress = ({
  progress = 0.2,
  size = 80,
  stroke = 5,
  color = '#08AF85',
  secondaryColor = '#F0F2F5',
  bottomComponent,
}: halfCircleProgressProps): JSX.Element => (
  <div className="relative float-left m-1 text-center">
    <div
      style={{
        width: size,
        height: size / 2,
      }}
      className="relative overflow-hidden"
    >
      <motion.div
        style={{
          width: size,
          height: size,
          transform: 'rotate(' + (45 + progress * 100 * 1.8) + 'deg)',
          borderWidth: stroke,
          borderColor: secondaryColor,
          borderBottomColor: color,
          borderRightColor: color,
        }}
        className="absolute top-0 left-0 box-border rounded-[50%]"
      ></motion.div>
    </div>
    {bottomComponent}
  </div>
);

export default HalfCircleProgress;
