### 🤖 AI Investment Advisor — Full Voice-to-Voice GenAI System

- A production-oriented, voice-enabled AI Investment Advisor that listens to users, understands financial goals, and responds with structured, goal-based investment guidance using real-time conversational AI.

### 🔗 GitHub: https://github.com/Abhishek-3191/AI-Investment-Advisor

### 🎥 Demo (Loom): https://www.loom.com/share/1ecfc9239cff4e03bcc524c8f4bff176

### 🎯 Problem This System Solves

- Most retail investors struggle because they:

- Don’t understand financial terminology

- Receive generic or biased advice from online sources

- Cannot compare multiple asset classes objectively

- Fear making irreversible financial mistakes

### Solution

-This system behaves like a real AI financial advisor:

- Users speak naturally (voice-first)

- AI asks clarifying questions to remove ambiguity

- Financial intent is extracted into structured data

- AI responds with clear, risk-aware, goal-based advice
  
-------------------------------------------------------------------------------

### 🏗️ High-Level Architecture
-Client (Voice / Web)
        |
-Speech-to-Text
        |
-Authentication Layer (Clerk)
        |
-API Layer (Next.js)
        |
-AI Reasoning Engine (Gemini)
        |
-Structured JSON Output
        |
-Text-to-Speech
        |
-Voice Response to User


- Design focus: low-latency interaction, controlled AI output, and secure access.
  
-------------------------------------------------------------------------------

### ✨ Key Engineering Highlights

- End-to-end voice-to-voice pipeline (no typing required)

- Authenticated users only (no open AI misuse)

- AI converts vague goals into structured financial intent

- Multi-asset comparison logic

- Controlled AI output using enforced JSON schema

- Backend-first design (not a frontend demo app)
  
-------------------------------------------------------------------------------

### 🚀 Core Features
### 🎙️ Voice-First Interaction

- Speech-to-Text for user input

- Text-to-Speech for AI output

- Natural conversational flow

### 🧠 AI Reasoning & Intent Extraction

- Handles vague inputs like “I want to be rich”

- Automatically asks follow-up questions

- Extracts:

- Investment amount

- Duration

- Risk appetite

- Financial goal

### 📊 Investment Analysis Engine

- Compares:

- Stocks

- Mutual Funds

- Gold & Silver

- Provides:

- Short-term vs long-term strategies

- Risk-aware explanations

- Clear asset allocation summaries

### 🔐 Security & Trust

- Clerk-based authentication & authorization

- Protected API routes

- Built-in financial risk disclaimer

### 📈 Scale Assumptions

- Designed for 1k–5k concurrent users

- Handles 10k+ daily AI requests

- Optimized for:

- Low conversational latency

- Controlled AI throughput

- Horizontal API scaling

### ⚠️ Failure Handling & Edge Cases

- AI response timeout handling

- Confirmation-based re-asking for unclear voice input

- Graceful fallback on AI errors

- Authentication expiry recovery

- Input validation to prevent malformed or unsafe requests
  
-------------------------------------------------------------------------------

### 🧠 Engineering Trade-offs

- Centralized AI orchestration simplifies frontend logic

- Stateless APIs enable easier scaling

- Trade-off: backend handles more responsibility for validation and consistency
  
-------------------------------------------------------------------------------

### 🛠️ Tech Stack

- Next.js 14 (App Router)

- React

- TypeScript

- Tailwind CSS

- Backend

- Next.js API Routes

- Convex (server-side logic & data handling)

- Authentication

- Clerk (secure auth & route protection)

- AI & Voice

- Google Gemini API

- Speech-to-Text

- Text-to-Speech

- Prompt-engineered structured output
  
-------------------------------------------------------------------------------

### ⚙️ Environment Setup

- Create a .env file:

- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
- CLERK_SECRET_KEY=your_key
- GOOGLE_GEMINI_API_KEY=your_key
  
-------------------------------------------------------------------------------

### ▶️ Run Locally
- git clone https://github.com/Abhishek-3191/AI-Investment-Advisor.git
- cd AI-Investment-Advisor
- npm install
- npm run dev


- Open 👉 http://localhost:3000
 
-------------------------------------------------------------------------------

### 🚧 Challenges & Solutions
- Voice Recognition Errors

Problem: Speech recognition inaccuracies
Solution: Confirmation-based follow-ups and intent re-validation

- Vague User Intent

Problem: Inputs like “I want to be rich”
Solution: Multi-step AI questioning with structured intent extraction

- AI Output Consistency

Problem: Inconsistent or unstructured responses
Solution: Enforced JSON schema and controlled frontend rendering

- Security & Misuse Prevention

Problem: Open AI endpoints abuse
Solution: Clerk authentication + protected API routes
 
-------------------------------------------------------------------------------

### 🚀 Future Improvements

- Live market data integration

- Long-term user memory & personalization

- Portfolio tracking dashboard

- More natural conversational voice

- Mobile-first PWA support
 
-------------------------------------------------------------------------------

### ⚠️ Disclaimer

- This application is not a registered financial advisor.
- All recommendations are for educational purposes only.
- Investments are subject to market risks.
- Please consult a certified financial advisor before investing.
 
-------------------------------------------------------------------------------

### 📌 Resume-Ready Summary

- Built a full voice-to-voice AI Investment Advisor using Next.js, Gemini AI, and Clerk, capable of extracting financial intent, comparing multiple asset classes, and delivering structured, risk-aware investment guidance through real-time conversational AI.
 
-------------------------------------------------------------------------------

### 👨‍💻 Author

### Abhishek Srivastava
🔗 https://github.com/Abhishek-3191
