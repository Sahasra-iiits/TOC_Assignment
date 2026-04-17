// backend/logic/dfaLogic.js

/**
 * Simulates a DFA step by step.
 * @param {Object} dfa 
 * @param {string} inputString 
 * @returns {Object} { accept: boolean, trace: Array<{state, symbol, nextState}> }
 */
function simulateDFA(dfa, inputString) {
  const { startState, acceptStates, transitions } = dfa;
  let currentState = startState;
  const trace = [];

  for (let i = 0; i < inputString.length; i++) {
    const symbol = inputString[i];
    
    // Find transition for (currentState, symbol)
    // Transitions format: [{ from: 'q0', read: 'a', to: 'q1' }, ...]
    const transition = transitions.find(t => t.from === currentState && t.read === symbol);
    
    if (!transition) {
      trace.push({ state: currentState, symbol, nextState: null, error: 'No transition defined' });
      return { accept: false, trace, message: `Rejected: No transition for state ${currentState} on symbol ${symbol}.` };
    }
    
    trace.push({ state: currentState, symbol, nextState: transition.to });
    currentState = transition.to;
  }

  const isAccepted = acceptStates.includes(currentState);
  return {
    accept: isAccepted,
    trace,
    finalState: currentState,
    message: isAccepted ? `Accepted: Stopped at accept state ${currentState}.` : `Rejected: Stopped at non-accept state ${currentState}.`
  };
}

/**
 * Implements State Elimination method to convert DFA to Regex.
 */
function dfaToRegex(dfa) {
  let { states, startState, acceptStates, transitions } = dfa;

  // Add a new global start state qs and global accept state qf
  const qs = 'qs_new';
  const qf = 'qf_new';
  
  let newStates = [qs, qf, ...states];
  
  // Convert transitions to an adjacency matrix of regexes
  // adj[from][to] = regex string
  let adj = {};
  newStates.forEach(s => {
    adj[s] = {};
    newStates.forEach(t => {
      adj[s][t] = null;
    });
  });

  // Populate initial transitions
  transitions.forEach(t => {
    if (adj[t.from][t.to]) {
      adj[t.from][t.to] = `(${adj[t.from][t.to]}+${t.read})`;
    } else {
      adj[t.from][t.to] = t.read;
    }
  });

  // Connect qs to startState with epsilon (e)
  adj[qs][startState] = '\\epsilon'; // kaTeX epsilon
  
  // Connect all accept states to qf with epsilon
  acceptStates.forEach(s => {
    if (adj[s][qf]) {
      adj[s][qf] = `(${adj[s][qf]}+\\epsilon)`;
    } else {
      adj[s][qf] = '\\epsilon';
    }
  });

  // Helper to unify expressions (A+B)
  const union = (a, b) => {
    if (!a && !b) return null;
    if (!a) return b;
    if (!b) return a;
    if (a === '\\epsilon' && b === '\\epsilon') return '\\epsilon';
    return `(${a}+${b})`;
  };

  // Helper to concat (AB)
  const concat = (a, b) => {
    if (!a || !b) return null;
    if (a === '\\epsilon') return b;
    if (b === '\\epsilon') return a;
    return `${a}${b}`;
  };

  // Helper for kleene star (A*)
  const star = (a) => {
    if (!a) return '\\epsilon'; // empty set star is epsilon
    if (a === '\\epsilon') return '\\epsilon';
    if (a === '\\emptyset') return '\\epsilon';
    if (a.length === 1) return `${a}^*`;
    // Just wrap in parens to be safe, unless it's exactly one perfectly wrapped group
    if (a.startsWith('(') && a.endsWith(')') && (a.match(/\(/g) || []).length === 1) {
       return `${a}^*`;
    }
    return `(${a})^*`;
  };

  // Eliminate all original states one by one
  for (let k of states) {
    // For every pair (i, j) of remaining states
    for (let i of newStates) {
      for (let j of newStates) {
        if (i === k || j === k) continue; // skip the state being eliminated
        
        let pathThroughK = concat(concat(adj[i][k], star(adj[k][k])), adj[k][j]);
        if (pathThroughK) {
          adj[i][j] = union(adj[i][j], pathThroughK);
        }
      }
    }
    
    // Remove k from newStates list conceptually
    // Just clear its entries to free memory
    for (let s of newStates) {
      adj[k][s] = null;
      adj[s][k] = null;
    }
  }

  // The simplified regex is from qs to qf
  let finalRegex = adj[qs][qf] || '\\emptyset'; // kaTeX emptyset
  
  // Basic cleanup for excessive parens where unnecessary could be done here,
  // but we keep it simple since we just need mathematical representation.
  return finalRegex;
}

module.exports = {
  simulateDFA,
  dfaToRegex
};
