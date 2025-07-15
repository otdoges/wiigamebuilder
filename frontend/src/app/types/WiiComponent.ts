export interface Position {
  x: number;
  y: number;
}

export interface WiiComponent {
  id: string;
  type: string;
  position: Position;
  properties: Record<string, any>;
}

export interface ComponentProperties {
  width?: number;
  height?: number;
  color?: string;
  text?: string;
  src?: string;
  speed?: number;
  health?: number;
  damage?: number;
  animation?: string;
  sound?: string;
  visible?: boolean;
  interactive?: boolean;
}

export type ComponentType = 
  | 'player'
  | 'enemy'
  | 'platform'
  | 'collectible'
  | 'background'
  | 'button'
  | 'text'
  | 'sprite'
  | 'sound'
  | 'particle';

export interface PaletteItem {
  id: ComponentType;
  name: string;
  icon: string;
  description: string;
  category: 'gameplay' | 'ui' | 'effects' | 'environment';
  defaultProperties: ComponentProperties;
}