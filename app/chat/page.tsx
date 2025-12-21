import { currentUser } from '@clerk/nextjs/server'

export default async function ChatPage() {
  const user = await currentUser()

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">
        Welcome, {user?.firstName}
      </h2>

      {/* Your Voice + Chat UI will go here */}
    </div>
  )
}
