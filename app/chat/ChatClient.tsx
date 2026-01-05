"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Send } from "lucide-react"

/* ---------- TYPES ---------- */

type TableRow = {
  asset: string
  type: string
  risk: string
  expectedReturn: string
  timeHorizon: string
  allocation: string
}

type Message =
  | {
      role: "user"
      content: string
    }
  | {
      role: "assistant"
      summary?: string
      table?: TableRow[]
      note?: string
    }

/* ---------- COMPONENT ---------- */

export default function ChatClient({
  userName,
  email,
}: {
  userName: string
  email: string
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [loading, setLoading] = useState(false)

  /* ---------- TEXT TO SPEECH ---------- */
  const speak = (text?: string) => {
    if (!text) return
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "en-IN"
    utterance.rate = 1
    setIsSpeaking(true)

    utterance.onend = () => setIsSpeaking(false)
    speechSynthesis.speak(utterance)
  }

  /* ---------- GREETING ---------- */
  useEffect(() => {
    const greeting = `Hello ${userName}. I am your AI investment assistant.
I provide educational data based insights.
Please tell me your investment amount, duration and risk preference.`

    setMessages([
      {
        role: "assistant",
        summary: greeting,
      },
    ])

    speak(greeting)
  }, [userName])

  /* ---------- SPEECH TO TEXT ---------- */
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert("Speech recognition not supported")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-IN"
    recognition.interimResults = false

    setIsListening(true)

    recognition.onresult = (event: any) => {
      setIsListening(false)
      handleSend(event.results[0][0].transcript)
    }

    recognition.onerror = recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  /* ---------- SEND MESSAGE ---------- */
  const handleSend = async (text?: string) => {
    const message = text || input
    if (!message.trim() || loading) return

    setMessages(prev => [...prev, { role: "user", content: message }])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, email }),
      })

      if (!res.ok) throw new Error("AI failed")
        const data = await res.json()

let parsed
try {
  parsed = typeof data.reply === "string"
    ? JSON.parse(data.reply)
    : data.reply
} catch {
  parsed = {}
}

setMessages(prev => [
  ...prev,
  {
    role: "assistant",
    summary: parsed.summary || "",
    table: Array.isArray(parsed.table) ? parsed.table : [],
    note: parsed.table?.length ? parsed.note : "",
  },
])

speak(parsed.summary)

    } catch {
      const errorMsg =
        "Sorry, I could not process that. Please try again."

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          summary: errorMsg,
        },
      ])

      speak(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  /* ---------- UI ---------- */
  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto bg-white/60 backdrop-blur-xl rounded-xl shadow-lg m-4">

      <div className="p-4 border-b font-semibold text-center">
        AI Investment Advisor
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[80%] px-4 py-3 rounded-xl text-sm ${
              msg.role === "assistant"
                ? "bg-white text-black"
                : "bg-cyan-500 text-black ml-auto"
            }`}
          >
            {/* USER */}
            {msg.role === "user" && msg.content}

            {/* ASSISTANT */}
            {msg.role === "assistant" && (
              <div className="space-y-4">

                {/* SUMMARY */}
                {msg.summary && (
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {msg.summary}
                  </p>
                )}

                {/* TABLE */}
                {msg.table && msg.table.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300 text-xs">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border px-2 py-1">Asset</th>
                          <th className="border px-2 py-1">Type</th>
                          <th className="border px-2 py-1">Risk</th>
                          <th className="border px-2 py-1">Return</th>
                          <th className="border px-2 py-1">Horizon</th>
                          <th className="border px-2 py-1">Allocation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {msg.table.map((row, i) => (
                          <tr key={i}>
                            <td className="border px-2 py-1">{row.asset}</td>
                            <td className="border px-2 py-1">{row.type}</td>
                            <td className="border px-2 py-1">{row.risk}</td>
                            <td className="border px-2 py-1">{row.expectedReturn}</td>
                            <td className="border px-2 py-1">{row.timeHorizon}</td>
                            <td className="border px-2 py-1">{row.allocation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* NOTE */}
                    {msg.note && (
                      <p className="text-xs text-gray-600 italic mt-2">
                        Note: {msg.note}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
         {loading && <LoadingBubble />}
      </div>

      <div className="flex items-center gap-2 p-4 border-t">
        <input
          className="flex-1 border rounded-md px-3 py-2 text-sm"
          placeholder="eg.- I want to buy SUV car in upcoming 5 years and my monthly income is 1lakh"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
           disabled={loading}
        />

        <Button variant="outline" size="icon" onClick={startListening}  disabled={loading}>
          <Mic />
        </Button>

        <Button onClick={() => handleSend()} disabled={loading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-center py-2">
        {isListening && <Wave type="user" />}
        {isSpeaking && <Wave type="ai" />}
      </div>
    </div>
  )
}

/* ---------- WAVE ---------- */
function Wave({ type }: { type: "user" | "ai" }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4].map(i => (
        <span
          key={i}
          className={`h-2 w-1 rounded-full animate-wave ${
            type === "ai" ? "bg-cyan-500" : "bg-black"
          }`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  )
}

function LoadingBubble() {
  return (
    <div className="max-w-[60%] px-4 py-3 rounded-xl bg-white text-black text-sm">
      <div className="flex items-center gap-2">
        <span>Thinking</span>
        <span className="flex gap-1">
          <span className="h-1 w-1 bg-black rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="h-1 w-1 bg-black rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="h-1 w-1 bg-black rounded-full animate-bounce [animation-delay:300ms]" />
        </span>
      </div>
    </div>
  )
}
