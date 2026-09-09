import { useEffect, useRef, useState } from "react";
import api from "../api";
import { useCurrentUser } from "../auth/hooks/use.current";

export default function Chatbot({ open, setOpen }) {
  const { getCurrentUser } = useCurrentUser();
  const [conversationId, setConversationId] = useState(null);
  
  const [messages, setMessages] = useState([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "Hello there! How can I help you with the POS system?",
      isWelcomeMessage: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let isActive = true;

    getCurrentUser()
      .then((currentUser) => {
        if (!isActive || !currentUser?.name) return;

        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.isWelcomeMessage
              ? {
                  ...message,
                  text: `Hello ${currentUser.name}! How can I help you with the POS system?`,
                }
              : message,
          ),
        );
      })
      .catch(() => {
        // Keep the chatbot usable with its generic greeting if the request fails.
      });

    return () => {
      isActive = false;
    };
  }, [getCurrentUser]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages, open]);

  async function sendMessage(event) {
    event.preventDefault();

    const message = input.trim();

    if (!message || sending) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: message,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setSending(true);

    try {
      const response = await api.post("/chat", {
        message,
        conversationId,
      });
      setConversationId(response.data.conversationId);
      const assistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: response.data?.message || "I could not generate a response.",
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text:
          error.response?.data?.message ||
          "The chatbot is unavailable. Please try again.",
        error: true,
      };

      setMessages((current) => [...current, errorMessage]);
      
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {open && (
        <section
          className="fixed bottom-24 right-5 z-50 flex h-[520px] w-[calc(100%-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10"
          aria-label="POS chatbot"
        >
          <header className="flex items-center justify-between bg-indigo-600 px-4 py-3 text-white">
            <div>
              <h2 className="font-bold">POS Assistant</h2>
              <p className="text-xs text-indigo-100">
                Ask questions about the POS system
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 hover:bg-white/10"
              aria-label="Close chatbot"
            >
              ✕
            </button>
          </header>

          <div
            className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4"
            aria-live="polite"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <p
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                    message.role === "user"
                      ? "rounded-br-md bg-indigo-600 text-white"
                      : message.error
                        ? "rounded-bl-md bg-red-50 text-red-700"
                        : "rounded-bl-md bg-white text-gray-700 shadow-sm"
                  }`}
                >
                  {message.text}
                </p>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <p className="rounded-2xl rounded-bl-md bg-white px-4 py-2.5 text-sm text-gray-500 shadow-sm">
                  Thinking…
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={sendMessage}
            className="flex gap-2 border-t border-gray-200 bg-white p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={2000}
              disabled={sending}
              placeholder="Type your question..."
              className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 disabled:bg-gray-100"
              aria-label="Chat message"
            />

            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-2xl text-white shadow-lg transition hover:bg-indigo-700"
        aria-label={open ? "Close chatbot" : "Open chatbot"}
        aria-expanded={open}
      >
        {open ? "✕" : "💬"}
      </button>
    </>
  );
}
