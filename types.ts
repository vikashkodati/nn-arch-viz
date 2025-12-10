export interface LayerConfig {
  id: string;
  neurons: number;
}

export interface VisualSettings {
  edgeColor: string;
  useBezier: boolean;
  nodeDiameter: number;
  nodeColor: string;
  nodeBorderColor: string;
  layerSpacing: number;
  direction: 'horizontal' | 'vertical';
  showBias: boolean;
  showLabels: boolean;
  arrowheads: 'none' | 'empty' | 'solid';
  weightSeed: number; // Used to re-generate random visual weights
}

export const DEFAULT_LAYERS: LayerConfig[] = [
  { id: 'l1', neurons: 18 },
  { id: 'l2', neurons: 12 },
  { id: 'l3', neurons: 10 },
  { id: 'l4', neurons: 1 },
];

export const DEFAULT_SETTINGS: VisualSettings = {
  edgeColor: '#888888',
  useBezier: true,
  nodeDiameter: 20,
  nodeColor: '#ffffff',
  nodeBorderColor: '#333333',
  layerSpacing: 200,
  direction: 'horizontal',
  showBias: false,
  showLabels: true,
  arrowheads: 'none',
  weightSeed: Date.now(),
};
