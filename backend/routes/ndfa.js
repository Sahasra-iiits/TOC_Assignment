const express = require('express');
const router = express.Router();
const { simulateNDFA, ndfaToDfa } = require('../logic/ndfaLogic');

// POST /api/ndfa/simulate
router.post('/simulate', (req, res) => {
  const { states, alphabet, transitions, startState, acceptStates, inputString } = req.body;
  try {
    const result = simulateNDFA({ states, alphabet, transitions, startState, acceptStates }, inputString);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/ndfa/convert
router.post('/convert', (req, res) => {
  const { states, alphabet, transitions, startState, acceptStates } = req.body;
  try {
    const dfa = ndfaToDfa({ states, alphabet, transitions, startState, acceptStates });
    res.json(dfa); // Returns equivalent DFA
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
