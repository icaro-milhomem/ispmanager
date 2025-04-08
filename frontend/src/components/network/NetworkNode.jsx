import React from 'react';
import { 
  Router, 
  Layers, 
  Wifi, 
  Server, 
  Radio, 
  Monitor, 
  Settings,
  User
} from "lucide-react";

// Mapeamento de tipo para ícone
const typeIcons = {
  router: Router,
  switch: Layers,
  ont: Wifi,
  olt: Server,
  radio: Radio,
  servidor: Monitor,
  outro: Settings
};

// Mapeamento de status para cor
const statusColors = {
  online: "#10B981", // verde
  offline: "#EF4444", // vermelho
  manutenção: "#F59E0B", // amarelo
  reserva: "#94A3B8" // cinza
};

// Mapeamento de tamanho para dimensões
const sizeMap = {
  sm: {
    node: "w-10 h-10",
    icon: "w-4 h-4",
    indicator: "w-2 h-2",
    label: "w-20 text-xs"
  },
  md: {
    node: "w-12 h-12",
    icon: "w-5 h-5",
    indicator: "w-3 h-3",
    label: "w-24 text-sm"
  },
  lg: {
    node: "w-16 h-16",
    icon: "w-6 h-6",
    indicator: "w-3 h-3",
    label: "w-32 text-sm font-medium"
  }
};

export default function NetworkNode({ 
  equipment, 
  size = "md", 
  label, 
  customer,
  onClick,
  isSelected = false
}) {
  const { type, status } = equipment;
  const IconComponent = typeIcons[type] || Settings;
  const sizeClasses = sizeMap[size];
  const statusColor = statusColors[status] || statusColors.reserva;
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className={`relative ${sizeClasses.node} rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${isSelected ? 'shadow-lg' : 'shadow-md'}`}
        style={{ 
          backgroundColor: 'white',
          borderWidth: '2px',
          borderStyle: 'solid',
          borderColor: isSelected ? '#3B82F6' : statusColor
        }}
        onClick={onClick}
      >
        <IconComponent className={`${sizeClasses.icon} text-gray-700`} />
        <div 
          className={`absolute bottom-0 right-0 ${sizeClasses.indicator} rounded-full border-2 border-white`}
          style={{ backgroundColor: statusColor }}
        ></div>
      </div>
      
      <div className={`${sizeClasses.label} mt-1 text-center truncate`}>
        {label}
      </div>
      
      {customer && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
          <User className="w-3 h-3" />
          <span className="truncate max-w-24">{customer}</span>
        </div>
      )}
    </div>
  );
}