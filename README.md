# AI Contract Review Assistant

An evidence-grounded, full-stack AI contract review platform built strictly in accordance with the single source of truth specification ([spec.md](file:///c:/Users/HP/OneDrive/Desktop/Contract%20review%20assistant/spec.md)).

Signed-in users can upload legal contracts in **PDF**, **DOCX**, or **TXT** format (up to 20 MB). The system extracts the text, preserves page and section references, partitions content into semantic chunks, and generates evidence-grounded reviews against a fixed 8-item legal checklist with backend quote verification and interactive streaming follow-up chat.

---

## 🌟 Key Capabilities & Requirements Implemented

### 1. Mandatory User Ownership & Security (Clerk)
- **Clerk Authentication**: Frontend user signup, signin, and signout via `@clerk/react`.
- **Backend Token Verification**: Derives user identity exclusively from the verified Clerk session token (`sub`).
- **Complete Tenant Isolation**: Every contract, chunk, review finding, vector retrieval, and chat message is strictly scoped to the authenticated user ID (`{ ownerId: req.auth.userId }`). Cross-tenant access attempts return `404 Not Found`.

### 2. Contract Upload & Pipeline
- **Formats & Limits**: Accepts **PDF**, **DOCX**, and **TXT** files up to **20 MB**.
- **Safe Server-Side Storage**: Uploaded files receive randomly generated UUID storage keys outside the public root.
- **Section & Page Extraction**:
  - **PDF**: Page-by-page text extraction via `pdf-parse` preserving page numbers.
  - **DOCX**: Paragraph and heading extraction via `mammoth`.
  - **TXT**: Section boundary parsing.
- **Asynchronous Processing**: File uploads immediately return `202 Accepted` with contract record in `processing` status; processing runs asynchronously in the background.

### 3. Fixed 8-Item Review Checklist
Every contract is reviewed against the exact 8 required checklist categories:
1. `parties`: Names and roles of the parties entering the agreement.
2. `start_date_and_term`: Effective/start date, duration, expiry, or term.
3. `payment_terms`: Amount, currency, due dates, invoicing, payment method, or schedule.
4. `termination`: Termination rights, notice period, and termination conditions.
5. `limitation_of_liability`: Liability caps, exclusions, and limits on damages.
6. `confidentiality`: Duties to protect or restrict disclosure of confidential information.
7. `governing_law`: Applicable jurisdiction, state, or country's law.
8. `auto_renewal`: Whether the agreement renews automatically and opt-out notice period.

#### For Each Finding:
- **Status**: `found` (green), `not_found` (slate/gray), or `unclear` (amber).
- **Plain-English Summary**: A concise, 1-sentence summary.
- **Verbatim Quote**: Copied word-for-word from the contract text.
- **Location Reference**: Page number and section heading.
- **Honest "Not Found"**: Displays `"Not found in the contract."` when evidence is absent without guessing or assuming standard terms.
- **Clause Navigation**: Clicking a finding opens a modal displaying the full clause context and surrounding extracted text.

### 4. Rule 6.5 Deterministic Quote Verification
Quote verification is enforced strictly on the backend:
- Normalizes whitespace and line breaks for safe comparison.
- Checks whether the candidate quote exists verbatim in the source contract text and chunks.
- If a quote cannot be verified verbatim, the finding is marked `unclear`, the unverified quote and location are cleared, and a validation failure reason is recorded. **The application never presents an invented quote as verified evidence.**

### 5. Contract Follow-Up Chat with SSE Streaming
- **Grounded Q&A**: Answers follow-up questions using only retrieved chunks from the selected contract.
- **Server-Sent Events (SSE)**: Streams answers progressively with documented event types (`message_start`, `token`, `citation`, `message_complete`).
- **Verified Citations**: Emits citations with verified quotes and page/section numbers only after backend verification.
- **Persistent History**: Chat messages persist across page reloads in MongoDB.

---

## 🏗️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 18 + Vite | Single Page Application with client-side routing and responsive layout |
| **Styling** | Tailwind CSS | Clean, accessible typography, color-coded badges, and modals |
| **Authentication** | Clerk (`@clerk/react`, JWKS) | JWT session verification and user profile management |
| **Backend** | Node.js + Express.js | High-performance REST API, SSE streaming endpoints, and Multer file uploads |
| **Database** | MongoDB + Mongoose | Persists contracts, chunks, reviews, and chat messages with user-scoped indexes |
| **Vector Search** | MongoDB Atlas Vector Search | Scoped semantic retrieval with built-in cosine similarity fallback |
| **AI Models** | Google Gemini API (`@google/generative-ai`) | Structured review output, streaming follow-up chat, and `gemini-embedding-001` embeddings |
| **File Parsing** | `pdf-parse`, `mammoth` | Page-aware and heading-aware contract text extraction |

---

## 🚀 How to Run the Project Locally

### Prerequisites
- **Node.js**: `v18.0.0` or higher (`node -v`)
- **npm**: `v9.0.0` or higher (`npm -v`)
- **MongoDB**: Either a local MongoDB instance (`mongodb://127.0.0.1:27017`), a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection URI, or Docker.

---

### Step 1: Clone or Navigate to the Project
```bash
cd "c:\Users\HP\OneDrive\Desktop\Contract review assistant"
```

---

### Step 2: Configure Environment Variables
Copy [.env.example](file:///c:/Users/HP/OneDrive/Desktop/Contract%20review%20assistant/.env.example) to `.env`:
```bash
cp .env.example .env
```

Open `.env` and configure your keys:
```env
# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# MongoDB Connection String (Local or MongoDB Atlas)
MONGODB_URI=mongodb://localhost:27017/contract_review

# Clerk Authentication Keys (free from https://dashboard.clerk.com)
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:5000/api

# Google Gemini API Key (free from https://aistudio.google.com)
GEMINI_API_KEY=AIzaSy...
GEMINI_CHAT_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-001

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=20

# Development Mock Auth (set to true to test locally without Clerk keys)
DEV_MOCK_AUTH=true
```

> **Note on Zero-Configuration Local Testing (`DEV_MOCK_AUTH=true`)**:
> If you have not yet created Clerk or Gemini accounts, `DEV_MOCK_AUTH=true` is enabled by default. This allows the complete application, all unit tests, and the evaluation benchmark to run immediately out of the box using built-in deterministic grounding!

---

### Step 3: Install Dependencies
Install dependencies for both the backend server and frontend client:

```bash
# Install Server Dependencies
cd server
npm install
cd ..

# Install Client Dependencies
cd client
npm install
cd ..
```

---

### Step 4: Start the Backend Server (Express)
In terminal 1:
```bash
cd server
npm run dev
```

The backend starts on **[http://localhost:5000](http://localhost:5000)**.
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### Step 5: Start the Frontend Client (React + Vite)
In terminal 2:
```bash
cd client
npm run dev
```

The frontend development server starts on **[http://localhost:3000](http://localhost:3000)**.
Open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

### Step 6 (Alternative): Running with Docker Compose
If you have Docker installed, you can start MongoDB and the server with a single command:
```bash
docker-compose up --build
```
This spins up MongoDB on port `27017` and the Express server on port `5000`.

---

## 🧪 Running the Test Suite & Evaluation Benchmark

The project includes automated test scripts and a benchmark evaluation script:

### 1. Run Quote Verification Tests (Rule 6.5)
Validates that verbatim quotes pass, whitespace/line-ending differences are normalized, and fabricated quotes or "not found" phrases are rejected:
```bash
node tests/quote_verifier.test.js
```

### 2. Run User Data Isolation Tests (Section 4.2)
Validates that User B cannot read or delete User A's contract by ID:
```bash
node tests/isolation.test.js
```

### 3. Run Benchmark Accuracy Evaluation
Evaluates the 8-item checklist against ground truth on two sample contracts ([sample_contracts/contract_nda.txt](file:///c:/Users/HP/OneDrive/Desktop/Contract%20review%20assistant/sample_contracts/contract_nda.txt) and [sample_contracts/contract_saas_msa.txt](file:///c:/Users/HP/OneDrive/Desktop/Contract%20review%20assistant/sample_contracts/contract_saas_msa.txt)):
```bash
node tests/evaluate.js
```

**Benchmark Results:**
```
===========================================================================
        CONTRACT REVIEW ASSISTANT - ACCURACY EVALUATION BENCHMARK          
         Testing Grounded Checklist Pipeline Against Ground Truth          
===========================================================================

EVALUATING: Mutual Non-Disclosure Agreement (NDA) (contract_nda.txt)
---------------------------------------------------------------------------
Checklist Item            | Expected   | Actual     | Result | Quote Verified
---------------------------------------------------------------------------
Parties                   | found      | found      | PASS   | Verified (100%)
Start date and term       | found      | found      | PASS   | Verified (100%)
Payment terms             | not_found  | not_found  | PASS   | N/A
Termination               | found      | found      | PASS   | Verified (100%)
Limitation of liability   | found      | found      | PASS   | Verified (100%)
Confidentiality           | found      | found      | PASS   | Verified (100%)
Governing law             | found      | found      | PASS   | Verified (100%)
Auto-renewal              | not_found  | not_found  | PASS   | N/A
---------------------------------------------------------------------------

EVALUATING: Master Services Agreement (SaaS MSA) (contract_saas_msa.txt)
---------------------------------------------------------------------------
Checklist Item            | Expected   | Actual     | Result | Quote Verified
---------------------------------------------------------------------------
Parties                   | found      | found      | PASS   | Verified (100%)
Start date and term       | found      | found      | PASS   | Verified (100%)
Payment terms             | found      | found      | PASS   | Verified (100%)
Termination               | found      | found      | PASS   | Verified (100%)
Limitation of liability   | found      | found      | PASS   | Verified (100%)
Confidentiality           | found      | found      | PASS   | Verified (100%)
Governing law             | found      | found      | PASS   | Verified (100%)
Auto-renewal              | found      | found      | PASS   | Verified (100%)
---------------------------------------------------------------------------

===========================================================================
OVERALL BENCHMARK ACCURACY : 16/16 items correct (100.0%)
OVERALL QUOTE VERIFICATION : 14/14 quotes verified (100.0%)
===========================================================================
```

---

## 📂 Repository Structure

```
contract-review-ai/
├── client/                     # Frontend (React 18 + Vite + Tailwind CSS)
│   ├── public/
│   ├── src/
│   │   ├── api/                # API client with token auth & SSE stream reader
│   │   ├── components/         # Layout, ProtectedRoute, Loading, Empty, Error, Dialog
│   │   ├── features/
│   │   │   ├── auth/           # Clerk authentication & test user controls
│   │   │   ├── contracts/      # Upload, ContractList, ContractCard, ProcessingStatus
│   │   │   ├── review/         # ReviewSummary, FindingCard, ClauseViewer modal
│   │   │   └── chat/           # ChatPanel, ChatMessage, CitationReference
│   │   ├── pages/              # LandingPage, AuthPage (/sign-in, /sign-up), DashboardPage (/dashboard), ReviewPage (/contracts/:contractId)
│   │   ├── utils/              # Byte formatting & date formatting helpers
│   │   ├── App.jsx             # App layout & Clerk provider configuration
│   │   ├── index.css           # Tailwind directives
│   │   └── main.jsx            # React root mount
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/                     # Backend (Node.js + Express.js + Mongoose)
│   ├── src/
│   │   ├── config/             # Environment settings & MongoDB connection
│   │   ├── middleware/         # requireAuth (Clerk JWKS), errorHandler, validateRequest
│   │   ├── models/             # Mongoose schemas: Contract, ContractChunk, ContractReview, ChatMessage
│   │   ├── routes/             # REST & SSE routes (/api/contracts, /api/health)
│   │   ├── controllers/        # ContractController, ReviewController, ChatController
│   │   ├── services/
│   │   │   ├── gemini/         # Google Gemini SDK client (JSON structured review & embeddings)
│   │   │   ├── document/       # PDF (pdf-parse), DOCX (mammoth), TXT parsing & chunking
│   │   │   ├── embeddings/     # Batched embeddings service
│   │   │   ├── retrieval/      # Vector search with Atlas Vector Search & cosine similarity fallback
│   │   │   ├── review/         # 8-item checklist definitions & QuoteVerifier (Rule 6.5)
│   │   │   └── chat/           # Streaming chat engine with verified citations
│   │   ├── jobs/               # Asynchronous processing queue
│   │   ├── utils/              # ApiError & privacy-safe logger
│   │   ├── app.js              # Express app setup, CORS, JSON parsing
│   │   └── server.js           # Server listen entrypoint
│   ├── package.json
│   └── Dockerfile
├── sample_contracts/           # Benchmark contracts (NDA & SaaS MSA)
│   ├── contract_nda.txt
│   └── contract_saas_msa.txt
├── tests/                      # Automated test suite
│   ├── quote_verifier.test.js  # Rule 6.5 quote verification tests
│   ├── isolation.test.js       # User ownership & scoping isolation tests
│   └── evaluate.js             # Ground truth benchmark evaluation script
├── docker-compose.yml          # Unified MongoDB & server containers
├── .env.example                # Documented environment template
├── .gitignore                  # Ignores .env, uploads, node_modules, build output
├── README.md                   # Complete local setup and architecture documentation
└── spec.md                     # Single source of truth product & technical specification
```
