# ⚙️ Automata Toolkit

A modern, full-stack application for building, simulating, and analyzing Finite Automata. It features an interactive graph editor for crafting DFAs and NDFAs, backed by a robust mathematical engine to perform state elimination, subset construction, and regular language validation.

## 🌟 Features

- **Interactive Graph Editor**: Drag-and-drop nodes and edges to design structural state machines seamlessly using `React Flow`.
- **DFA Simulation & Regex Generation**: 
  - Trace input strings through state paths.
  - Automatically convert Deterministic Finite Automata to equivalent Regular Expressions using the State Elimination method.
- **NDFA Power Tools**: 
  - Simulate Non-Deterministic Automata (including $\epsilon$-transitions).
  - Convert NDFA to DFA via automatic Subset Construction algorithms.
- **Pumping Lemma Analysis**: Validate and check whether specific theoretical languages classify as regular contexts.
- **Live Visual Feedback**: View detailed trace breakdowns and KaTeX-rendered mathematical structures.
- **Live Transitions**: View live transitions while crafting automatas and delete unwanted transitions by clicking on them.

---

## 🛠️ Tech Stack

**Frontend:**
- Vite + React 19
- TailwindCSS for modern, high-contrast UI design
- React Flow for complex graph node visualization
- KaTeX for beautiful mathematical expression rendering

**Backend:**
- Node.js + Express

---

## Usage of AI 
This project is vibe coded.

---

## ☁️ Deployment (Vercel)

This project is deployed on **Vercel** utilizing Vercel's `experimentalServices` structure.

Deployment link : "https://automata-toolkit.vercel.app/"
