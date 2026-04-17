import React, { useState } from 'react';
import GraphEditor from '../components/GraphEditor';
import { simulateDFA, dfaToRegex } from '../api';
import { Play, Code, Plus, CheckCircle, Flag, Trash2 } from 'lucide-react';
import { InlineMath } from 'react-katex';

export default function DFATool() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const [inputString, setInputString] = useState('');
  const [simResult, setSimResult] = useState(null);
  const [regexResult, setRegexResult] = useState('');

  const [loading, setLoading] = useState(false);
  const [defaultEdgeLabel, setDefaultEdgeLabel] = useState('a');

  // Tools to manually add nodes
  const addState = () => {
    const id = `q${nodes.length}`;
    setNodes((nds) => [
      ...nds,
      {
        id,
        position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 },
        data: { label: id },
        className: 'automata-node',
      },
    ]);
  };

  const toggleAcceptState = (nodeId) => {
    setNodes((nds) => nds.map(n => {
      if (n.id === nodeId) {
        const isAccept = n.className.includes('accept');
        return { ...n, className: isAccept ? 'automata-node' : 'automata-node accept' };
      }
      return n;
    }));
  };

  const toggleStartState = (nodeId) => {
    setNodes((nds) => nds.map(n => {
      // only one start state
      const baseClass = n.className.replace('start-state', '').trim();
      if (n.id === nodeId) {
        return { ...n, className: baseClass + ' start-state' };
      }
      return { ...n, className: baseClass };
    }));
  };

  // Convert graph to payload
  const getPayload = () => {
    const states = nodes.map(n => n.id);
    let startState = nodes.find(n => n.className?.includes('start-state'))?.id;

    const acceptStates = nodes.filter(n => n.className?.includes('accept')).map(n => n.id);

    const transitions = edges.flatMap(e => {
      const labels = (e.label || 'a').split(',').map(l => l.trim()).filter(l => l);
      return labels.map(label => ({
        from: e.source,
        to: e.target,
        read: label,
        edgeId: e.id,
      }));
    });

    const alphabet = [...new Set(transitions.map(t => t.read))];

    return { states, alphabet, transitions, startState, acceptStates };
  };

  const handleSimulate = async () => {
    if (nodes.length === 0) return;
    setLoading(true);
    try {
      const payload = getPayload();
      
      if (!payload.startState && nodes.length > 0) {
        alert("Please select a Start State (▶) first.");
        setLoading(false);
        return;
      }
      if (payload.acceptStates.length === 0 && nodes.length > 0) {
        alert("Please select at least one Accept State (◎) first.");
        setLoading(false);
        return;
      }

      const res = await simulateDFA({ ...payload, inputString });
      setSimResult(res);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.error || "Error in simulation");
    }
    setLoading(false);
  };

  const handleRegex = async () => {
    if (nodes.length === 0) return;
    setLoading(true);
    try {
      const payload = getPayload();

      if (!payload.startState && nodes.length > 0) {
        alert("Please select a Start State (▶) first.");
        setLoading(false);
        return;
      }
      if (payload.acceptStates.length === 0 && nodes.length > 0) {
        alert("Please select at least one Accept State (◎) first.");
        setLoading(false);
        return;
      }

      const res = await dfaToRegex(payload);
      setRegexResult(res.regex);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.error || "Error converting to regex");
    }
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar pb-6 pr-2">
      <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-stretch">
        {/* Left panel: Canvas */}
        <div className="w-full xl:w-2/3 flex flex-col gap-4 min-h-[500px]">
          <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-cyan-500/10">
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">DFA Canvas</h2>
              <p className="text-xs text-slate-400">Drag connections between nodes. Click an edge to edit constraints (comma-separated).</p>
            </div>
            <button
              onClick={addState}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors shadow-[0_0_10px_rgba(34,211,238,0.4)] flex items-center gap-2"
            >
              <Plus size={16} /> Add State
            </button>
          </div>

          <div className="flex-1 relative">
            <GraphEditor
              nodes={nodes}
              setNodes={setNodes}
              edges={edges}
              setEdges={setEdges}
              defaultEdgeLabel={defaultEdgeLabel}
            />
          </div>
        </div>

        {/* Right panel: Controls & Simulation */}
        <div className="w-full xl:w-1/3 flex flex-col gap-6">

          {/* Node configuration (Quick hack to set start/accept) */}
          {nodes.length > 0 && (
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest border-b border-white/10 pb-2">State Config</h3>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                {nodes.map(n => (
                  <div key={n.id} className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-700">
                    <span className="text-cyan-400 font-bold w-6">{n.id}</span>
                    <button onClick={() => toggleStartState(n.id)} title="Set as Start" className={`p-1 rounded ${n.className.includes('start-state') ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-white'}`}><Flag size={14} /></button>
                    <button onClick={() => toggleAcceptState(n.id)} title="Set as Accept" className={`p-1 rounded ${n.className.includes('accept') ? 'bg-purple-500/20 text-purple-400' : 'text-slate-500 hover:text-white'}`}><CheckCircle size={14} /></button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">Select states to mark them as Start (▶) or Accept (◎).</p>
            </div>
          )}

          {/* Live Transitions Box */}
          {edges.length > 0 && (
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest border-b border-white/10 pb-2">Live Transitions</h3>
              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto custom-scrollbar font-mono text-sm px-1">
                {edges.map((e) => (
                  <div key={e.id} className="flex gap-2 items-center text-slate-300 group">
                    <span className="text-cyan-400 w-6 text-right">{e.source}</span>
                    <span className="text-slate-500">{"--("}</span>
                    <input
                      type="text"
                      value={e.label || ''}
                      onChange={(evt) => {
                        setEdges(eds => eds.map(edge => edge.id === e.id ? { ...edge, label: evt.target.value } : edge));
                      }}
                      className="w-12 bg-slate-800 border-b border-slate-600 px-1 text-center text-white focus:outline-none focus:border-cyan-500"
                    />
                    <span className="text-slate-500">{")-->"}</span>
                    <span className="text-cyan-400">{e.target}</span>
                    <button
                      onClick={() => setEdges(eds => eds.filter(x => x.id !== e.id))}
                      className="ml-auto opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity"
                      title="Remove Transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Simulation Panel */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 flex-1 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest border-b border-white/10 pb-2">Simulate String</h3>
            <div className="flex gap-2">
              <input
                type="text" value={inputString} onChange={(e) => setInputString(e.target.value)}
                placeholder="e.g. aab"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <button
                onClick={handleSimulate} disabled={loading}
                className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Play size={16} /> Run
              </button>
            </div>

            {simResult && (
              <div className={`p-4 rounded-xl border mt-2 flex flex-col gap-2 ${simResult.accept ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <span className={`font-bold ${simResult.accept ? 'text-emerald-400' : 'text-red-400'}`}>
                  {simResult.message}
                </span>
                <div className="text-xs text-slate-400 max-h-32 overflow-y-auto">
                  <span className="font-semibold block mb-1">Trace:</span>
                  {simResult.trace.map((tr, i) => (
                    <div key={i} className="flex gap-2 font-mono">
                      <span className="text-cyan-400">{tr.state}</span>
                      <span>--({tr.symbol}){"-->"}</span>
                      <span className={tr.nextState ? "text-purple-400" : "text-red-400"}>{tr.nextState || "HALT"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Regex Generation Panel (Bottom) */}
      <div className="w-full glass-panel p-6 rounded-2xl border border-purple-500/20 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white tracking-wide">Regular Expression Extraction</h3>
            <p className="text-sm text-slate-400">Uses mathematical state-elimination to generate the equivalent expression for this DFA.</p>
          </div>
          <button
            onClick={handleRegex} disabled={loading}
            className="bg-purple-500/10 text-purple-400 border border-purple-500/50 hover:bg-purple-500/20 px-6 py-2 rounded-lg transition-colors flex justify-center items-center gap-2 font-semibold"
          >
            <Code size={18} /> Build Regular Expression
          </button>
        </div>

        {regexResult && (
          <div className="mt-4 p-6 bg-slate-900 rounded-xl border border-purple-500/20 flex flex-col items-center justify-center min-h-[80px] overflow-x-auto text-purple-300 text-2xl shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]">
            <InlineMath math={regexResult} />
          </div>
        )}
      </div>


    </div>
  );
}
