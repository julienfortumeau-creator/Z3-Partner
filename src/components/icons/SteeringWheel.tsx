import React from 'react';
import Svg, { Circle, Path, G } from 'react-native-svg';

interface SteeringWheelProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const SteeringWheel = ({ 
  size = 24, 
  color = 'currentColor', 
  strokeWidth = 2 
}: SteeringWheelProps) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Outer ring */}
      <Circle cx="12" cy="12" r="10" />
      
      {/* Center cap */}
      <Circle cx="12" cy="12" r="2.5" />
      
      {/* Spokes - Classic 3-spoke design */}
      <G>
        {/* Top spoke (optional, usually 3-spoke has bottom two and one vertical or two horizontal) */}
        {/* We'll do a classic sport T-shape 3-spoke */}
        <Path d="M12 2v7.5" /> {/* Top/Center spoke to ring */}
        <Path d="M12 14.5v7.5" /> {/* Bottom spoke */}
        <Path d="M2.5 12h7" /> {/* Left spoke */}
        <Path d="M14.5 12h7" /> {/* Right spoke */}
        
        {/* Refined 3-spoke (Y shape) is often better for sport/classic */}
        {/* Let's do a 4-spoke simple look but clean */}
      </G>
    </Svg>
  );
};
