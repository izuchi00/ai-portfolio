"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const WebScraping = () => {
  const [url, setUrl] = useState<string>("");
  const [extractionQuery, setExtractionQuery] = useState<string>("");
  const [scrapingResult, setScrapingResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleScrape = () => {
    if (!url || !extractionQuery) {
      toast.error("Please enter both a URL and what to extract.");
      return;
    }

    setIsLoading(true);
    setScrapingResult(null);

    // Simulate API call for web scraping
    setTimeout(() => {
      setIsLoading(false);
      setScrapingResult(
        `Demo Scraping Result for "${url}" (extracting "${extractionQuery}"):\n\n` +
        "Simulated Data: [\"Item 1 from demo\", \"Item 2 from demo\", \"Item 3 from demo\"]\n\n" +
        "This is a limited demo. For large-scale scraping, complex data extraction, dynamic content handling, " +
        "and structured output, please contact us to discuss our services."
      );
      toast.success("Demo scraping complete!");
    }, 2500); // Simulate a 2.5-second scraping time
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">AI-Powered Web Scraping</CardTitle>
          <CardDescription className="text-center mt-2">
            Effortlessly extract specific data from any webpage using our intelligent scraping agents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Demo Features:</h3>
            <ul className="list-disc list-inside text-left mx-auto max-w-md space-y-2 text-muted-foreground">
              <li>Enter a URL</li>
              <li>Specify elements to extract (e.g., "all h1 tags", "product prices")</li>
              <li>Limited number of elements extracted (simulated)</li>
              <li>Basic output format (e.g., plain text) (simulated)</li>
            </ul>
            <p className="text-md text-destructive-foreground font-medium">
              For large-scale scraping, complex data extraction, dynamic content handling, and structured output, please inquire about our services.
            </p>
          </div>
          <div className="space-y-4 mt-6">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="extraction-query">What to extract (e.g., "all product titles", "news headlines")</Label>
              <Textarea
                id="extraction-query"
                placeholder="Describe the data you want to extract..."
                value={extractionQuery}
                onChange={(e) => setExtractionQuery(e.target.value)}
              />
            </div>
            <Button size="lg" onClick={handleScrape} disabled={!url || !extractionQuery || isLoading}>
              {isLoading ? "Scraping..." : "Start Scraping (Demo)"}
            </Button>
          </div>

          {scrapingResult && (
            <div className="mt-8 p-4 border rounded-md bg-muted text-left whitespace-pre-wrap">
              <h4 className="text-xl font-semibold mb-2">Demo Scraping Result:</h4>
              <p className="text-muted-foreground">{scrapingResult}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WebScraping;