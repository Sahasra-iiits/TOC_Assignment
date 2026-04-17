import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  MarkerType,
  getBezierPath
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toPng } from 'html-to-image';
import { Download } from 'lucide-react';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  source,
  target,
}) => {
  const isSelfLoop = source === target;

  let path;
  if (isSelfLoop) {
    // Draw a prominent self-loop bezier path
    path = `M ${sourceX} ${sourceY} C ${sourceX - 60} ${sourceY - 100}, ${sourceX + 60} ${sourceY - 100}, ${sourceX} ${sourceY}`;
  } else {
    // Compute a quadratic bezier curve natively out to the side
    // This allows bidirectional edges between the same two nodes to naturally bend away from each other
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length > 0) {
      const offsetX = -dy / length;
      const offsetY = dx / length;
      // Fixed curve offset length
      const offsetSize = 30;

      const cx = (sourceX + targetX) / 2 + offsetX * offsetSize;
      const cy = (sourceY + targetY) / 2 + offsetY * offsetSize;

      path = `M ${sourceX} ${sourceY} Q ${cx} ${cy} ${targetX} ${targetY}`;
    } else {
       // Fallback logic
       path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
    }
  }

  return (
    <>
      <path
        id={id}
        d={path}
        style={{ ...style, fill: 'none' }}
        className="react-flow__edge-path"
        markerEnd={markerEnd}
      />
      {label && (
        <text style={{ pointerEvents: 'none' }} dy="-6">
          {/* Outline matching the canvas background so the text "cuts out" the line */}
          <textPath
            href={`#${id}`}
            style={{ fontSize: '18px', fontWeight: '900' }}
            startOffset="50%"
            textAnchor="middle"
            stroke="#0f172a" 
            strokeWidth="6"
            strokeLinejoin="round"
          >
            {label}
          </textPath>
          {/* The actual label */}
          <textPath
            href={`#${id}`}
            style={{ fontSize: '18px', fill: '#06b6d4', fontWeight: '900', letterSpacing: '2px' }} 
            startOffset="50%"
            textAnchor="middle"
          >
            {label}
          </textPath>
        </text>
      )}
    </>
  );
};

const nodeTypes = {}; // we can customize if needed
const edgeTypes = { default: CustomEdge };

export default function GraphEditor({ nodes, setNodes, edges, setEdges, onNodesChangeExt, onEdgesChangeExt, onConnectExt, defaultEdgeLabel = 'a', isLocked = false }) {

  const onNodesChange = useCallback(
    (changes) => {
      if (isLocked) return;
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes, isLocked]
  );
  const onEdgesChange = useCallback(
    (changes) => {
      if (isLocked) return;
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges, isLocked]
  );

  const onConnect = useCallback(
    (params) => {
      if (isLocked) return;
      // Create a default label 'a' for new transitions, and use neon emerald color
      const newEdge = {
        ...params,
        label: defaultEdgeLabel,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--neon-emerald)' },
        style: { stroke: 'var(--neon-emerald)' }
      };
      setEdges((eds) => addEdge(newEdge, eds));
      if (onConnectExt) onConnectExt(newEdge);
    },
    [setEdges, onConnectExt]
  );

  const downloadImage = () => {
    const reactFlowElement = document.querySelector('.react-flow');
    if (!reactFlowElement) return;

    const controls = document.querySelector('.react-flow__controls');
    if (controls) controls.style.visibility = 'hidden';

    toPng(reactFlowElement, {
      backgroundColor: '#0b0f19', // Match our dark theme
      quality: 1,
      filter: (node) => !(node.classList && node.classList.contains('react-flow__controls')),
    }).then((dataUrl) => {
      if (controls) controls.style.visibility = 'visible';
      const link = document.createElement('a');
      link.download = 'automata-graph.png';
      link.href = dataUrl;
      link.click();
    }).catch(err => {
      if (controls) controls.style.visibility = 'visible';
      console.error('Error generating image', err);
      alert('Failed to download image.');
    });
  };

  return (
    <div className="w-full h-full min-h-[500px] glass-panel rounded-xl overflow-hidden border border-white/10 relative">
      {/* Download Button */}
      <button
        onClick={downloadImage}
        className="absolute top-4 right-4 z-10 p-2 bg-slate-900 border border-white/10 rounded-lg text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-slate-800 transition-all shadow-md group"
        title="Download Graph Image"
      >
        <Download size={18} className="group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
      </button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeExt || onNodesChange}
        onEdgesChange={onEdgesChangeExt || onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={!isLocked}
        nodesConnectable={!isLocked}
        elementsSelectable={!isLocked}
        fitView
      >
        <Background color="#334155" gap={16} size={1} />
        <Controls className="bg-slate-900 border-white/10 fill-white" />
      </ReactFlow>
    </div>
  );
}
