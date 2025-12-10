import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { LayerConfig, VisualSettings } from '../types';

interface NetworkGraphProps {
  layers: LayerConfig[];
  settings: VisualSettings;
}

interface Node {
  id: string;
  layerIndex: number;
  neuronIndex: number;
  x: number;
  y: number;
  isBias: boolean;
}

interface Link {
  id: string;
  source: Node;
  target: Node;
  weight: number;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ layers, settings }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute graph data
  const { nodes, links } = useMemo(() => {
    const nodes: Node[] = [];
    const links: Link[] = [];
    const isHoriz = settings.direction === 'horizontal';

    const maxNeurons = Math.max(...layers.map(l => l.neurons + (settings.showBias ? 1 : 0)));
    
    // We want the whole graph to be centered.
    // Calculate total layout width/height
    const layoutLength = (layers.length - 1) * settings.layerSpacing;
    
    // Padding around the graph
    const paddingX = 100;
    const paddingY = 100;
    
    // Calculate start positions to center the graph
    // For horizontal: X spreads by layer, Y is centered per layer
    // For vertical: Y spreads by layer, X is centered per layer
    
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    
    const startMainAxis = isHoriz ? centerX - (layoutLength / 2) : centerY - (layoutLength / 2);

    // Random number generator seeded by weightSeed (simple hash)
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    let weightCounter = settings.weightSeed;

    layers.forEach((layer, layerIdx) => {
      const neuronCount = layer.neurons;
      const effectiveCount = settings.showBias && layerIdx !== layers.length - 1 
        ? neuronCount + 1 
        : neuronCount;

      // Determine spacing between nodes in this layer
      // If layers have vastly different counts, we might want fixed spacing or relative.
      // Let's use a fixed spacing based on node diameter to prevent overlap, but centered.
      const nodeSpacing = settings.nodeDiameter * 2.5; 
      const layerHeight = (effectiveCount - 1) * nodeSpacing;
      
      const layerMainPos = startMainAxis + (layerIdx * settings.layerSpacing);

      for (let i = 0; i < effectiveCount; i++) {
        const isBias = settings.showBias && layerIdx !== layers.length - 1 && i === effectiveCount - 1;
        const layerCrossPos = (isHoriz ? centerY : centerX) - (layerHeight / 2) + (i * nodeSpacing);

        const x = isHoriz ? layerMainPos : layerCrossPos;
        const y = isHoriz ? layerCrossPos : layerMainPos;

        nodes.push({
          id: `${layerIdx}-${i}`,
          layerIndex: layerIdx,
          neuronIndex: i,
          x,
          y,
          isBias,
        });
      }
    });

    // Generate links
    nodes.forEach(source => {
      // Find all nodes in the next layer
      const targets = nodes.filter(n => n.layerIndex === source.layerIndex + 1);
      targets.forEach(target => {
        // Bias nodes do not have incoming connections, but they have outgoing.
        // Target cannot be a bias node (usually bias connects TO regular nodes, bias nodes don't receive input).
        if (!target.isBias) {
           // Simulate a weight for opacity
           const weight = seededRandom(weightCounter++);
           links.push({
             id: `${source.id}->${target.id}`,
             source,
             target,
             weight
           });
        }
      });
    });

    return { nodes, links };
  }, [layers, settings, dimensions]);

  // Generators for paths
  const linkGenerator = useMemo(() => {
    if (settings.useBezier) {
        if (settings.direction === 'horizontal') {
            return d3.linkHorizontal<Link, Node>()
                .x(d => d.x)
                .y(d => d.y);
        } else {
            return d3.linkVertical<Link, Node>()
                .x(d => d.x)
                .y(d => d.y);
        }
    } else {
        return (d: Link) => `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`;
    }
  }, [settings.direction, settings.useBezier]);

  // Label text generator
  const getLayerLabel = (idx: number, neuronCount: number) => {
    if (idx === 0) return `Input Layer ∈ R${getSuperscript(neuronCount)}`;
    if (idx === layers.length - 1) return `Output Layer ∈ R${getSuperscript(neuronCount)}`;
    return `Hidden Layer ∈ R${getSuperscript(neuronCount)}`;
  };

  const getSuperscript = (num: number) => {
      const supers = "⁰¹²³⁴⁵⁶⁷⁸⁹";
      return num.toString().split('').map(d => supers[parseInt(d)]).join('');
  };

  return (
    <div className="flex-1 bg-gray-50 h-full relative overflow-hidden" ref={containerRef}>
      <svg width={dimensions.width} height={dimensions.height} className="block">
        <defs>
            <marker 
                id="arrow-solid" 
                viewBox="0 0 10 10" 
                refX={settings.nodeDiameter/2 + 10} 
                refY="5"
                markerWidth="6" 
                markerHeight="6" 
                orient="auto-start-reverse"
            >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={settings.edgeColor} />
            </marker>
             <marker 
                id="arrow-empty" 
                viewBox="0 0 10 10" 
                refX={settings.nodeDiameter/2 + 10} 
                refY="5"
                markerWidth="6" 
                markerHeight="6" 
                orient="auto-start-reverse"
            >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="white" stroke={settings.edgeColor} strokeWidth="1" />
            </marker>
        </defs>

        <g>
          {/* Links */}
          {links.map(link => (
            <path
              key={link.id}
              d={linkGenerator(link) || ''}
              fill="none"
              stroke={settings.edgeColor}
              strokeWidth={1}
              opacity={0.3 + (link.weight * 0.7)} // Random opacity based on "weight"
              markerEnd={
                  settings.arrowheads === 'solid' ? 'url(#arrow-solid)' : 
                  settings.arrowheads === 'empty' ? 'url(#arrow-empty)' : 
                  undefined
              }
            />
          ))}

          {/* Nodes */}
          {nodes.map(node => (
            <g key={node.id} transform={`translate(${node.x},${node.y})`}>
              <circle
                r={settings.nodeDiameter / 2}
                fill={node.isBias ? '#f0f0f0' : settings.nodeColor}
                stroke={settings.nodeBorderColor}
                strokeWidth={node.isBias ? 1 : 2}
                style={{ transition: 'all 0.3s ease' }}
              />
              {node.isBias && (
                  <text 
                    textAnchor="middle" 
                    dy=".3em" 
                    fontSize={settings.nodeDiameter * 0.6} 
                    fill="#999"
                    className="pointer-events-none select-none"
                  >
                    1
                  </text>
              )}
            </g>
          ))}

          {/* Layer Labels */}
          {settings.showLabels && layers.map((layer, idx) => {
             // Find position for label
             const layerNodes = nodes.filter(n => n.layerIndex === idx);
             if (layerNodes.length === 0) return null;
             
             // Calculate bounding box center of layer
             const xs = layerNodes.map(n => n.x);
             const ys = layerNodes.map(n => n.y);
             
             let labelX, labelY;

             if (settings.direction === 'horizontal') {
                 // Bottom of the column
                 labelX = xs[0];
                 labelY = Math.max(...ys) + settings.nodeDiameter + 30;
             } else {
                 // Right of the row (or left depending on pref, sticking to bottom/right for now)
                 labelX = Math.max(...xs) + settings.nodeDiameter + 80;
                 labelY = ys[0];
             }

             return (
                 <text
                    key={`label-${idx}`}
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    className="text-xs font-sans fill-gray-600 font-medium select-none uppercase tracking-wider"
                 >
                     {getLayerLabel(idx, layer.neurons)}
                 </text>
             )
          })}
        </g>
      </svg>
      
      {/* Absolute positioned Title to match screenshot */}
      <div className="absolute top-8 right-12 pointer-events-none">
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight uppercase text-right">
            Visualize Your <br/> Architecture
        </h1>
      </div>
    </div>
  );
};

export default NetworkGraph;
