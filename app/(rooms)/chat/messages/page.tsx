import PageHeader from "@/components/common/PageHeader"
import ChatMessages from "@/components/chat/ChatMessages"

export default function ChatMessagesPage(){
  return <main className="min-h-screen bg-black text-white"><div className="mx-auto max-w-3xl px-3 pt-3"><PageHeader title="💬 Chat" backHref="/chat"/></div><ChatMessages/></main>
}
