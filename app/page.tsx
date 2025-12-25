import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mic, TrendingUp, ShieldCheck } from "lucide-react"

export default async function Home() {
  const { userId } = await auth()

  if (userId) {
    redirect("/chat")
  }

  return (
    <main className="relative h-screen overflow-hidden bg-blue-50 px-4">
      
      {/* Background glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.15),transparent_40%)]" />

      {/* Content Wrapper */}
      <div className="flex h-full flex-col items-center justify-center">
        <Card className="w-full max-w-3xl border-white/10 bg-white/5 backdrop-blur-xl p-8 md:p-12">
          <div className="flex flex-col items-center text-center space-y-6">
            
            <Badge className="bg-black/10 text-black">
              AI Powered • Voice First • Secure
            </Badge>

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              <span className="text-cyan-400">
                Your Personal AI Investment Guide
              </span>
            </h1>

            <p className="max-w-xl text-sm md:text-base text-white/70">
              Plan goals, understand risks, and explore investment options using a
              voice-first AI assistant — built for modern investors.
            </p>

            <Button
              size="lg"
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
              asChild
            >
              <a href="/chat">
                <Mic className="mr-2 h-5 w-5" />
                Get Started
              </a>
            </Button>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 w-full text-black">
              <Feature icon={<Mic />} title="Voice First" desc="Speak naturally." />
              <Feature icon={<TrendingUp />} title="Goal Based" desc="Home, car, wealth." />
              <Feature icon={<ShieldCheck />} title="Secure" desc="Guidance only." />
            </div>
          </div>
        </Card>
      </div>

      {/* Separator */}
      <Separator className="absolute bottom-16 left-0 right-0 bg-black" />

      {/* Footer */}
      <footer className="absolute bottom-0 w-full border-t backdrop-blur px-6 py-3 text-xs text-black">
     <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
    
    {/* Left */}
    <div className="text-left">
      © {new Date().getFullYear()} AI Investment Advisor
    </div>

    {/* Center */}
    <div className="text-center text-black/70">
      Educational insights only. Not financial advice.
    </div>

    {/* Right */}
    <div className="text-right">
        Guidelines & Compliance
    </div>

  </div>
</footer>

    </main>
  )
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-white/10 bg-white/5 p-4 text-center">
      <div className="mb-2 text-cyan-400">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-black/60">{desc}</p>
    </div>
  )
}
