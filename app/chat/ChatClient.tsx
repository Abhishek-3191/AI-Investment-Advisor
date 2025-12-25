// "use client"

// import { useEffect, useRef, useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Mic, Send } from "lucide-react"

// type Message = {
//   role: "assistant" | "user"
//   content: string
// }

// export default function ChatClient({
//   userName,
//   email,
// }: {
//   userName: string
//   email: string
// }) {
//   const [messages, setMessages] = useState<Message[]>([])
//   const [input, setInput] = useState("")
//   const [isListening, setIsListening] = useState(false)
//   const [isSpeaking, setIsSpeaking] = useState(false)
//   const [loading, setLoading] = useState(false)

//   /* ------------------ TEXT TO SPEECH ------------------ */
//   const speak = (text: string) => {
//     speechSynthesis.cancel()

//     const utterance = new SpeechSynthesisUtterance(text)
//     utterance.lang = "en-IN"
//     utterance.rate = 1

//     setIsSpeaking(true)
//     utterance.onend = () => setIsSpeaking(false)

//     speechSynthesis.speak(utterance)
//   }

//   /* ------------------ GREETING ------------------ */
//   useEffect(() => {
//     const greeting = `Hello ${userName}. I am your AI investment assistant. 
// I provide educational, data-based insights. 
// Please tell me your investment amount, goal, duration, and risk preference.`

//     setMessages([{ role: "assistant", content: greeting }])
//     speak(greeting)
//   }, [userName])

//   /* ------------------ SPEECH TO TEXT ------------------ */
//   const startListening = () => {
//     const SpeechRecognition =
//       (window as any).SpeechRecognition ||
//       (window as any).webkitSpeechRecognition

//     if (!SpeechRecognition) {
//       alert("Speech recognition not supported")
//       return
//     }

//     const recognition = new SpeechRecognition()
//     recognition.lang = "en-IN"
//     recognition.interimResults = false

//     setIsListening(true)

//     recognition.onresult = (event: any) => {
//       setIsListening(false)
//       handleSend(event.results[0][0].transcript)
//     }

//     recognition.onerror = recognition.onend = () => {
//       setIsListening(false)
//     }

//     recognition.start()
//   }

//   /* ------------------ SEND MESSAGE ------------------ */
//   const handleSend = async (text?: string) => {
//     const message = text || input
//     if (!message.trim() || loading) return

//     setMessages(prev => [...prev, { role: "user", content: message }])
//     setInput("")
//     setLoading(true)

//     try {
//       const res = await fetch("/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message, email }),
//       })

//       if (!res.ok) throw new Error("AI failed")

//       const data = await res.json()

//       setMessages(prev => [
//         ...prev,
//         { role: "assistant", content: data.reply },
//       ])

//       speak(data.reply)
//     } catch {
//       const errorMsg =
//         "Sorry, I couldn’t process that. Please try again."

//       setMessages(prev => [
//         ...prev,
//         { role: "assistant", content: errorMsg },
//       ])

//       speak(errorMsg)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="flex flex-col w-full max-w-4xl mx-auto bg-white/60 backdrop-blur-xl rounded-xl shadow-lg m-4">

//       <div className="p-4 border-b font-semibold text-center">
//         AI Investment Advisor
//       </div>

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((msg, idx) => (
//           <div
//             key={idx}
//             className={`max-w-[75%] px-4 py-2 rounded-xl text-sm ${
//               msg.role === "assistant"
//                 ? "bg-white text-black"
//                 : "bg-cyan-500 text-black ml-auto"
//             }`}
//           >
//             {msg.content}
//           </div>
//         ))}
//       </div>

//       <div className="flex items-center gap-2 p-4 border-t">
//         <input
//           className="flex-1 border rounded-md px-3 py-2 text-sm"
//           placeholder="Type or speak..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && handleSend()}
//         />

//         <Button variant="outline" size="icon" onClick={startListening}>
//           <Mic />
//         </Button>

//         <Button onClick={() => handleSend()} disabled={loading}>
//           <Send className="h-4 w-4" />
//         </Button>
//       </div>

//       <div className="flex justify-center py-2">
//         {isListening && <Wave type="user" />}
//         {isSpeaking && <Wave type="ai" />}
//       </div>
//     </div>
//   )
// }

// function Wave({ type }: { type: "user" | "ai" }) {
//   return (
//     <div className="flex items-center gap-1">
//       {[1, 2, 3, 4].map(i => (
//         <span
//           key={i}
//           className={`h-2 w-1 rounded-full animate-wave ${
//             type === "ai" ? "bg-cyan-500" : "bg-black"
//           }`}
//           style={{ animationDelay: `${i * 0.1}s` }}
//         />
//       ))}
//     </div>
//   )
// }
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Send } from "lucide-react"

type TableRow = Record<string, string>

type Message = {
  role: "assistant" | "user"
  summary?: string
  table?: TableRow[]
  note?: string
  content?: string
}

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

  /* ------------------ TEXT TO SPEECH ------------------ */
  const speak = (text: string) => {
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "en-IN"
    utterance.rate = 1
    setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    speechSynthesis.speak(utterance)
  }

  /* ------------------ GREETING ------------------ */
  useEffect(() => {
    const greeting = `Hello ${userName}. I am your AI investment assistant.
Please tell me your investment amount goal duration and risk preference`

    setMessages([{ role: "assistant", content: greeting }])
    speak(greeting)
  }, [userName])

  /* ------------------ SPEECH TO TEXT ------------------ */
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) return alert("Speech not supported")

    const recognition = new SpeechRecognition()
    recognition.lang = "en-IN"
    setIsListening(true)

    recognition.onresult = (e: any) => {
      setIsListening(false)
      handleSend(e.results[0][0].transcript)
    }

    recognition.onerror = recognition.onend = () =>
      setIsListening(false)

    recognition.start()
  }

  /* ------------------ SEND MESSAGE ------------------ */
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

      const data = await res.json()
      if (!res.ok) throw new Error("AI failed")

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          summary: data.summary,
          table: data.table,
          note: data.note,
        },
      ])

      speak(data.summary)
    } catch {
      const err = "Sorry I could not process that"
      setMessages(prev => [...prev, { role: "assistant", content: err }])
      speak(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto bg-white/60 rounded-xl shadow-lg m-4">

      <div className="p-4 border-b font-semibold text-center">
        AI Investment Advisor
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {messages.map((msg, idx) => (
          <div key={idx} className="space-y-3">

            {/* TEXT MESSAGE */}
            {msg.content && (
              <div className={`max-w-[75%] px-4 py-2 rounded-xl text-sm ${
                msg.role === "assistant"
                  ? "bg-white text-black"
                  : "bg-cyan-500 text-black ml-auto"
              }`}>
                {msg.content}
              </div>
            )}

            {/* SUMMARY */}
            {msg.summary && (
              <div className="bg-white px-4 py-3 rounded-xl text-sm">
                {msg.summary}
              </div>
            )}

            {/* TABLE */}
            {msg.table && (
              <div className="overflow-x-auto">
                <table className="w-full border text-sm rounded-md">
                  <thead className="bg-gray-100">
                    <tr>
                      {Object.keys(msg.table[0]).map(key => (
                        <th key={key} className="border px-3 py-2 text-left">
                          {key.toUpperCase()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {msg.table.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="border px-3 py-2">
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* NOTE */}
            {msg.note && (
              <div className="text-xs text-gray-600 italic">
                {msg.note}
              </div>
            )}

          </div>
        ))}

      </div>

      <div className="flex items-center gap-2 p-4 border-t">
        <input
          className="flex-1 border rounded-md px-3 py-2 text-sm"
          placeholder="Type or speak..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
        />

        <Button variant="outline" size="icon" onClick={startListening}>
          <Mic />
        </Button>

        <Button onClick={() => handleSend()} disabled={loading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-center py-2">
        {isListening && <Wave />}
        {isSpeaking && <Wave />}
      </div>
    </div>
  )
}

function Wave() {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4].map(i => (
        <span
          key={i}
          className="h-2 w-1 bg-cyan-500 rounded-full animate-wave"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  )
}
