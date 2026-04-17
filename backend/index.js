const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Import logic routers
const dfaRoutes = require('./routes/dfa');
const ndfaRoutes = require('./routes/ndfa');
const pumpingRoutes = require('./routes/pumping');

app.use('/api/dfa', dfaRoutes);
app.use('/api/ndfa', ndfaRoutes);
app.use('/api/pumping-lemma', pumpingRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Automata Toolkit backend listening at http://localhost:${port}`);
});
