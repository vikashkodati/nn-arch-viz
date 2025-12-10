import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import NetworkGraph from './components/NetworkGraph';
import { LayerConfig, VisualSettings, DEFAULT_LAYERS, DEFAULT_SETTINGS } from './types';

const App: React.FC = () => {
  const [layers, setLayers] = useState<LayerConfig[]>(DEFAULT_LAYERS);
  const [settings, setSettings] = useState<VisualSettings>(DEFAULT_SETTINGS);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white text-gray-900 font-sans">
      <Sidebar 
        layers={layers}
        settings={settings}
        onLayerChange={setLayers}
        onSettingsChange={setSettings}
      />
      <main className="flex-1 h-full relative">
        <NetworkGraph layers={layers} settings={settings} />
      </main>
    </div>
  );
};

export default App;
