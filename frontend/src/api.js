import axios from 'axios';

// Use Vite's environment variable to determine if we're in production on Vercel
const API_BASE = import.meta.env.PROD ? '/_/backend/api' : 'http://localhost:5000/api';

export const simulateDFA = async (data) => {
  const res = await axios.post(`${API_BASE}/dfa/simulate`, data);
  return res.data;
};

export const dfaToRegex = async (data) => {
  const res = await axios.post(`${API_BASE}/dfa/regex`, data);
  return res.data;
};

export const simulateNDFA = async (data) => {
  const res = await axios.post(`${API_BASE}/ndfa/simulate`, data);
  return res.data;
};

export const ndfaToDfa = async (data) => {
  const res = await axios.post(`${API_BASE}/ndfa/convert`, data);
  return res.data;
};

export const checkPumpingLemma = async (languageDescription) => {
  const res = await axios.post(`${API_BASE}/pumping-lemma`, { languageDescription });
  return res.data;
};
