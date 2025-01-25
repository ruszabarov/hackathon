import Link from "next/link";

export default function HomePage() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 bg-zinc-900 text-white rounded-lg p-4 overflow-auto mb-4">
        {/* Chat messages would go here */}
        <p className="mb-2">Welcome to the chat!</p>
      </div>
      <div className="flex">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 p-2 border border-zinc-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-zinc-900"
        />
        <button className="bg-zinc-700 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Send
        </button>
      </div>
    </div>
  );
}
