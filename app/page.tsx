import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const { userId } = await auth()

  if (userId) {
    redirect('/chat')
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <a
        href="/chat"
        className="rounded bg-black px-6 py-3 text-white"
      >
        Get Started
      </a>
    </main>
  )
}
