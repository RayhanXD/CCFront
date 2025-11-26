import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  icon: Array<{ d: string }>;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: any;
}

export function Icon({ icon, size = 24, color = '#000000', strokeWidth = 2, style }: IconProps) {
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
      style={style}
    >
      {icon.map((path, i) => (
        <Path key={i} d={path.d} />
      ))}
    </Svg>
  );
}

export default Icon;
