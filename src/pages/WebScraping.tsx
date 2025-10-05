"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const WebScraping = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">AI-Powered Web Scraping</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-lg text-muted-foreground">
            Effortlessly extract specific data from any webpage using our intelligent scraping agents.
          </p>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Demo Features:</h3>
            <ul className="list-disc list-inside text-left mx-auto max-w-md space-y-2">
              <li>Enter a URL</li>
              <li>Specify elements to extract (e.g., "all h1 tags", "product prices")</li>
              <li>Limited number of elements extracted</li>
              <li>Basic output format (e.g., plain text)</li>
            </ul>
            <p className="text-md text-destructive-foreground font-medium">
              For large-scale scraping, complex data extraction, dynamic content handling, and structured output, please inquire about our services.
            </p>
          </div>
          <div className="space-y-4 mt-6">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="url">Website URL</Label>
              <Input id="url" placeholder="https://example.com" />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="extraction-query">What to extract (e.g., "all product titles", "news headlines")</Label>
              <Textarea id="extraction-query" placeholder="Describe the data you want to extract..." />
            </div>
            <Button size="lg">Start Scraping (Demo)</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebScraping;