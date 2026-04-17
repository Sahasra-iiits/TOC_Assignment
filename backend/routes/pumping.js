const express = require('express');
const router = express.Router();
const { checkPumpingLemma } = require('../logic/pumpingLogic');

// POST /api/pumping-lemma
router.post('/', (req, res) => {
  const { languageDescription } = req.body;
  try {
    const result = checkPumpingLemma(languageDescription);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
