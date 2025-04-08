import React from 'react';

export default function NetworkConnection({ 
  x1, 
  y1, 
  x2, 
  y2, 
  status = 'active', // 'active', 'inactive', 'warning'
  dotted = true
}) {
  // Definir cor e estilo baseado no status
  const getStrokeStyle = () => {
    switch (status) {
      case 'active':
        return { 
          stroke: '#10B981', // verde
          strokeDasharray: dotted ? '5,5' : 'none'
        };
      case 'warning':
        return { 
          stroke: '#F59E0B', // amarelo
          strokeDasharray: dotted ? '5,5' : 'none'
        };
      case 'inactive':
      default:
        return { 
          stroke: '#94A3B8', // cinza
          strokeDasharray: dotted ? '5,5' : 'none'
        };
    }
  };
  
  const strokeStyle = getStrokeStyle();
  
  return (
    <line 
      x1={x1} 
      y1={y1} 
      x2={x2} 
      y2={y2} 
      stroke={strokeStyle.stroke}
      strokeWidth="1.5"
      strokeDasharray={strokeStyle.strokeDasharray}
    />
  );
}