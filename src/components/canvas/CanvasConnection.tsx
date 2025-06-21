import React from 'react';

interface CanvasConnectionProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color?: string;
  style?: 'solid' | 'dashed' | 'dotted';
  animated?: boolean;
}

export const CanvasConnection: React.FC<CanvasConnectionProps> = ({
  from,
  to,
  color = '#9CA3AF',
  style = 'solid',
  animated = false,
}) => {
  // Calculate control points for a smooth curve
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Create a curved path
  const controlPoint1X = from.x + dx * 0.3;
  const controlPoint1Y = from.y;
  const controlPoint2X = to.x - dx * 0.3;
  const controlPoint2Y = to.y;

  const pathData = `M ${from.x} ${from.y} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${to.x} ${to.y}`;

  const strokeDasharray = style === 'dashed' ? '5,5' : style === 'dotted' ? '2,2' : undefined;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={color}
          />
        </marker>
        
        {animated && (
          <animate
            attributeName="stroke-dashoffset"
            values="0;20"
            dur="1s"
            repeatCount="indefinite"
          />
        )}
      </defs>
      
      <path
        d={pathData}
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeDasharray={strokeDasharray}
        markerEnd="url(#arrowhead)"
        className={animated ? 'animate-pulse' : ''}
      />
    </svg>
  );
};