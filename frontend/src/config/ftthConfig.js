// Tipos de cabo de fibra óptica
export const CABLE_TYPES = {
  'drop': {
    name: 'Cabo Drop',
    capacity: 1,
    description: 'Cabo de uma fibra para última milha'
  },
  'as80': {
    name: 'AS 80',
    capacity: 12,
    description: 'Cabo autossustentado de 12 fibras'
  },
  'as120': {
    name: 'AS 120',
    capacity: 24,
    description: 'Cabo autossustentado de 24 fibras'
  },
  'as200': {
    name: 'AS 200',
    capacity: 36,
    description: 'Cabo autossustentado de 36 fibras'
  },
  'cfoa_sm': {
    name: 'CFOA-SM',
    capacity: 48,
    description: 'Cabo óptico subterrâneo de 48 fibras'
  },
  'cfoa_sm_72': {
    name: 'CFOA-SM-72',
    capacity: 72,
    description: 'Cabo óptico subterrâneo de 72 fibras'
  },
  'cfoa_sm_144': {
    name: 'CFOA-SM-144',
    capacity: 144,
    description: 'Cabo óptico subterrâneo de 144 fibras'
  }
};

// Cores padrão de fibras ópticas (seguindo norma EIA/TIA-598)
export const FIBER_COLORS = [
  { value: 'verde', label: 'Verde', hex: '#00FF00', tubeNumber: 1 },
  { value: 'amarelo', label: 'Amarelo', hex: '#FFFF00', tubeNumber: 2 },
  { value: 'branco', label: 'Branco', hex: '#FFFFFF', tubeNumber: 3 },
  { value: 'azul', label: 'Azul', hex: '#0000FF', tubeNumber: 4 },
  { value: 'vermelho', label: 'Vermelho', hex: '#FF0000', tubeNumber: 5 },
  { value: 'violeta', label: 'Violeta', hex: '#8B00FF', tubeNumber: 6 },
  { value: 'marrom', label: 'Marrom', hex: '#8B4513', tubeNumber: 7 },
  { value: 'rosa', label: 'Rosa', hex: '#FF69B4', tubeNumber: 8 },
  { value: 'preto', label: 'Preto', hex: '#000000', tubeNumber: 9 },
  { value: 'laranja', label: 'Laranja', hex: '#FFA500', tubeNumber: 10 },
  { value: 'cinza', label: 'Cinza', hex: '#808080', tubeNumber: 11 },
  { value: 'aqua', label: 'Aqua', hex: '#00FFFF', tubeNumber: 12 }
];

// Tipos de splitter
export const SPLITTER_TYPES = {
  'conectorizado': {
    name: 'Conectorizado',
    description: 'Splitter com conectores em todas as portas'
  },
  'fusao': {
    name: 'Fusão',
    description: 'Splitter para fusão das fibras'
  }
};

// Razões de divisão do splitter
export const SPLITTER_RATIOS = [
  { value: '1:2', outputs: 2 },
  { value: '1:4', outputs: 4 },
  { value: '1:8', outputs: 8 },
  { value: '1:16', outputs: 16 },
  { value: '1:32', outputs: 32 },
  { value: '1:64', outputs: 64 }
];

// Status dos elementos
export const ELEMENT_STATUS = {
  'active': {
    label: 'Ativo',
    color: '#22c55e'
  },
  'inactive': {
    label: 'Inativo',
    color: '#ef4444'
  },
  'maintenance': {
    label: 'Em Manutenção',
    color: '#f97316'
  },
  'planned': {
    label: 'Planejado',
    color: '#3b82f6'
  }
}; 