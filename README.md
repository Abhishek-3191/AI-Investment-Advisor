# 🤖 AI Investment Advisor — Full Voice-to-Voice AI

> A fully **voice-enabled AI Investment Advisor** that listens to users, understands their financial needs, and speaks back with **personalized, goal-based investment advice** — just like a real financial advisor.

🔗 **GitHub Repository:** https://github.com/Abhishek-3191/AI-Investment-Advisor  
🎥 **Demo (Loom):** https://www.loom.com/share/1ecfc9239cff4e03bcc524c8f4bff176

---

## 🎯 What Problem Does This Solve?

Most people want to invest but:

❌ Don’t understand financial terminology  
❌ Get generic advice from YouTube or influencers  
❌ Can’t compare multiple investment options  
❌ Fear making wrong financial decisions  

### 💡 Solution

This app behaves like a **real AI financial advisor**:

- Users **talk naturally**
- AI asks **intelligent follow-up questions**
- AI analyzes goals, risk, and duration
- AI **speaks back** with clear, structured investment advice

---

## ✨ What Makes This App Unique?

✅ **Full Voice-to-Voice AI** (no typing required)  
🔐 **Authenticated & authorized users only**  
🎯 **Goal-based investment planning**  
📊 **Multi-asset comparison** (Stocks, Mutual Funds, Gold & Silver)  
🧑‍🎓 Beginner-friendly yet powerful for advanced users  
🗣️ Human-like conversational AI experience  

---

## 🚀 Features

### 🎙️ Voice-First AI Advisor
- Speech-to-Text for user input
- Text-to-Speech for AI responses
- Natural, conversational interaction

### 🧠 Smart AI Reasoning
- Handles vague inputs like *“I want to be rich”*
- Asks clarifying questions automatically
- Extracts structured financial intent

### 📊 Investment Analysis
- Compares:
  - Stocks
  - Mutual Funds
  - Gold & Silver
- Short-term & long-term strategies
- Risk-aware recommendations

### 🔐 Security & Trust
- Authentication & authorization using **Clerk**
- Protected API routes
- Built-in investment risk disclaimer

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14 (App Router)**
- **React**
- **TypeScript**
- **Tailwind CSS**

### Backend
- **Next.js API Routes**
- **Convex** (backend logic & data handling)

### Authentication
- **Clerk**
  - Secure login
  - Route protection
  - User identity management

### AI & Voice
- **Google Gemini API**
- 🎙️ Speech-to-Text
- 🔊 Text-to-Speech
- Prompt engineering for structured financial advice

---

## 🔁 Complete Voice-to-Voice Flow

User Voice Input
↓
Speech-to-Text
↓
Authenticated API (Clerk)
↓
Gemini AI (Investment Logic)
↓
Structured JSON Output
↓
Text-to-Speech
↓
AI Voice Response

yaml
Copy code

---

## 🏗️ Architecture Overview

1️⃣ User signs in securely  
2️⃣ User speaks naturally  
3️⃣ AI extracts:
- Investment amount
- Duration
- Risk appetite
- Financial goal

4️⃣ AI compares assets and strategies  
5️⃣ AI speaks back:
- Clear summary
- Asset allocation
- Risk explanation
- Disclaimer  


### ⚙️ Environment Variables

-Create a .env file:
-NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
-CLERK_SECRET_KEY=your_key
-GOOGLE_GEMINI_API_KEY=your_key
-▶️ Run Locally
-git clone https://github.com/Abhishek-3191/AI-Investment-Advisor.git
-cd AI-Investment-Advisor
-npm install
-npm run dev
-Open 👉 http://localhost:3000



### 🚧 Challenges & Solutions
🔴 Voice Accuracy
Problem: Speech recognition errors
Solution: Confirmation-based follow-ups and AI re-asking unclear inputs

🔴 Vague User Intent
Problem: Inputs like “I want to be rich”
Solution: Multi-step AI questioning with prompt-engineered intent extraction

🔴 Consistent Output Format
Problem: Inconsistent AI responses
Solution: Enforced structured JSON schema with controlled frontend rendering

🔴 Security & Misuse
Problem: Open AI misuse and unauthorized access
Solution: Clerk authentication and protected API routes


### ⚠️ Disclaimer
This application is not a registered financial advisor.
All recommendations are for educational purposes only.
Investments are subject to market risks.
Please consult a certified financial advisor before investing.


### 🚀 Future Enhancements
📈 Live market data integration
🧠 Long-term AI memory & personalization
📊 Portfolio tracking dashboard
🔊 More human-like conversational voice
📱 Mobile-first PWA support




### 📌 Resume-Ready Description
Built a full voice-to-voice AI Investment Advisor using Next.js, Gemini AI, and Clerk, capable of understanding financial goals, risk appetite, and delivering personalized investment recommendations via real-time conversational AI.

### 👨‍💻 Author
Abhishek Srivastava
🔗 https://github.com/Abhishek-3191
