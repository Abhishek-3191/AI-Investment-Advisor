"use client"

import { useEffect, useRef, useState } from "react"
import {  BarChart3,
  Bot,
  ChevronLeft,
  CircleDollarSign,
  Mic,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Volume2,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"

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

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const router = useRouter()

  /* ---------- AUTO SCROLL CHAT ONLY ---------- */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }, [messages, loading])

  /* ---------- TEXT TO SPEECH ---------- */

  const speak = (text?: string) => {
    if (!text || typeof window === "undefined") return

    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)

    utterance.lang = "en-IN"
    utterance.rate = 1

    setIsSpeaking(true)

    utterance.onend = () => {
      setIsSpeaking(false)
    }

    utterance.onerror = () => {
      setIsSpeaking(false)
    }

    speechSynthesis.speak(utterance)
  }

  /* ---------- GREETING ---------- */

  useEffect(() => {
    const greeting = `Hello ${userName}. I’m your AI Investment Assistant.

I use educational, data-driven insights to help you understand your investment options.

Tell me what you’re hoping to achieve with your money, and we’ll figure out the rest together.`

    setMessages([
      {
        role: "assistant",
        summary: greeting,
      },
    ])

    speak(greeting)

    return () => {
      speechSynthesis.cancel()
    }
  }, [userName])

  /* ---------- SPEECH TO TEXT ---------- */

  const startListening = () => {
    if (typeof window === "undefined") return

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.")
      return
    }

    const recognition = new SpeechRecognition()

    recognition.lang = "en-IN"
    recognition.interimResults = false
    recognition.continuous = false

    setIsListening(true)

    recognition.onresult = (event: any) => {
      setIsListening(false)

      const transcript = event.results?.[0]?.[0]?.transcript

      if (transcript) {
        handleSend(transcript)
      }
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  /* ---------- SEND MESSAGE ---------- */

  const handleSend = async (text?: string) => {
    const message = text || input

    if (!message.trim() || loading) return

    setMessages(prev => [
      ...prev,
      {
        role: "user",
        content: message,
      },
    ])

    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          email,
        }),
      })

      if (!res.ok) {
        throw new Error("AI failed")
      }

      const data = await res.json()

      let parsed

      try {
        parsed =
          typeof data.reply === "string"
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
   <main className="fixed inset-0 z-50 flex h-screen w-screen min-h-0 flex-col overflow-hidden bg-[#f7f7f3] text-[#111111]">

      {/* ================= BACKGROUND ================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Main glow */}
        <div className="absolute left-1/2 top-[15%] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#c7ff4d]/15 blur-[130px]" />
      </div>

      {/* ================= HEADER ================= */}

      <header className="relative z-20 shrink-0 px-5 pt-5 sm:px-8 lg:px-12">

        <nav className="mx-auto flex h-[64px] max-w-[1400px] items-center justify-between rounded-full border border-black/[0.07] bg-white/75 px-3 pl-3 shadow-[0_8px_40px_rgba(0,0,0,0.04)] backdrop-blur-xl">

          {/* LEFT */}

          <div className="flex items-center gap-3">

            {/* Back */}

            <button
  type="button"
  aria-label="Back to home"
  onClick={() => router.push("/")}
  className="group flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.07] bg-white transition-all hover:-translate-x-0.5 hover:bg-black hover:text-white"
>
  <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
</button>

            {/* Brand */}

            <div className="flex items-center gap-2.5">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111] text-[#c7ff4d]">
                <Sparkles className="h-4 w-4" />
              </div>

              <div className="hidden leading-none sm:block">
                <p className="text-[14px] font-semibold tracking-[-0.02em]">
                  AI Investment
                </p>

                <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-black/35">
                  Advisor
                </p>
              </div>

            </div>

          </div>

          {/* CENTER STATUS */}

          <div className="hidden items-center gap-2 rounded-full border border-black/[0.06] bg-white px-4 py-2 text-[11px] font-medium text-black/50 shadow-sm md:flex">

            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#8bb800]" />

            AI Advisor online

          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-2">

            <div className="hidden items-center gap-2 rounded-full border border-black/[0.06] bg-white px-3 py-2 sm:flex">

              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#111] text-white">
                <User className="h-3 w-3" />
              </div>

              <span className="max-w-[100px] truncate text-[11px] font-medium">
                {userName}
              </span>

            </div>

            

          </div>

        </nav>
      </header>

      {/* ================= MAIN CHAT AREA ================= */}

      <section className="relative z-10 mx-auto flex min-h-0 w-full max-w-[1100px] flex-1 flex-col px-4 py-4 sm:px-8">

        {/* Chat title */}

        <div className="shrink-0 px-2 pb-3 pt-2 sm:px-4">

          <div className="flex items-end justify-between">

            <div>

              <div className="mb-1 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-black/35">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8bb800]" />
                Investment workspace
              </div>

              <h1 className="text-[25px] font-semibold tracking-[-0.04em] sm:text-[30px]">
                Let's build your plan.
              </h1>

            </div>

            <div className="hidden items-center gap-2 rounded-full border border-black/[0.07] bg-white/70 px-3 py-2 text-[10px] text-black/45 backdrop-blur sm:flex">
              <ShieldCheck className="h-3.5 w-3.5" />
              Educational insights
            </div>

          </div>

        </div>

        {/* ================= SCROLLABLE CHAT ================= */}

        <div className="min-h-0 flex-1 overflow-y-auto px-1 py-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-black/10 sm:px-4">

          <div className="mx-auto flex max-w-[850px] flex-col gap-5">

            {messages.map((msg, idx) => (

              <div
                key={idx}
                className={`flex w-full ${
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                {/* USER */}

                {msg.role === "user" && (

                  <div className="max-w-[75%] sm:max-w-[65%]">

                    <div className="mb-1.5 flex justify-end text-[9px] font-medium uppercase tracking-[0.12em] text-black/30">
                      You
                    </div>

                    <div className="rounded-[24px] rounded-br-[7px] bg-[#111] px-5 py-3.5 text-[13px] leading-5 text-white shadow-[0_12px_30px_rgba(0,0,0,0.10)]">
                      {msg.content}
                    </div>

                  </div>
                )}

                {/* ASSISTANT */}

                {msg.role === "assistant" && (

                  <div className="w-full max-w-[850px]">

                    {/* AI identity */}

                    <div className="mb-2 flex items-center gap-2">

                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#111] text-[#c7ff4d]">
                        <Bot className="h-3.5 w-3.5" />
                      </div>

                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-black/40">
                        AI Advisor
                      </span>

                      <span className="h-1 w-1 rounded-full bg-black/20" />

                      <span className="text-[9px] text-black/30">
                        Educational
                      </span>

                    </div>

                    <div className="rounded-[28px] border border-black/[0.06] bg-white/85 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.045)] backdrop-blur-xl sm:p-6">

                      {/* SUMMARY */}

                      {msg.summary && (
                        <div className="flex gap-3">

                          <div className="mt-1 hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#efffc9] sm:flex">
                            <Sparkles className="h-3.5 w-3.5" />
                          </div>

                          <p className="text-[13px] leading-6 text-black/70 whitespace-pre-line">
                            {msg.summary}
                          </p>

                        </div>
                      )}

                      {/* PORTFOLIO */}

                      {msg.table && msg.table.length > 0 && (

                        <div className="mt-6 overflow-hidden rounded-[22px] border border-black/[0.07] bg-[#fafaf6]">

                          {/* Portfolio header */}

                          <div className="flex flex-col gap-3 border-b border-black/[0.06] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111] text-[#c7ff4d]">
                                <BarChart3 className="h-4 w-4" />
                              </div>

                              <div>
                                <p className="text-[12px] font-semibold">
                                  Recommended allocation
                                </p>

                                <p className="mt-0.5 text-[9px] text-black/40">
                                  Based on your goals & selected risk
                                </p>
                              </div>

                            </div>

                            <div className="flex items-center gap-1.5 rounded-full bg-[#efffc9] px-3 py-1.5 text-[9px] font-semibold text-black">
                              <TrendingUp className="h-3 w-3" />
                              AI selected
                            </div>

                          </div>

                          {/* Desktop table */}

                          <div className="hidden overflow-x-auto md:block">

                            <table className="w-full text-left">

                              <thead>
                                <tr className="border-b border-black/[0.05] text-[9px] uppercase tracking-[0.1em] text-black/35">

                                  <th className="px-4 py-3 font-medium">
                                    Asset
                                  </th>

                                  <th className="px-4 py-3 font-medium">
                                    Risk
                                  </th>

                                  <th className="px-4 py-3 font-medium">
                                    Return
                                  </th>

                                  <th className="px-4 py-3 font-medium">
                                    Horizon
                                  </th>

                                  <th className="px-4 py-3 text-right font-medium">
                                    Allocation
                                  </th>

                                </tr>
                              </thead>

                              <tbody>

                                {msg.table.map((row, i) => (

                                  <tr
                                    key={i}
                                    className="border-b border-black/[0.04] last:border-0 transition-colors hover:bg-white"
                                  >

                                    <td className="px-4 py-3.5">

                                      <div className="flex items-center gap-2.5">

                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black shadow-sm">
                                          <CircleDollarSign className="h-3.5 w-3.5" />
                                        </div>

                                        <div>
                                          <p className="text-[11px] font-semibold">
                                            {row.asset}
                                          </p>

                                          <p className="mt-0.5 text-[8px] text-black/35">
                                            {row.type}
                                          </p>
                                        </div>

                                      </div>

                                    </td>

                                    <td className="px-4 py-3.5">

                                      <RiskBadge risk={row.risk} />

                                    </td>

                                    <td className="px-4 py-3.5 text-[11px] font-semibold">
                                      {row.expectedReturn}
                                    </td>

                                    <td className="px-4 py-3.5 text-[10px] text-black/50">
                                      {row.timeHorizon}
                                    </td>

                                    <td className="px-4 py-3.5 text-right">

                                      <span className="rounded-full bg-[#111] px-3 py-1.5 text-[9px] font-semibold text-white">
                                        {row.allocation}
                                      </span>

                                    </td>

                                  </tr>

                                ))}

                              </tbody>

                            </table>

                          </div>

                          {/* Mobile cards */}

                          <div className="space-y-2 p-3 md:hidden">

                            {msg.table.map((row, i) => (

                              <div
                                key={i}
                                className="rounded-2xl border border-black/[0.06] bg-white p-3"
                              >

                                <div className="flex items-center justify-between">

                                  <div className="flex items-center gap-2">

                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f3ee]">
                                      <CircleDollarSign className="h-3.5 w-3.5" />
                                    </div>

                                    <div>
                                      <p className="text-[11px] font-semibold">
                                        {row.asset}
                                      </p>
                                      <p className="text-[8px] text-black/35">
                                        {row.type}
                                      </p>
                                    </div>

                                  </div>

                                  <span className="rounded-full bg-[#111] px-2.5 py-1 text-[9px] font-semibold text-white">
                                    {row.allocation}
                                  </span>

                                </div>

                                <div className="mt-3 flex items-center gap-2">

                                  <RiskBadge risk={row.risk} />

                                  <span className="rounded-full bg-[#f3f3ee] px-2.5 py-1 text-[9px] text-black/50">
                                    {row.expectedReturn}
                                  </span>

                                  <span className="rounded-full bg-[#f3f3ee] px-2.5 py-1 text-[9px] text-black/50">
                                    {row.timeHorizon}
                                  </span>

                                </div>

                              </div>

                            ))}

                          </div>

                          {/* Note */}

                          {msg.note && (

                            <div className="border-t border-black/[0.06] px-4 py-3">

                              <p className="text-[9px] leading-4 text-black/40">
                                <span className="font-semibold text-black/55">
                                  Note:
                                </span>{" "}
                                {msg.note}
                              </p>

                            </div>

                          )}

                        </div>
                      )}

                    </div>

                  </div>
                )}

              </div>

            ))}

            {/* LOADING */}

            {loading && <LoadingBubble />}

            <div ref={messagesEndRef} />

          </div>

        </div>

        {/* ================= INPUT ================= */}

        <div className="shrink-0 px-0 pb-2 pt-3 sm:px-4">

          <div className="mx-auto max-w-[850px]">

            {/* Voice status */}

            {(isListening || isSpeaking) && (

              <div className="mb-2 flex items-center justify-center">

                {isListening && (
                  <div className="flex items-center gap-2 rounded-full border border-black/[0.06] bg-white px-4 py-2 shadow-sm">

                    <Wave type="user" />

                    <span className="text-[9px] font-medium text-black/50">
                      Listening...
                    </span>

                    <button
                      onClick={() => setIsListening(false)}
                      className="ml-1 rounded-full p-1 hover:bg-black/5"
                    >
                      <X className="h-3 w-3" />
                    </button>

                  </div>
                )}

                {isSpeaking && !isListening && (
                  <div className="flex items-center gap-2 rounded-full border border-black/[0.06] bg-white px-4 py-2 shadow-sm">

                    <Wave type="ai" />

                    <Volume2 className="h-3 w-3 text-[#6f9f00]" />

                    <span className="text-[9px] font-medium text-black/50">
                      AI is speaking...
                    </span>

                  </div>
                )}

              </div>
            )}

            {/* Command bar */}

            <div className="group flex items-center gap-2 rounded-[25px] border border-black/[0.08] bg-white/90 p-2 pl-5 shadow-[0_15px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all focus-within:border-black/15 focus-within:shadow-[0_18px_60px_rgba(0,0,0,0.11)]">

              <input
                className="min-w-0 flex-1 bg-transparent py-2 text-[12px] text-black outline-none placeholder:text-black/30 sm:text-[13px]"
                placeholder="Tell me about your goal, amount and risk..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    handleSend()
                  }
                }}
                disabled={loading}
              />

              {/* Mic */}

              <button
                onClick={startListening}
                disabled={loading}
                aria-label="Voice input"
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${
                  isListening
                    ? "bg-[#c7ff4d] text-black shadow-[0_0_0_6px_rgba(199,255,77,0.18)]"
                    : "bg-[#f3f3ee] text-black/60 hover:bg-black hover:text-white"
                }`}
              >
                <Mic className="h-4 w-4" />
              </button>

              {/* Send */}

              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111] text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Send className="h-3.5 w-3.5" />
              </button>

            </div>

            <p className="mt-2 text-center text-[8px] text-black/30">
              AI-generated educational insights · Not financial advice
            </p>

          </div>

        </div>

      </section>

    </main>
  )
}

/* ========================================================= */
/* RISK BADGE */
/* ========================================================= */

function RiskBadge({ risk }: { risk: string }) {
  const normalized = risk.toLowerCase()

  let label = risk

  if (normalized.includes("high")) {
    label = "High risk"
  } else if (normalized.includes("moderate")) {
    label = "Moderate"
  } else if (normalized.includes("low")) {
    label = "Low risk"
  }

  return (
    <span className="inline-flex rounded-full bg-[#f3f3ee] px-2.5 py-1 text-[9px] font-medium text-black/55">
      {label}
    </span>
  )
}

/* ========================================================= */
/* VOICE WAVE */
/* ========================================================= */

function Wave({ type }: { type: "user" | "ai" }) {
  return (
    <div className="flex h-4 items-center gap-[3px]">

      {[1, 2, 3, 4, 5].map(i => (

        <span
          key={i}
          className={`w-[3px] rounded-full animate-wave ${
            type === "ai"
              ? "bg-[#8bb800]"
              : "bg-black"
          }`}
          style={{
            height: `${8 + (i % 3) * 4}px`,
            animationDelay: `${i * 0.1}s`,
          }}
        />

      ))}

    </div>
  )
}

/* ========================================================= */
/* LOADING */
/* ========================================================= */

function LoadingBubble() {
  return (
    <div className="flex w-full justify-start">

      <div className="w-full max-w-[850px]">

        <div className="mb-2 flex items-center gap-2">

          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#111] text-[#c7ff4d]">
            <Bot className="h-3.5 w-3.5" />
          </div>

          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-black/40">
            AI Advisor
          </span>

        </div>

        <div className="inline-flex items-center gap-3 rounded-[20px] border border-black/[0.06] bg-white px-5 py-3.5 text-[11px] text-black/45 shadow-sm">

          <span>Thinking</span>

          <span className="flex gap-1">

            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/40 [animation-delay:0ms]" />

            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/40 [animation-delay:150ms]" />

            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/40 [animation-delay:300ms]" />

          </span>

        </div>

      </div>

    </div>
  )
}