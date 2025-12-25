🤖 AI Investment Advisor — Full Voice-to-Voice AI

A fully voice-enabled AI Investment Advisor that listens to users, understands their financial needs, and speaks back with personalized investment advice.

The platform is securely authenticated and authorized using Clerk and solves a real-world problem:

👉 People want to invest, but don’t know where, how, or whom to trust.

Instead of generic advice, this app delivers goal-oriented, customized, AI-driven investment recommendations — completely free.

DEMO-
https://www.loom.com/share/1ecfc9239cff4e03bcc524c8f4bff176

🎯 What Makes This App Unique?

✅ Full Voice-to-Voice AI (No typing required)

🔐 Authenticated & authorized users only

🎯 Personalized investment strategies

📊 Compares multiple assets

Stocks

Mutual Funds

Gold & Silver

🧑‍🎓 Beginner-friendly + Advanced user support

🗣️ Real conversational AI financial advisor experience

🌍 Real-World Problem It Solves

Most investors today:

❌ Don’t understand financial terms

❌ Receive generic YouTube / influencer advice

❌ Cannot compare multiple investment options

❌ Are afraid of making wrong investment decisions

💡 Solution

This app behaves like a real AI financial advisor:

🗣️ Users talk naturally

🧠 AI asks intelligent follow-up questions

📈 AI analyzes:

Goals

Risk appetite

Investment duration

🔊 AI speaks back with clear, structured advice

✨ Features

🔐 Authentication & Authorization (Clerk)

🎙️ Full Voice-to-Voice AI Advisor

💬 Optional text input support

🧠 Smart AI conversation

Handles vague inputs

Asks clarifying questions

🎯 Goal-based investment planning

📊 Investment comparison across assets

Mutual Funds

Stocks

Gold & Silver

Short-term & Long-term instruments

⚠️ Built-in investment risk disclaimer

⚡ Fast, responsive UI

🛠️ Tech Stack
Frontend

Next.js 14 (App Router)

React

TypeScript

Tailwind CSS

Backend

Next.js API Routes

Convex (Backend logic & data handling)

Authentication & Authorization

Clerk

Secure login & sessions

Route protection

User identity management

AI & Voice

Google Gemini API

🎙️ Speech-to-Text (User voice input)

🔊 Text-to-Speech (AI voice response)

🧠 Prompt engineering for structured financial advice

🔁 Complete Project Flow (Voice-to-Voice)
1️⃣ Secure Login

User signs in using Clerk authentication

2️⃣ Voice Interaction Starts

User speaks naturally, for example:

“I want to invest but I don’t know where.”

3️⃣ AI Understanding & Follow-Up

AI:

Converts voice → text

Detects missing information

Asks follow-up questions:

Investment amount

Time duration

Risk appetite

Financial goal (house, wealth, retirement, etc.)

4️⃣ Intelligent Data Extraction

AI structures user intent into:

Amount

Duration

Risk level

Financial goal

👉 If data is incomplete, AI asks again (like a human advisor)

5️⃣ Investment Analysis & Comparison

AI:

Compares stocks, mutual funds, gold, silver

Selects optimal strategies

Explains why each option is suitable

6️⃣ Voice-Based AI Response

AI:

Converts response → spoken voice

Presents:

Clear summary

Asset allocation

Risk explanation

Disclaimer

👉 User hears advice, not just reads it

🏗️ Architecture Overview
User Voice Input
        ↓
Speech-to-Text
        ↓
Authenticated API (Clerk)
        ↓
Gemini AI (Investment Logic)
        ↓
Structured JSON Response
        ↓
Text-to-Speech
        ↓
AI Voice Output

📂 Project Structure
AI-Investment-Advisor/
├── app/
│   ├── api/chat/route.ts
│   ├── page.tsx
│   └── layout.tsx
├── components/
│   ├── VoiceInput.tsx
│   ├── VoiceOutput.tsx
│   └── ChatUI.tsx
├── convex/
│   └── functions.ts
├── lib/
│   └── gemini.ts
├── public/
├── .env.local
└── README.md

⚙️ Environment Variables

Create a .env.local file:

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_key

GOOGLE_GEMINI_API_KEY=your_key

▶️ Run Locally
git clone https://github.com/Abhishek-3191/AI-Investment-Advisor.git
cd AI-Investment-Advisor
npm install
npm run dev


Open 👉 http://localhost:3000

🚧 Challenges & Solutions
🔴 Voice Accuracy

Problem: Speech recognition errors
Solution:

Confirmation-based follow-ups

AI re-asks unclear inputs

🔴 Vague User Intent

Problem: “I want to be rich”
Solution:

Multi-step AI questioning

Intent extraction via prompt engineering

🔴 Consistent Output Format

Problem: AI response inconsistency
Solution:

Enforced JSON schema

Controlled frontend rendering

🔴 Security

Problem: Open AI misuse
Solution:

Clerk authentication

Protected API routes

⚠️ Disclaimer

This application is not a registered financial advisor.
All recommendations are for educational purposes only.
Investments are subject to market risks.
Please consult a certified financial advisor before investing.

🚀 Future Enhancements

📈 Live market data integration

🧠 Memory-based AI personalization

📊 Portfolio tracking

🔊 More human-like conversational voice

📱 Mobile-first PWA support

👨‍💻 Author

Abhishek Srivastava
