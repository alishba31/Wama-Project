"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const predefinedQuestions = [
  "What is WMS?",
  "How does the trouble ticket system work?",
  "What is the OEM module responsible for?",
  "How are SLAs monitored in WMS?",
  "How can users submit dynamic forms in WMS?",
  "What is included in service reporting?",
];

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isFirstInteractionToday = () => {
    const lastInteractionDate = localStorage.getItem("chatbotLastInteractionDate");
    const today = new Date().toDateString();
    return lastInteractionDate !== today;
  };

  const updateInteractionDate = () => {
    localStorage.setItem("chatbotLastInteractionDate", new Date().toDateString());
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    if (isFirstInteractionToday() && messages.length === 0 && isOpen) {
      setMessages([
        {
          role: "assistant",
          content: "Hello! How can I help you today?",
        },
      ]);
      updateInteractionDate();
    }
  }, [messages, isOpen]);

  const sendMessage = async (userInput: string) => {
    const userMessage: Message = { role: "user", content: userInput };
    const newMessages = [...messages, userMessage];

    setMessages([...newMessages, { role: "assistant", content: "..." }]);
    setIsLoading(true);
    setInput("");
    updateInteractionDate();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();
      setMessages([...newMessages, data]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            error instanceof Error && error.message.includes("429")
              ? "Too many requests. Please wait a moment."
              : "Sorry, something went wrong.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
  };

  const toggleChat = () => {
    const wasClosed = !isOpen;
    setIsOpen(!isOpen);

    if (wasClosed && isFirstInteractionToday() && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "Hello! How can I help you today?",
        },
      ]);
      updateInteractionDate();
    }
  };

  const chatBox = (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {isOpen ? (
        <div className="flex flex-col h-[500px] w-[350px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl overflow-hidden opacity-100">
          {/* Header */}
          <div className="bg-primary dark:bg-primary-dark text-white p-3 flex justify-between items-center">
            <h3 className="font-medium">Chat Assistant</h3>
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-200"
              aria-label="Close chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-white dark:bg-gray-800">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
                How can I help you today?
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-4 p-3 rounded-lg max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-blue-100 dark:bg-blue-900 ml-auto text-gray-800 dark:text-gray-200"
                      : "bg-gray-100 dark:bg-gray-700 mr-auto text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {msg.content === "..." ? (
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-300 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-300 animate-bounce delay-100"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-300 animate-bounce delay-200"></div>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Predefined questions */}
          <div className="p-2 border-t bg-gray-50 dark:bg-gray-700 flex flex-wrap gap-2 justify-start max-h-[100px] overflow-y-auto">
            {predefinedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(q)}
                className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-xs px-2 py-1 rounded text-gray-800 dark:text-gray-200"
                disabled={isLoading}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input and send */}
          <div className="p-3 border-t bg-white dark:bg-gray-800">
            <div className="flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-l focus:outline-none text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="bg-primary dark:bg-primary-dark text-white px-3 py-2 rounded-r hover:bg-primary-hover dark:hover:bg-primary-dark-hover disabled:bg-blue-300 dark:disabled:bg-blue-700 text-sm"
              >
                {isLoading ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={toggleChat}
          className="bg-primary dark:bg-primary-dark text-white rounded-full p-4 shadow-lg hover:bg-primary-hover dark:hover:bg-primary-dark-hover transition-all"
          aria-label="Open chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}
    </div>
  );

  if (typeof window === "undefined") return null;

  return createPortal(chatBox, document.body);
}