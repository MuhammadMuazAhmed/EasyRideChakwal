import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface Props {
  width?: number;
  height?: number;
  color?: string;
}

export function DocumentIcon({ width = 48, height = 48, color = '#F5C400' }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M14 2v6h6" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="8" y="12" width="8" height="1.2" rx="0.6" fill={color} />
      <Rect x="8" y="15" width="6" height="1.2" rx="0.6" fill={color} />
    </Svg>
  );
}

export default DocumentIcon;
