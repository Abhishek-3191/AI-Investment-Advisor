import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import {
  SignInButton,
  SignUpButton,
  SignOutButton,
} from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import {
  ArrowUpRight,
  BrainCircuit,
  Check,
  Mic,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react"

export default async function Home() {
  const { userId } = await auth()

  // if (userId) {
  //   redirect("/chat")
  // }

  return (
    <main className="relative flex h-screen min-h-[680px] flex-col overflow-hidden bg-[#f7f7f3] text-[#111111]">

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

        {/* Green glow */}
        <div className="absolute left-1/2 top-[18%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#c7ff4d]/20 blur-[120px]" />

        {/* Small ambient glow */}
        <div className="absolute right-[-120px] top-[20%] h-[320px] w-[320px] rounded-full bg-[#dff7a3]/30 blur-[100px]" />
      </div>

      {/* ================= NAVBAR ================= */}

      <header className="relative z-20 px-5 pt-5 sm:px-8 lg:px-12">
        <nav className="mx-auto flex h-[64px] max-w-[1400px] items-center justify-between rounded-full border border-black/[0.07] bg-white/75 px-3 pl-5 shadow-[0_8px_40px_rgba(0,0,0,0.04)] backdrop-blur-xl">

          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111] text-[#c7ff4d]">
              <Sparkles className="h-4 w-4" />
            </div>

            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-semibold tracking-[-0.02em]">
                AI Investment
              </span>
              <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-black/40">
                Advisor
              </span>
            </div>
          </a>

          {/* Center nav */}
          <div className="hidden items-center gap-8 text-[13px] font-medium text-black/55 md:flex">
            <a
              href="#features"
              className="transition-colors hover:text-black"
            >
              Features
            </a>

            <a
              href="#how"
              className="transition-colors hover:text-black"
            >
              How it works
            </a>

            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8bc400]" />
              AI Powered
            </span>
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2">
  {!userId ? (
    <>
      <SignInButton mode="redirect" forceRedirectUrl="/chat">
        <Button
          variant="ghost"
          className="hidden rounded-full px-4 text-[13px] font-medium hover:bg-black/5 sm:flex"
        >
          Sign in
        </Button>
      </SignInButton>

      <SignUpButton mode="redirect" forceRedirectUrl="/chat">
        <Button
          className="h-10 rounded-full bg-[#111] px-5 text-[13px] font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-black hover:shadow-lg"
        >
          Sign up
          <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </SignUpButton>
    </>
  ) : (
    <SignOutButton>
      <Button
        className="h-10 rounded-full bg-[#111] px-5 text-[13px] font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-black hover:shadow-lg"
      >
        Logout
      </Button>
    </SignOutButton>
  )}
</div>
        </nav>
      </header>

      {/* ================= HERO ================= */}

      <section className="relative z-10 mx-auto flex min-h-0 flex-1 w-full max-w-[1400px] items-center px-6 py-6 sm:px-10 lg:px-16">

        <div className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">

          {/* LEFT */}

          <div className="relative">

            {/* Eyebrow */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/70 px-3 py-1.5 text-[11px] font-medium text-black/60 shadow-sm backdrop-blur">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c7ff4d] text-black">
                <Sparkles className="h-3 w-3" />
              </span>
              Intelligent investing, simplified
            </div>

            {/* Heading */}

            <h1 className="max-w-[760px] text-[48px] font-semibold leading-[0.94] tracking-[-0.055em] sm:text-[64px] lg:text-[76px] xl:text-[88px]">

              Invest with
              <br />

              <span className="relative inline-block">
                <span className="relative z-10">clarity.</span>

                {/* underline */}
                <span className="absolute bottom-[-2px] left-0 h-[9px] w-full -rotate-1 rounded-full bg-[#c7ff4d] sm:h-[12px]" />
              </span>

              <br />

              <span className="text-black/30">
                not complexity.
              </span>
            </h1>

            {/* Description */}

            <p className="mt-6 max-w-[560px] text-[15px] leading-6 text-black/55 sm:text-[16px]">
              Understand your goals, risk and market conditions with an AI
              investment guide built to turn financial decisions into a
              simple, personalized plan.
            </p>

            {/* CTA */}

            <div className="mt-7 flex flex-wrap items-center gap-3">

              <Button
                asChild
                size="lg"
                className="group h-12 rounded-full bg-[#111] px-6 text-[14px] font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.14)] transition-all hover:-translate-y-1 hover:bg-black hover:shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
              >
                <a href="/chat">
                  Start Investing
                  <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </Button>

              <div className="flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/60 px-4 py-3 text-[12px] text-black/50 backdrop-blur">
                <Mic className="h-3.5 w-3.5 text-black" />
                Ask with your voice
              </div>

            </div>

            {/* Trust */}

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-medium text-black/40">

              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#6f9f00]" />
                Personalized
              </div>

              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#6f9f00]" />
                Goal based
              </div>

              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#6f9f00]" />
                AI assisted
              </div>

            </div>
          </div>

          {/* RIGHT VISUAL */}

          <div className="relative hidden h-[470px] lg:block">

            {/* Main floating card */}

            <div className="absolute left-[10%] top-[10%] w-[330px] rotate-[-3deg] rounded-[28px] border border-black/[0.07] bg-white p-5 shadow-[0_30px_80px_rgba(0,0,0,0.10)] transition-transform duration-500 hover:rotate-0">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-black/35">
                    Your investment plan
                  </p>

                  <p className="mt-1 text-[21px] font-semibold tracking-[-0.04em]">
                    Balanced Growth
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#efffc9]">
                  <TrendingUp className="h-4 w-4" />
                </div>

              </div>

              {/* Chart */}

              <div className="mt-7 flex h-[125px] items-end gap-2">

                {[28, 38, 34, 53, 47, 66, 61, 79, 73, 96].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-t-md bg-[#c7ff4d]"
                      style={{ height: `${height}%` }}
                    />
                  )
                )}

              </div>

              <div className="mt-4 flex items-center justify-between border-t border-black/[0.06] pt-4">

                <div>
                  <p className="text-[10px] text-black/35">
                    Portfolio allocation
                  </p>
                  <p className="mt-1 text-[13px] font-semibold">
                    Equity · Gold · Debt
                  </p>
                </div>

                <div className="rounded-full bg-[#f4f4ef] px-3 py-1.5 text-[11px] font-medium">
                  AI selected
                </div>

              </div>
            </div>

            {/* AI card */}

            <div className="absolute right-[2%] top-[4%] w-[205px] rotate-[4deg] rounded-[22px] border border-black/[0.07] bg-[#111] p-4 text-white shadow-[0_25px_70px_rgba(0,0,0,0.18)]">

              <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c7ff4d] text-black">
                  <BrainCircuit className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-[11px] font-semibold">
                    AI Insight
                  </p>
                  <p className="text-[9px] text-white/40">
                    Just now
                  </p>
                </div>

              </div>

              <p className="mt-4 text-[12px] leading-5 text-white/70">
                Your plan balances growth potential with your selected risk
                level.
              </p>

            </div>

            {/* Voice card */}

            <div className="absolute bottom-[8%] left-[3%] flex w-[235px] rotate-[2deg] items-center gap-3 rounded-[22px] border border-black/[0.07] bg-white/90 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.09)] backdrop-blur">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#111] text-[#c7ff4d]">
                <Mic className="h-4 w-4" />
              </div>

              <div>
                <p className="text-[11px] font-medium text-black/35">
                  Voice input
                </p>

                <p className="mt-1 text-[13px] font-semibold">
                  "Plan ₹5 lakh for 7 years"
                </p>
              </div>

            </div>

            {/* Security badge */}

            <div className="absolute bottom-[4%] right-[3%] flex items-center gap-2 rounded-full border border-black/[0.07] bg-white px-4 py-2.5 text-[10px] font-medium shadow-lg">

              <ShieldCheck className="h-3.5 w-3.5 text-[#719d00]" />

              Secure & private

            </div>

            {/* Decorative circle */}

            <div className="absolute bottom-[17%] right-[20%] -z-10 h-[170px] w-[170px] rounded-full border border-black/[0.06]" />

            <div className="absolute bottom-[20%] right-[23%] -z-10 h-[110px] w-[110px] rounded-full bg-[#c7ff4d]/20 blur-2xl" />

          </div>

        </div>
      </section>

      {/* ================= FOOTER ================= */}

      <footer className="relative z-20 px-5 pb-4 sm:px-8 lg:px-12">

        <div className="mx-auto flex max-w-[1400px] items-center justify-between border-t border-black/[0.07] pt-3 text-[10px] text-black/40">

          <div>
            © {new Date().getFullYear()} AI Investment Advisor
          </div>

          <div className="hidden items-center gap-5 sm:flex">
            <span>Educational insights only</span>
            <span>·</span>
            <span>Not financial advice</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8db500]" />
            <span>Built with AI</span>
          </div>

        </div>

      </footer>

    </main>
  )
}