"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";
import { toast } from "sonner";
// Removed: import { supabase } from "@/lib/supabase"; // Supabase client is no longer used

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
}

interface AIChatInterfaceProps {
  dataHeaders: string[];
  dataSummary: string; // A summary of the data for AI context
}

const AIChatInterface: React.FC<AIChatInterfaceProps> = ({ dataHeaders, dataSummary }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage: Message = { id: Date.now().toString(), sender: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    try {
      // Construct the prompt for the AI, including data context
      const fullPrompt = `User query: "${userMessage.text}".
        Data Headers: ${dataHeaders.join(", ")}.
        Data Summary: ${dataSummary}.
        Please provide a concise response based on this context.`;

      // Invoke the new Vercel API route
      const response = await fetch('/api/ai-chat', { // Call the new Vercel API route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: fullPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error invoking AI function:", errorData);
        toast.error("Failed to get AI response: " + (errorData.error || response.statusText));
        const errorMessage: Message = { id: (Date.now() + 1).toString(), sender: "ai", text: "Sorry, I couldn't process that request. Please try again." };
        setMessages((prev) => [...prev, errorMessage]);
      } else {
        const data = await response.json();
        const aiResponseText = data?.response || "No response from AI.";
        const aiMessage: Message = { id: (Date.now() + 1).toString(), sender: "ai", text: aiResponseText };
        setMessages((prev) => [...prev, aiMessage]);
        toast.success("AI response received!");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred: " + message);
      const errorMessage: Message = { id: (Date.now() + 1).toString(), sender: "ai", text: "An unexpected error occurred. Please check the console for details." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <Card className="w-full h-[500px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">AI Chat Assistant</CardTitle>
        <CardDescription className="text-center mt-2">
          Ask questions about your data (powered by Hugging Face via Vercel Function).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow p-4 pt-0">
        <ScrollArea className="flex-grow pr-4 mb-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Bot className="h-6 w-6 text-primary flex-shrink-0" />
              <div className="bg-muted p-3 rounded-lg max-w-[80%] text-left">
                <p className="text-sm">Hello! I'm your AI assistant. Ask me anything about your data (e.g., "What are the headers?", "Give me a summary").</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="font-semibold text-destructive-foreground">Note:</span> This AI provides responses from Hugging Face via a Vercel Function.
                </p>
              </div>
            </div>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${msg.sender === "user" ? "justify-end" : ""}`}
              >
                {msg.sender === "ai" && <Bot className="h-6 w-6 text-primary flex-shrink-0" />}
                <div
                  className={
                    `p-3 rounded-lg max-w-[80%] text-left ` +
                    (msg.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground")
                  }
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
                {msg.sender === "user" && <User className="h-6 w-6 text-muted-foreground flex-shrink-0" />}
              </div>
            ))}
            {isThinking && (
              <div className="flex items-start gap-3">
                <Bot className="h-6 w-6 text-primary flex-shrink-0" />
                <div className="bg-muted p-3 rounded-lg max-w-[80%] text-left">
                  <p className="text-sm animate-pulse">AI is thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Input
            placeholder="Ask a question about your data..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !isThinking) {
                handleSendMessage();
              }
            }}
            disabled={isThinking}
          />
          <Button onClick={handleSendMessage} disabled={isThinking}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIChatInterface;