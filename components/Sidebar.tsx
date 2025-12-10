import React from 'react';
import { Plus, Minus, RefreshCw } from 'lucide-react';
import { LayerConfig, VisualSettings } from '../types';

interface SidebarProps {
  layers: LayerConfig[];
  settings: VisualSettings;
  onLayerChange: (newLayers: LayerConfig[]) => void;
  onSettingsChange: (newSettings: VisualSettings) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  layers,
  settings,
  onLayerChange,
  onSettingsChange,
}) => {
  const updateSetting = <K extends keyof VisualSettings>(
    key: K,
    value: VisualSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const updateLayerNeuron = (index: number, value: number) => {
    const newLayers = [...layers];
    // Clamp between 1 and 50 for performance/visual sanity
    newLayers[index].neurons = Math.max(1, Math.min(50, value));
    onLayerChange(newLayers);
  };

  const removeLayer = (index: number) => {
    if (layers.length <= 2) return; // Prevent removing down to nothing
    const newLayers = layers.filter((_, i) => i !== index);
    onLayerChange(newLayers);
  };

  const addLayer = () => {
    const newLayers = [
      ...layers,
      { id: `l-${Date.now()}`, neurons: 5 },
    ];
    onLayerChange(newLayers);
  };

  return (
    <div className="w-96 bg-white h-screen overflow-y-auto border-r border-gray-200 p-6 shadow-sm flex-shrink-0 z-10">
      <div className="space-y-8">
        
        {/* General Appearance */}
        <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Appearance</h3>
            
            <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600">Default Edge Color</label>
                <div className="flex items-center space-x-2">
                    <input 
                        type="color" 
                        value={settings.edgeColor}
                        onChange={(e) => updateSetting('edgeColor', e.target.value)}
                        className="h-8 w-12 border border-gray-300 rounded cursor-pointer"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <input 
                    type="checkbox" 
                    id="bezier"
                    checked={settings.useBezier}
                    onChange={(e) => updateSetting('useBezier', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="bezier" className="text-sm text-gray-600">Use Bezier Curves</label>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between">
                    <label className="text-sm text-gray-600">Node Diameter</label>
                    <span className="text-xs text-gray-400">{settings.nodeDiameter}px</span>
                </div>
                <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    value={settings.nodeDiameter}
                    onChange={(e) => updateSetting('nodeDiameter', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
            </div>

             <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600">Node Color</label>
                <input 
                    type="color" 
                    value={settings.nodeColor}
                    onChange={(e) => updateSetting('nodeColor', e.target.value)}
                    className="h-8 w-12 border border-gray-300 rounded cursor-pointer"
                />
            </div>

             <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600">Node Border</label>
                <input 
                    type="color" 
                    value={settings.nodeBorderColor}
                    onChange={(e) => updateSetting('nodeBorderColor', e.target.value)}
                    className="h-8 w-12 border border-gray-300 rounded cursor-pointer"
                />
            </div>
        </div>

        {/* Layout Settings */}
        <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Layout</h3>
            
            <div className="space-y-2">
                <div className="flex justify-between">
                    <label className="text-sm text-gray-600">Layer Spacing</label>
                    <span className="text-xs text-gray-400">{settings.layerSpacing}px</span>
                </div>
                <input 
                    type="range" 
                    min="50" 
                    max="400" 
                    value={settings.layerSpacing}
                    onChange={(e) => updateSetting('layerSpacing', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            <div className="flex items-center space-x-4">
                <label className="text-sm text-gray-600">Direction</label>
                <div className="flex items-center space-x-3">
                    <label className="inline-flex items-center">
                        <input 
                            type="radio" 
                            className="form-radio text-blue-600" 
                            name="direction" 
                            value="horizontal"
                            checked={settings.direction === 'horizontal'}
                            onChange={() => updateSetting('direction', 'horizontal')}
                        />
                        <span className="ml-2 text-sm text-gray-700">Horizontal</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input 
                            type="radio" 
                            className="form-radio text-blue-600" 
                            name="direction" 
                            value="vertical"
                            checked={settings.direction === 'vertical'}
                            onChange={() => updateSetting('direction', 'vertical')}
                        />
                        <span className="ml-2 text-sm text-gray-700">Vertical</span>
                    </label>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <input 
                    type="checkbox" 
                    id="bias"
                    checked={settings.showBias}
                    onChange={(e) => updateSetting('showBias', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="bias" className="text-sm text-gray-600">Show Bias Units</label>
            </div>
            
            <div className="flex items-center space-x-2">
                <input 
                    type="checkbox" 
                    id="labels"
                    checked={settings.showLabels}
                    onChange={(e) => updateSetting('showLabels', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="labels" className="text-sm text-gray-600">Show Layer Labels</label>
            </div>

            <div className="flex items-center space-x-2">
                 <input 
                    type="checkbox" 
                    id="arrows"
                    checked={settings.arrowheads !== 'none'}
                    onChange={(e) => updateSetting('arrowheads', e.target.checked ? 'empty' : 'none')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="arrows" className="text-sm text-gray-600">Show Arrowheads</label>
            </div>

            {settings.arrowheads !== 'none' && (
                <div className="pl-6 flex items-center space-x-3">
                     <label className="inline-flex items-center">
                        <input 
                            type="radio" 
                            className="form-radio text-blue-600" 
                            name="arrowtype" 
                            checked={settings.arrowheads === 'empty'}
                            onChange={() => updateSetting('arrowheads', 'empty')}
                        />
                        <span className="ml-2 text-sm text-gray-700">Empty</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input 
                            type="radio" 
                            className="form-radio text-blue-600" 
                            name="arrowtype" 
                            checked={settings.arrowheads === 'solid'}
                            onChange={() => updateSetting('arrowheads', 'solid')}
                        />
                        <span className="ml-2 text-sm text-gray-700">Solid</span>
                    </label>
                </div>
            )}
        </div>

        {/* Architecture */}
        <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Architecture</h3>
            
            <div className="space-y-2">
                {layers.map((layer, idx) => (
                    <div key={layer.id} className="flex items-center space-x-2">
                        <button 
                            onClick={() => removeLayer(idx)}
                            disabled={layers.length <= 2}
                            className="p-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Minus size={14} />
                        </button>
                        <input 
                            type="number" 
                            min="1"
                            max="50"
                            value={layer.neurons}
                            onChange={(e) => updateLayerNeuron(idx, parseInt(e.target.value) || 1)}
                            className="w-16 p-1 border rounded text-center text-sm"
                        />
                        <input 
                            type="range"
                            min="1"
                            max="32"
                            value={layer.neurons}
                            onChange={(e) => updateLayerNeuron(idx, parseInt(e.target.value))}
                            className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                ))}
            </div>

            <button 
                onClick={addLayer}
                className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm"
                title="Add Layer"
            >
                <Plus size={20} />
            </button>
        </div>

        <div className="pt-4 border-t">
            <button 
                onClick={() => updateSetting('weightSeed', Date.now())}
                className="w-full flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded transition-colors shadow-sm"
            >
                <RefreshCw size={16} />
                <span>New Random Weights</span>
            </button>
        </div>

      </div>
    </div>
  );
};

export default Sidebar;
