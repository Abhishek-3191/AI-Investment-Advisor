import { currentUser } from "@clerk/nextjs/server"
import ChatClient from "./ChatClient"

export default async function ChatPage() {
  const user = await currentUser()

  return (
    <main className="flex h-screen bg-blue-50">
      <ChatClient
        userName={user?.firstName || "User"}
        email={user?.primaryEmailAddress?.emailAddress || ""}
      />
    </main>
  )
}
