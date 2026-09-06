# Qubiq Academy — Interactive Quantum Computing Learning Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E.svg?logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An enterprise-grade, interactive educational web application designed to teach quantum computing from first principles through hands-on circuit composition, real-time quantum statevector simulation, interactive 3D Bloch spheres, algorithmic visualizers, LeetCode-style coding challenges, and a context-aware AI tutor powered by Google Gemini.

---

## Table of Contents

- [1. Project Overview](#1-project-overview)
  - [What is Qubiq Academy?](#what-is-qubiq-academy)
  - [Core Features](#core-features)
  - [Technology Stack](#technology-stack)
- [2. Getting Started](#2-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running Locally](#running-locally)
- [3. Project Structure](#3-project-structure)
  - [Directory Tree](#directory-tree)
  - [Key Architecture Components](#key-architecture-components)
- [4. API & Backend Architecture](#4-api--backend-architecture)
  - [Supabase Database Schema](#supabase-database-schema)
  - [Edge Functions](#edge-functions)
  - [Request & Response Payloads](#request--response-payloads)
  - [Error Codes](#error-codes)
- [5. Development & Testing](#5-development--testing)
  - [Available Scripts](#available-scripts)
  - [Linting & Code Quality](#linting--code-quality)
  - [Contribution Guidelines](#contribution-guidelines)
- [6. Deployment](#6-deployment)
  - [Production Build](#production-build)
  - [Environment Variables Checklist](#environment-variables-checklist)
  - [Recommended Hosting](#recommended-hosting)
- [7. Troubleshooting](#7-troubleshooting)
  - [Common Issues & Workarounds](#common-issues--workarounds)
- [8. License & Contact](#8-license--contact)

---

## 1. Project Overview

### What is Qubiq Academy?

**Qubiq Academy** bridges the gap between abstract quantum physics equations and executable quantum programming. Rather than passively reading formulas, learners manipulate individual qubits, drag-and-drop quantum logic gates, observe wavefunction collapse, inspect entanglement correlations, and write production-grade Qiskit Python code directly in their browser.

### Core Features

- **Interactive Quantum Circuit Composer**:
  - Drag-and-drop workspace supporting 1 to 8 qubits.
  - Comprehensive 13-gate library: Single-Qubit ($H, X, Y, Z, S, T$), Continuous Rotations ($R_X, R_Y, R_Z$), Multi-Qubit Entanglers ($CNOT, CZ, SWAP$), and Projective Measurement.
  - Non-clipping hover tooltips with 2-second intent delay and parameter information.
  - Full Undo/Redo history stack and circuit JSON serialization.

- **Pure TypeScript Statevector Simulator**:
  - In-browser complex linear algebra simulation without server roundtrips.
  - Accurate 1024-shot Born rule probability sampling.
  - Generates state amplitude tables with phase angles and probabilities.

- **3D Bloch Sphere Visualization**:
  - Interactive Three.js / React Three Fiber unit sphere with smooth 60fps orbital controls.
  - Zero-lag synchronous mounting with `@react-three/drei` 3D-anchored DOM labels (`|0⟩`, `|1⟩`, `X`, `Y`, `Z`), text glows, and real-time statevector tracking.
  - Clamped container layout architecture preventing canvas ResizeObserver loops.

- **Bidirectional Qiskit Python Code Editor**:
  - Embedded Monaco code editor with dynamic dark/light theme switching.
  - Automatic translation of visual circuit diagrams into modern Qiskit 1.0+ code with `AerSimulator` fallback.
  - Live reverse parser converting typed Python code into visual circuit gates.

- **Comprehensive Structured Curriculum & Modern Study Navigator**:
  - 6 deep-dive chapters covering Superposition, Born Rule Measurement, Entanglement & Bell Pairs, Quantum Teleportation, Grover's Search Algorithm, and Deutsch-Jozsa.
  - Interactive custom visualizers embedded directly inside lessons.
  - **Distraction-Free Reading Workspace**: Spacious `max-w-4xl` centered layout with zero permanent sidebar clutter.
  - **Top-Bar Module Switcher Popover**: 1-click module switching from anywhere with real-time status indicators.
  - **Slide-Over Study Drawer**: Glassmorphic overlay drawer featuring interactive Syllabus track accordions, Glossary terminology, and an auto-saving personal Notebook.

- **LeetCode-Style Quantum Problems Catalog**:
  - 17 challenge problems spanning Beginner to Advanced tiers.
  - Integrated verification test runner evaluating gate requirements, circuit depth, and target statevector tolerances.

- **Context-Aware AI Tutor with 1-Tap Socratic Elaboration**:
  - Grounded quantum physics tutor powered by Google Gemini and Supabase Edge Functions.
  - **1-Tap Section Elaboration**: Single click sends contextual explanations tailored to the learner's completed modules level.
  - **Socratic Understanding Checks**: Proactively asks diagnostic check questions to test comprehension and reinforce key quantum intuitions.
  - Strictly sandboxed away from problem evaluations to preserve academic integrity.

- **User Profiles, Streaks & Cloud Persistence**:
  - Supabase Auth (Email/Password with auto-provisioning).
  - Custom user bio, avatar customization, dark/light theme toggle, streak tracking, and unlockable achievement badges.

### Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript 5.9, Vite 6.2 |
| **Styling & Theme** | TailwindCSS v4, Custom CSS Design Tokens (`--void`, `--panel`, `--paper`, `--signal-cyan`, `--cryostat-gold`) |
| **3D Rendering** | Three.js, `@react-three/fiber`, `@react-three/drei` |
| **Code Editor** | `@monaco-editor/react` (Python language server) |
| **Icons & Media** | `lucide-react` (Strict zero-diamond aesthetic policy) |
| **State Management** | Zustand (Circuit, Chat, Profile, and Progress stores) |
| **Database & Auth** | Supabase (PostgreSQL 15, Row-Level Security, Edge Functions) |
| **AI Integration** | Google Generative AI SDK (`gemini-3.6-flash` / `gemini-2.5-flash`) |

---

## 2. Getting Started

### Prerequisites

- **Node.js**: Version `18.0.0` or later (tested on Node v20 & v25).
- **Package Manager**: `npm` (v9+), `pnpm`, or `yarn`.
- **Supabase Account**: (Optional for local development; app has robust offline localStorage fallback).
- **Google Gemini API Key**: (Optional for AI Tutor; platform works with built-in responses if absent).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Adn-exe/QubicAcademy.git
   cd QubicAcademy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Configuration

Copy the example environment template:
```bash
cp .env.example .env
```

Configure your credentials in `.env`:
```env
# Google Gemini API Key for AI Tutor (optional)
VITE_GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere

# Preferred AI Model
VITE_AI_MODEL=gemini-3.6-flash

# Supabase Cloud Configuration (optional for cloud sync)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Running Locally

Start the Vite development server:
```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## 3. Project Structure

### Directory Tree

```
QubicAcademy/
├── public/                     # Static assets and icons
├── src/
│   ├── components/
│   │   ├── AITutor/            # Floating AI Assistant panel & message formatter
│   │   ├── CircuitBuilder/     # Wire canvas, gate palette, toolbar controls
│   │   ├── CodeEditor/         # Monaco editor with Qiskit codegen & sync
│   │   ├── Layout/             # Navbar, footer, navigation drawers
│   │   ├── Profile/            # Edit profile modal, avatar customizer
│   │   └── Visualization/      # 3D Bloch sphere, probability histograms, step visualizers
│   ├── core/
│   │   ├── AuthContext.tsx     # Supabase auth session provider
│   │   ├── profileStore.ts     # Profile, streak, and settings store
│   │   ├── qiskit-codegen.ts   # Visual Circuit ↔ Qiskit Python translation engine
│   │   ├── simulator.ts        # Browser matrix statevector quantum engine
│   │   ├── store.ts            # Circuit state, step history, and active gates
│   │   └── types.ts            # Canonical TypeScript domain interfaces
│   ├── data/
│   │   ├── announcementsData.ts # Workstation announcements
│   │   ├── challenges/         # Guided challenge presets
│   │   ├── modules/            # Curriculum chapters and interactive content
│   │   └── problems/           # LeetCode-style quantum problem bank
│   ├── lib/
│   │   ├── db.ts               # Supabase database client and sync queries
│   │   └── supabase.ts         # Supabase client initialization
│   ├── pages/
│   │   ├── AnnouncementsPage.tsx
│   │   ├── AuthPage.tsx        # Sign in & Registration
│   │   ├── ChallengePage.tsx   # Interactive verification challenge runner
│   │   ├── LabPage.tsx         # Fullscreen Circuit Builder Studio
│   │   ├── LandingPage.tsx     # Hero overview & Mac-style composer demo
│   │   ├── ModulePage.tsx      # Curriculum lesson reader with embedded visualizers
│   │   ├── ProblemsPage.tsx    # Quantum problem catalog with filters
│   │   └── ProfilePage.tsx     # User progress, badges, and activity heatmaps
│   ├── services/
│   │   └── ai-tutor.ts         # Gemini LLM streaming service with guardrails
│   ├── App.tsx                 # Root router and layout wrapper
│   ├── index.css               # Design system tokens and light/dark theme rules
│   └── main.tsx                # Application entrypoint
├── supabase/
│   ├── functions/tutor/        # Supabase Edge Function for server-side AI proxy
│   └── schema.sql              # PostgreSQL schema, tables, and RLS policies
├── .env.example                # Sample environment variables
├── .gitignore                  # Git tracking rules
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Key Architecture Components

- **`src/core/simulator.ts`**: Implements pure TypeScript matrix operations ($2^N$ statevectors) for tensor products, arbitrary single-qubit unitary matrices, and controlled operations.
- **`src/core/qiskit-codegen.ts`**: Bi-directional translator. Converts circuit steps to Python code compliant with Qiskit 1.0+, and parses typed Qiskit syntax into canvas gates.
- **`src/components/AITutor/TutorPanel.tsx`**: Floating assistant with direct deep-link buttons (`[text](url)`). Automatically disabled in problem evaluations to guarantee exam integrity.

---

## 4. API & Backend Architecture

### Supabase Database Schema

The database schema (`supabase/schema.sql`) implements comprehensive **Row Level Security (RLS)** ensuring users can only read and mutate their own records:

1. **`public.profiles`**: Stores user display name, bio, role, avatar initials, theme preference, and streak notification preferences.
2. **`public.progress`**: Tracks completed module IDs, passed challenges, current practice streaks, and solved problems.
3. **`public.circuits`**: Persists saved quantum circuits in JSON format.
4. **`public.problems`**: Stores global coding problems, difficulty levels, target statevectors, and test assertions.
5. **`public.problem_submissions`**: Historical record of code submissions with pass/fail telemetry.

### Edge Functions

- **`supabase/functions/tutor/index.ts`**: Secure serverless proxy routing AI tutor queries through Google Gemini without exposing API keys to the client.

### Request & Response Payloads

#### AI Tutor Chat Endpoint (`POST /functions/v1/tutor`)

**Request:**
```json
{
  "message": "How does the Hadamard gate create superposition?",
  "context": {
    "currentCircuit": {
      "name": "Bell State",
      "numQubits": 2,
      "steps": [{ "gates": [{ "type": "H", "qubit": 0 }] }]
    }
  }
}
```

**Response (200 OK):**
```json
{
  "reply": "The **Hadamard (H) gate** transforms the computational basis states into equal superpositions:\n\n$$H|0\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}} = |+\\rangle$$\n\nExplore this in [Module 1: Superposition](/learn/superposition-single-qubit) or open the [Quantum Lab](/lab)."
}
```

### Error Codes

| Status Code | Code Identifier | Meaning |
| :--- | :--- | :--- |
| `200` | `OK` | Request succeeded. |
| `400` | `BAD_REQUEST` | Malformed JSON or missing required fields. |
| `401` | `UNAUTHORIZED` | User session token expired or missing. |
| `403` | `FORBIDDEN` | Accessing problem evaluation hints (guardrail triggered). |
| `429` | `RATE_LIMITED` | Cooldown active (3-second spacing enforced). |
| `500` | `INTERNAL_SERVER_ERROR` | Upstream provider error or database connection failure. |

---

## 5. Development & Testing

### Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts local Vite dev server with Hot Module Replacement (`HMR`) |
| `npm run build` | Compiles TypeScript (`tsc -b`) and bundles production assets via Vite |
| `npm run preview` | Locally serves the optimized production build from `dist/` |
| `npm run lint` | Runs Oxlint across all TypeScript and TSX source files |

### Testing & Validation

Run the internal simulation and codegen verification test:
```bash
npm run build
```
The build process strictly enforces type checking and bundle sanity checks.

### Contribution Guidelines

1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/quantum-teleportation-enhancement
   ```
2. Follow established naming conventions and clean design tokens (`--signal-cyan`, `--cryostat-gold`).
3. **Strict Aesthetic Rule**: Do not introduce diamond or sparkle icons anywhere in the UI.
4. Ensure `npm run build` passes with zero TypeScript warnings before opening a Pull Request.

---

## 6. Deployment

### Production Build

Create an optimized static distribution:
```bash
npm run build
```
Output files are packaged into the `dist/` directory.

### Environment Variables Checklist

Ensure the following variables are configured in your production environment settings:

```env
VITE_GEMINI_API_KEY=AIzaSy...
VITE_AI_MODEL=gemini-3.6-flash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Recommended Hosting

- **Vercel / Netlify / Cloudflare Pages**: Deploy directly by connecting the GitHub repository.
  - **Build Command**: `npm run build`
  - **Publish Directory**: `dist`
  - **SPA Rewrites**: Add rewrite rules from `/*` to `/index.html` for client-side routing.

---

## 7. Troubleshooting

### Common Issues & Workarounds

#### 1. Qiskit Code Generation Incompatibility
- **Issue**: Running generated Python code fails with `QiskitError: circuit already has classical registers`.
- **Solution**: Qubiq Academy automatically detects whether explicit measurements are configured. If no measurement gates exist, it generates `qc.measure_all()`; if explicit measurements exist, it provisions matching classical registers.

#### 2. Gate Palette Tooltip Clipping
- **Issue**: Gate tooltips clipped by parent container boundaries.
- **Solution**: All tooltips render via React Portals (`createPortal`) directly into `document.body`, completely bypassing ancestor `overflow: hidden` or `backdrop-filter` clipping contexts.

#### 3. AI Tutor Absent in Problems Section
- **Issue**: The AI Tutor launcher button does not appear on `/problems` or `/challenge/:id`.
- **Behavior**: This is intentional. The AI Tutor is programmatically disabled in all problem sections to preserve challenge integrity.

#### 4. Light Mode Theme Inconsistencies
- **Issue**: Text or panels showing dark backgrounds when light theme is active.
- **Solution**: The application uses the `light-theme` class on `<html>` paired with custom CSS variables (`--void`, `--panel`, `--paper`, `--ink`). Verify that browser extensions are not forcing dark styles.

---

## 8. License & Contact

Distributed under the **MIT License**. See `LICENSE` for more information.

- **Repository**: [https://github.com/Adn-exe/QubicAcademy.git](https://github.com/Adn-exe/QubicAcademy.git)
- **Author**: Mohammed Adnan ([@Adn-exe](https://github.com/Adn-exe))
- **Project**: Qubiq Academy Quantum Platform
