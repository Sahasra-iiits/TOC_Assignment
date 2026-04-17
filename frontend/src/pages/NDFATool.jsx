import React, { useState } from 'react';
import GraphEditor from '../components/GraphEditor';
import { simulateNDFA, ndfaToDfa } from '../api';
import { Play, Code, Plus, CheckCircle, Flag, GitMerge, Trash2 } from 'lucide-react';

export default function NDFATool() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const [inputString, setInputString] = useState('');
  const [simResult, setSimResult] = useState(null);
  const [dfaResult, setDfaResult] = useState(null);

  const [dfaNodes, setDfaNodes] = useState([]);
  const [dfaEdges, setDfaEdges] = useState([]);

  const [loading, setLoading] = useState(false);
  const [defaultEdgeLabel, setDefaultEdgeLabel] = useState('a');

  const addState = () => {
    const id = `q${nodes.length}`;
    setNodes((nds) => [
      ...nds,
      {
        id,
        position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 },
        data: { label: id },
        className: 'automata-node ndfa-theme',
      },
    ]);
  };

  const toggleAcceptState = (nodeId) => {
    setNodes((nds) => nds.map(n => {
      if (n.id === nodeId) {
        const isAccept = n.className.includes('accept');
        return { ...n, className: isAccept ? 'automata-node ndfa-theme' : 'automata-node ndfa-theme accept' };
      }
      return n;
    }));
  };

  const toggleStartState = (nodeId) => {
    setNodes((nds) => nds.map(n => {
      const baseClass = n.className.replace('start-state', '').replace('accept', '').replace('automata-node', '').replace('ndfa-theme', '').trim();
      const isAccept = n.className.includes('accept');
      const newBase = `automata-node ndfa-theme ${isAccept ? 'accept' : ''}`.trim();
      if (n.id === nodeId) {
        return { ...n, className: newBase + ' start-state' };
      }
      return { ...n, className: newBase };
    }));
  };

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

      const res = await simulateNDFA({ ...payload, inputString });
      setSimResult(res);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.error || "Error in simulation");
    }
    setLoading(false);
  };

  const handleConvert = async () => {
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

      const res = await ndfaToDfa(payload);
      setDfaResult(res);

      const newDfaNodes = [];
      const newDfaEdges = [];
      
      const allStates = new Set();
      if (res.startState) allStates.add(res.startState);
      res.acceptStates.forEach(s => allStates.add(s));
      res.transitions.forEach(t => {
          allStates.add(t.from);
          allStates.add(t.to);
      });

      let idx = 0;
      Array.from(allStates).forEach((stateId) => {
        const isStart = stateId === res.startState;
        const isAccept = res.acceptStates.includes(stateId);
        let className = 'automata-node';
        if (isAccept) className += ' accept';
        if (isStart) className += ' start-state';
        
        newDfaNodes.push({
          id: stateId,
          // Spaced out significantly more to fit thick curved lines and wide labels
          position: { x: (idx % 3) * 300 + 100, y: Math.floor(idx / 3) * 250 + 100 },
          data: { label: stateId.replace(/,/g, ', ') },
          className
        });
        idx++;
      });

      const edgeMap = {};
      res.transitions.forEach((t) => {
        const key = `${t.from}-${t.to}`;
        if (!edgeMap[key]) edgeMap[key] = [];
        edgeMap[key].push(t.read);
      });

      Object.entries(edgeMap).forEach(([key, labels]) => {
        const [source, target] = key.split('-');
        newDfaEdges.push({
          id: `e-${source}-${target}`,
          source,
          target,
          label: labels.join(','),
          type: 'default',
          animated: true,
          markerEnd: { type: 'arrowclosed', color: '#06b6d4' },
          style: { stroke: '#06b6d4', strokeWidth: 2 }
        });
      });

      setDfaNodes(newDfaNodes);
      setDfaEdges(newDfaEdges);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.error || "Error converting to DFA");
    }
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar pb-6 pr-2">
      <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-stretch">
        {/* Left panel: Canvas */}
        <div className="w-full xl:w-2/3 flex flex-col gap-4 min-h-[500px]">
          <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-purple-500/10">
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">NDFA Canvas</h2>
              <p className="text-xs text-slate-400">Drag to connect. Click edges to edit labels. Use comma separation for multiple limits, 'e' for epsilon.</p>
            </div>
            <button
              onClick={addState}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors shadow-[0_0_10px_rgba(168,85,247,0.4)] flex items-center gap-2"
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

          {nodes.length > 0 && (
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest border-b border-white/10 pb-2">State Config</h3>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                {nodes.map(n => (
                  <div key={n.id} className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-700">
                    <span className="text-purple-400 font-bold w-6">{n.id}</span>
                    <button onClick={() => toggleStartState(n.id)} title="Set as Start" className={`p-1 rounded ${n.className.includes('start-state') ? 'bg-purple-500/20 text-purple-400' : 'text-slate-500 hover:text-white'}`}><Flag size={14} /></button>
                    <button onClick={() => toggleAcceptState(n.id)} title="Set as Accept" className={`p-1 rounded ${n.className.includes('accept') ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-white'}`}><CheckCircle size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Transitions Box */}
          {edges.length > 0 && (
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest border-b border-white/10 pb-2">Live Transitions</h3>
              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto custom-scrollbar font-mono text-sm px-1">
                {edges.map((e) => (
                  <div key={e.id} className="flex gap-2 items-center text-slate-300 group">
                    <span className="text-purple-400 w-6 text-right">{e.source}</span>
                    <span className="text-slate-500">{"--("}</span>
                    <input
                      type="text"
                      value={e.label || ''}
                      onChange={(evt) => {
                        setEdges(eds => eds.map(edge => edge.id === e.id ? { ...edge, label: evt.target.value } : edge));
                      }}
                      className="w-12 bg-slate-800 border-b border-slate-600 px-1 text-center text-white focus:outline-none focus:border-purple-500"
                    />
                    <span className="text-slate-500">{")-->"}</span>
                    <span className="text-purple-400">{e.target}</span>
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

          <div className="glass-panel p-5 rounded-2xl border border-white/5 flex-1 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest border-b border-white/10 pb-2">Simulate String</h3>
            <div className="flex gap-2">
              <input
                type="text" value={inputString} onChange={(e) => setInputString(e.target.value)}
                placeholder="e.g. aab"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button
                onClick={handleSimulate} disabled={loading}
                className="bg-purple-500/10 text-purple-400 border border-purple-500/50 hover:bg-purple-500/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Play size={16} /> Path Search
              </button>
            </div>

            {simResult && (
              <div className={`p-4 rounded-xl border mt-2 flex flex-col gap-2 ${simResult.accept ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <span className={`font-bold ${simResult.accept ? 'text-emerald-400' : 'text-red-400'}`}>
                  {simResult.message}
                </span>
                <div className="text-xs text-slate-400 mt-1">
                  Found {simResult.acceptingPaths.length} accepting path(s) out of {simResult.allPaths.length} explored path(s).
                </div>
                <div className="text-xs text-slate-400 max-h-32 overflow-y-auto mt-2">
                  {simResult.accept ? (
                    <>
                      <span className="font-semibold block mb-1">Example Accepting Trace:</span>
                      {simResult.acceptingPaths[0].slice(0, -1).map((tr, i) => (
                        <div key={i} className="flex gap-2 font-mono">
                          <span className="text-purple-400">{tr.state}</span>
                          <span>--({tr.symbol}){"-->"}</span>
                          <span className="text-emerald-400">{tr.nextState || "HALT"}</span>
                        </div>
                      ))}
                      <div className="text-purple-400 font-bold mt-1">Final: {simResult.acceptingPaths[0][simResult.acceptingPaths[0].length - 1].state}</div>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold block mb-1 text-red-500">No accepting paths found. Evaluated {simResult.allPaths?.length} paths.</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Subset Construction Panel (Bottom) */}
      <div className="w-full glass-panel p-6 rounded-2xl border border-cyan-500/20 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white tracking-wide">Subset Construction (Convert to DFA)</h3>
            <p className="text-sm text-slate-400">Uses the subset construction algorithm to convert this Non-Deterministic Automaton into a strict Deterministic Finite Automaton.</p>
          </div>
          <button
            onClick={handleConvert} disabled={loading}
            className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/20 px-6 py-2 rounded-lg transition-colors flex justify-center items-center gap-2 font-semibold"
          >
            <GitMerge size={18} /> Generate DFA Output
          </button>
        </div>

        {dfaResult && (
          <div className="mt-4 p-6 bg-slate-900 rounded-xl border border-cyan-500/20 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">New DFA Alphabet</h4>
              <div className="flex gap-2">
                {dfaResult.alphabet.map((a, i) => <span key={i} className="bg-slate-800 text-cyan-300 px-2 py-1 rounded text-xs font-mono">{a}</span>)}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">New Start & Accept States</h4>
              <p className="text-xs text-slate-400">Start: <span className="text-cyan-400 font-mono">{dfaResult.startState}</span></p>
              <div className="flex gap-2 mt-1 flex-wrap">
                <span className="text-xs text-slate-400">Accepting:</span>
                {dfaResult.acceptStates.length === 0 ? <span className="text-xs text-slate-500">None</span> :
                  dfaResult.acceptStates.map((s, i) => <span key={i} className="text-emerald-400 font-mono text-xs">{s}</span>)
                }
              </div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">DFA Transitions</h4>
              <div className="flex flex-col items-start gap-2">
                {dfaResult.transitions.map((t, i) => (
                  <div key={i} className="bg-slate-800 px-4 py-2 rounded border border-slate-700 flex items-center gap-6 font-mono text-xs">
                    <span className="text-cyan-400" title={t.from}>{t.from.length > 10 ? t.from.substring(0, 8) + '...' : t.from}</span>
                    <span className="text-slate-500">--({t.read}){"-->"}</span>
                    <span className="text-emerald-400" title={t.to}>{t.to.length > 10 ? t.to.substring(0, 8) + '...' : t.to}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 mt-4 relative h-[500px] border border-cyan-500/20 rounded-xl overflow-hidden glass-panel">
              <div className="absolute top-4 left-4 z-10 bg-slate-900/80 px-3 py-1 rounded text-cyan-400 font-bold border border-cyan-500/30">
                Generated Equivalent DFA Graph
              </div>
              <GraphEditor
                nodes={dfaNodes}
                setNodes={setDfaNodes}
                edges={dfaEdges}
                setEdges={setDfaEdges}
                defaultEdgeLabel="a"
                isLocked={true}
              />
            </div>
          </div>
        )}
      </div>

    </div>

  );
}
