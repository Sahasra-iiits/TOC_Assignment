const express = require('express');
const router = express.Router();
const { simulateDFA, dfaToRegex } = require('../logic/dfaLogic');

// POST /api/dfa/simulate
router.post('/simulate', (req, res) => {
  const { states, alphabet, transitions, startState, acceptStates, inputString } = req.body;
  try {
    const result = simulateDFA({ states, alphabet, transitions, startState, acceptStates }, inputString);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/dfa/regex
router.post('/regex', (req, res) => {
  const { states, alphabet, transitions, startState, acceptStates } = req.body;
  try {
    const regex = dfaToRegex({ states, alphabet, transitions, startState, acceptStates });
    res.json({ regex });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
