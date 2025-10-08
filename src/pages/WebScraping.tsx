"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import SectionWrapper from "@/components/SectionWrapper";
import { toast } from "sonner";

const DEMO_ITEM_LIMIT = 5;

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

    setTimeout(() => {
      setIsLoading(false);
      const demoItems = Array.from({ length: DEMO_ITEM_LIMIT }, (_, index) => `Demo item ${index + 1}`);
      setScrapingResult(
        `Demo Scraping Result for "${url}" (extracting "${extractionQuery}"):\n\n` +
        `${demoItems.map((item, index) => `${index + 1}. ${item}`).join("\n")}\n\n` +
        "This preview shows a limited slice of the extraction pipeline. Full scrapers include pagination, dynamic rendering, authentication handling, and structured exports tailored to your stack."
      );
      toast.success("Demo scraping complete!");
    }, 2000);
  };

  const demoSteps = [
    "Enter a public URL with accessible content.",
    "Describe what the agent should extract (e.g., 'all pricing cards', 'article headlines').",
    "Run the demo to preview up to five items before requesting the production build.",
  ];

  return (
    <SectionWrapper className="py-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <Card className="overflow-hidden rounded-3xl border shadow-sm">
          <CardHeader className="space-y-4 text-center">
            <Badge variant="outline" className="mx-auto w-fit uppercase tracking-wide text-primary">Agentic Web Intelligence</Badge>
            <CardTitle className="text-3xl font-semibold">Web Scraping Demo</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Showcase how my autonomous agents capture the exact facts you need while respecting rate limits and compliance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-4 rounded-2xl border bg-muted/40 p-6 text-sm text-muted-foreground sm:grid-cols-3">
              {demoSteps.map((step, index) => (
                <div key={step} className="flex flex-col gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {index + 1}
                  </span>
                  <p className="leading-relaxed">{step}</p>
                </div>
              ))}
            </div>

            <Alert className="rounded-2xl border-primary/40 bg-primary/5">
              <AlertTitle className="text-sm font-semibold">Demo boundaries</AlertTitle>
              <AlertDescription className="text-sm text-muted-foreground">
                The preview returns up to {DEMO_ITEM_LIMIT} items and omits login flows or scripted navigation. Hire me to deploy
                resilient scrapers with monitoring, enrichment, and secure delivery.
              </AlertDescription>
            </Alert>

            <div className="space-y-5">
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
                  placeholder="Describe the content or attributes you want the agent to capture..."
                  value={extractionQuery}
                  onChange={(e) => setExtractionQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>Need authenticated or multi-step flows? Let's plan a production agent together.</span>
                <Button size="sm" variant="outline" asChild>
                  <a href="/contact">Request full scraper</a>
                </Button>
              </div>
              <Button size="lg" className="w-full" onClick={handleScrape} disabled={!url || !extractionQuery || isLoading}>
                {isLoading ? "Scraping..." : "Run demo extraction"}
              </Button>
            </div>

            {scrapingResult && (
              <div className="rounded-2xl border bg-muted p-6 text-left text-sm text-muted-foreground whitespace-pre-wrap">
                <h4 className="text-lg font-semibold text-foreground mb-2">Demo output</h4>
                {scrapingResult}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SectionWrapper>
  );
};

export default WebScraping;