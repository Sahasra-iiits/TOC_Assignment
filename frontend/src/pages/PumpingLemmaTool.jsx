import React, { useState } from 'react';
import { checkPumpingLemma } from '../api';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { Cpu, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const renderTextWithMath = (text) => {
  const parts = text.split('$');
  return parts.map((part, index) => {
    // Every odd index is inside $ $
    if (index % 2 === 1) {
      return <InlineMath key={index} math={part} />;
    }
    // Remove markdown bolding ** for simple span bolding
    return (
      <span key={index} dangerouslySetInnerHTML={{ __html: part.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
    );
  });
};

export default function PumpingLemmaTool() {
  const [description, setDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!description) return;
    setLoading(true);
    try {
      const res = await checkPumpingLemma(description);
      setResult(res);
    } catch (e) {
      console.error(e);
      setResult({ isRegular: null, message: "Error analyzing language." });
    }
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-2">
          Pumping Lemma Checker
        </h1>
        <p className="text-slate-400 max-w-2xl">
          Enter a language description to check if it's Regular or Non-Regular. For non-regular languages, 
          a step-by-step mathematical contradiction will be generated. 
          <br/>
          <span className="text-xs text-emerald-500">Examples: a^n b^n, a^n b^n c^n, palindrome</span>
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row gap-4 border border-emerald-500/20">
        <input 
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. a^n b^n"
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
        />
        <button 
          onClick={handleCheck}
          disabled={loading}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Cpu />}
          Analyze
        </button>
      </div>

      {result && (
        <div className={`flex-1 glass-panel p-8 rounded-2xl border transition-all duration-500 animate-in fade-in slide-in-from-bottom-4
          ${result.isRegular ? 'border-cyan-500/30' : 'border-purple-500/30'}`}
        >
          <div className="flex items-center gap-3 mb-6">
            {result.isRegular ? (
              <CheckCircle className="text-cyan-400 w-8 h-8 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            ) : (
              <XCircle className="text-purple-400 w-8 h-8 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            )}
            <h2 className="text-2xl font-semibold">
              {renderTextWithMath(result.message)}
            </h2>
          </div>

          {!result.isRegular && result.steps && (
            <div className="space-y-4 mt-8 bg-slate-900/50 p-6 rounded-xl border border-white/5 relative overflow-hidden">
              {/* Decorative accent */}
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-transparent"></div>
              
              <h3 className="text-lg font-medium text-slate-300 mb-4 border-b border-white/10 pb-2">Contradiction Proof</h3>
              
              <ul className="space-y-4">
                {result.steps.map((step, idx) => (
                  <li key={idx} className="text-slate-300 leading-relaxed font-light text-[1.05rem]">
                    {renderTextWithMath(step)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
