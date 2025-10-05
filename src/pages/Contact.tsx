"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Contact = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    // Simulate sending the contact form
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Thank you for your message! We'll get back to you soon.");
      setName("");
      setEmail("");
      setMessage("");
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Contact Us</CardTitle>
          <CardDescription className="text-center mt-2">
            Have a project in mind or want to learn more about our AI solutions? Reach out to us!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Tell us about your project or inquiry..."
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Message"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            We look forward to hearing from you!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Contact;