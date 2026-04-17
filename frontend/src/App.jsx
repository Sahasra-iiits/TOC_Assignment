import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DFATool from './pages/DFATool';
import NDFATool from './pages/NDFATool';
import PumpingLemmaTool from './pages/PumpingLemmaTool';
import { Cpu, TerminalSquare, GitBranch } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
        <nav className="border-b border-white/10 glass-panel sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center space-x-2">
                <Cpu className="w-8 h-8 text-cyan-400" />
                <span className="font-bold text-xl tracking-tight text-white text-glow-cyan">
                  Automata<span className="text-cyan-400">Toolkit</span>
                </span>
              </Link>
              <div className="flex space-x-6">
                <Link to="/dfa" className="hover:text-cyan-400 transition-colors flex items-center space-x-1">
                  <TerminalSquare className="w-4 h-4" />
                  <span>DFA</span>
                </Link>
                <Link to="/ndfa" className="hover:text-purple-400 transition-colors flex items-center space-x-1">
                  <GitBranch className="w-4 h-4" />
                  <span>NDFA</span>
                </Link>
                <Link to="/pumping-lemma" className="hover:text-emerald-400 transition-colors flex items-center space-x-1">
                  <Cpu className="w-4 h-4" />
                  <span>Pumping Lemma</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)]">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dfa" element={<DFATool />} />
            <Route path="/ndfa" element={<NDFATool />} />
            <Route path="/pumping-lemma" element={<PumpingLemmaTool />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
