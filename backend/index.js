const express = require('express');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Import logic routers
const dfaRoutes = require('./routes/dfa');
const ndfaRoutes = require('./routes/ndfa');
const pumpingRoutes = require('./routes/pumping');

app.use('/api/dfa', dfaRoutes);
app.use('/api/ndfa', ndfaRoutes);
app.use('/api/pumping-lemma', pumpingRoutes);

// Fallbacks for Vercel if it strips the routePrefix automatically
app.use('/dfa', dfaRoutes);
app.use('/ndfa', ndfaRoutes);
app.use('/pumping-lemma', pumpingRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Automata Toolkit backend listening at http://localhost:${port}`);
  });
}

// Export the app for Vercel Serverless Functions
module.exports = app;
