import { Link } from 'react-router-dom';
import { TerminalSquare, GitBranch, Settings } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-12">
      <div className="text-center space-y-4 max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 pb-2">
          Master Automata Theory
        </h1>
        <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed">
          An interactive, visual toolkit to design, simulate, and analyze Finite Automata and Regular Languages. 
          Build powerful models with our neon-glow graph editor.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl px-4">
        <Link to="/dfa" className="group glass-panel rounded-2xl p-8 hover:bg-white/5 transition-all duration-300 border border-cyan-500/20 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] flex flex-col items-center text-center space-y-4">
          <div className="p-4 rounded-full bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform duration-300">
            <TerminalSquare size={40} />
          </div>
          <h2 className="text-2xl font-semibold text-white">DFA Simulator</h2>
          <p className="text-slate-400 text-sm">
            Draw Deterministic Finite Automata, simulate string traversals step-by-step, and auto-generate Regular Expressions.
          </p>
        </Link>
        
        <Link to="/ndfa" className="group glass-panel rounded-2xl p-8 hover:bg-white/5 transition-all duration-300 border border-purple-500/20 hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] flex flex-col items-center text-center space-y-4">
          <div className="p-4 rounded-full bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform duration-300">
            <GitBranch size={40} />
          </div>
          <h2 className="text-2xl font-semibold text-white">NDFA Simulator</h2>
          <p className="text-slate-400 text-sm">
            Simulate Non-Deterministic branching paths, and algorithmically convert NDFA models to strictly equivalent DFAs.
          </p>
        </Link>

        <Link to="/pumping-lemma" className="group glass-panel rounded-2xl p-8 hover:bg-white/5 transition-all duration-300 border border-emerald-500/20 hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col items-center text-center space-y-4">
          <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
            <Settings size={40} />
          </div>
          <h2 className="text-2xl font-semibold text-white">Pumping Lemma</h2>
          <p className="text-slate-400 text-sm">
            Check string patterns and languages for regularity. Automatically generate step-by-step mathematical contradiction proofs.
          </p>
        </Link>
      </div>
    </div>
  );
}
