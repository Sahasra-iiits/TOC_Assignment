// backend/logic/ndfaLogic.js

/**
 * Simulates NDFA step by step finding all possible paths.
 */
/**
 * Simulates NDFA step by step finding all possible paths.
 */
function simulateNDFA(ndfa, inputString) {
  const { startState, acceptStates, transitions } = ndfa;

  // We explore all possible paths using a queue to find valid traces.
  // Each element in queue is { currentPath: Array, remainingInput: string }
  // A step in currentPath is { state, symbol, nextState }
  
  let queue = [{ 
    path: [{ state: startState }], 
    remainingInput: inputString 
  }];
  
  let results = [];
  let visited = new Set(); // To prevent infinite epsilon loops per input stage

  // We track valid completions
  let allCompletedPaths = [];

  while (queue.length > 0) {
    let { path, remainingInput } = queue.shift();
    let currentState = path[path.length - 1].state;
    
    // Create a unique key for visited: (state, inputLength)
    let visitKey = `${currentState}-${remainingInput.length}`;
    if (visited.has(visitKey)) {
      // We already reached this state with this much input remaining
      // In NDFA, reaching the same state via different epsilon paths is redundant for simulation
      // unless we want EVERY possible path. We'll capture a representative set.
      if (visited.size > 1000) continue; // Safety break for complex graphs
    }
    visited.add(visitKey);

    // 1. Try Epsilon transitions (no input consumed)
    transitions.forEach(t => {
      if (t.from === currentState && t.read === 'e') {
        const newPath = [...path];
        newPath[newPath.length - 1].symbol = 'e';
        newPath[newPath.length - 1].nextState = t.to;
        newPath.push({ state: t.to });
        queue.push({ path: newPath, remainingInput });
      }
    });

    // 2. Try Symbol transitions (consumes one character)
    if (remainingInput.length > 0) {
      const symbol = remainingInput[0];
      transitions.forEach(t => {
        if (t.from === currentState && t.read === symbol) {
          const newPath = [...path];
          newPath[newPath.length - 1].symbol = symbol;
          newPath[newPath.length - 1].nextState = t.to;
          newPath.push({ state: t.to });
          queue.push({ path: newPath, remainingInput: remainingInput.slice(1) });
        }
      });
    } else {
      // Input fully consumed
      allCompletedPaths.push(path);
    }
  }

  // Filter for accepting paths (last state must be an accept state)
  const acceptingPaths = allCompletedPaths.filter(p => acceptStates.includes(p[p.length - 1].state));
  const isAccepted = acceptingPaths.length > 0;

  return {
    accept: isAccepted,
    acceptingPaths: acceptingPaths.slice(0, 10), // Return max 10 for UI
    allPaths: allCompletedPaths.slice(0, 10),
    message: isAccepted 
      ? `Accepted: Found ${acceptingPaths.length} valid accepting path(s).` 
      : `Rejected: No path ended in an accept state after consuming input.`
  };
}

/**
 * Converts NDFA to DFA using Subset Construction.
 */
function ndfaToDfa(ndfa) {
  const { states, alphabet, transitions, startState, acceptStates } = ndfa;
  
  const getEpsilonClosure = (stateSet) => {
    let closure = new Set(stateSet);
    let stack = [...stateSet];
    while(stack.length > 0) {
      let s = stack.pop();
      transitions.forEach(t => {
        if(t.from === s && t.read === 'e' && !closure.has(t.to)) {
          closure.add(t.to);
          stack.push(t.to);
        }
      });
    }
    return Array.from(closure).sort();
  };

  const getNextStates = (stateSet, symbol) => {
    let next = new Set();
    stateSet.forEach(s => {
      transitions.forEach(t => {
        if (t.from === s && t.read === symbol) {
          next.add(t.to);
        }
      });
    });
    return getEpsilonClosure(Array.from(next));
  };

  let dfaStates = [];
  let dfaTransitions = [];
  
  // Initial subset: Epsilon closure of start state
  let initialSubset = getEpsilonClosure([startState]);
  let queue = [initialSubset];
  
  // name mapping subset array -> string (e.g. ['q0', 'q1'] -> "q0,q1")
  const getName = (subset) => subset.length > 0 ? `{${subset.join(',')}}` : "{Trap}";
  
  let visited = new Set();
  visited.add(getName(initialSubset));
  dfaStates.push(getName(initialSubset));

  const validAlphabet = alphabet.filter(a => a !== 'e');

  while(queue.length > 0) {
    let currentSubset = queue.shift();
    let currentName = getName(currentSubset);
    
    validAlphabet.forEach(symbol => {
      let nextSubset = getNextStates(currentSubset, symbol);
      let nextName = getName(nextSubset);
      
      if (!visited.has(nextName)) {
        visited.add(nextName);
        dfaStates.push(nextName);
        queue.push(nextSubset);
      }
      
      dfaTransitions.push({
        from: currentName,
        read: symbol,
        to: nextName
      });
    });
  }

  // Determine accept states
  let dfaAcceptStates = dfaStates.filter(s => {
    // extract state names from string "{q0,q1}"
    let parsed = s.replace(/[{}]/g, '').split(',');
    return parsed.some(ps => acceptStates.includes(ps));
  });

  return {
    states: dfaStates,
    alphabet: validAlphabet,
    transitions: dfaTransitions,
    startState: getName(initialSubset),
    acceptStates: dfaAcceptStates
  };
}

module.exports = {
  simulateNDFA,
  ndfaToDfa
};
