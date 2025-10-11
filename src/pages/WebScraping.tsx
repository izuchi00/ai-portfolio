"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight, Globe, Link2, ListChecks } from "lucide-react";

const DEMO_ITEM_LIMIT = 5;

const WebScraping: React.FC = () => {
  const [url, setUrl] = useState("");
  const [extractionQuery, setExtractionQuery] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDemo = () => {
    if (!url || !extractionQuery) {
      toast.error("Provide both a URL and the content you want extracted.");
      return;
    }

    setIsLoading(true);
    setResult(null);

    setTimeout(() => {
      const sample = Array.from({ length: DEMO_ITEM_LIMIT }, (_, index) => `Sample item ${index + 1}`)
        .map((item, index) => `${index + 1}. ${item}`)
        .join("\n");

      setResult(
        `Demo extraction for ${url} (targeting: ${extractionQuery})\n\n${sample}\n\n` +
          "Preview limited to five rows. Production scrapers include authentication handling, pagination, scheduling, and enrichment."
      );
      setIsLoading(false);
      toast.success("Demo extraction ready.");
    }, 1800);
  };

  return (
    <div className="space-y-10">
      <Card className="rounded-3xl border border-border/70 bg-muted/30">
        <CardHeader className="space-y-4 text-left">
          <Badge variant="outline" className="w-fit rounded-full px-4 py-1 text-xs uppercase tracking-[0.5em] text-primary">
            Agentic web intelligence
          </Badge>
          <CardTitle className="text-3xl font-semibold md:text-4xl">Test the web scraping agent</CardTitle>
          <CardDescription className="max-w-3xl text-base text-muted-foreground">
            Showcase how the portfolio’s agentic AI captures structured insights from any URL. Demos are capped—hire me to deploy resilient scrapers with monitoring, governance, and automation.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-8 lg:grid-cols-[0.7fr,1fr]">
        <Card className="rounded-3xl border border-border/70 bg-muted/30">
          <CardHeader className="space-y-3">
            <CardTitle className="text-xl font-semibold">How the demo works</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Follow the steps to run a limited extraction. Full builds support authentication, rate limiting, enrichment, and custom exports.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 text-primary">
              <ListChecks className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.3em]">Steps</span>
            </div>
            <ol className="space-y-3">
              <li className="rounded-2xl border border-border/60 bg-background/95 p-4">
                Paste a public URL without authentication barriers.
              </li>
              <li className="rounded-2xl border border-border/60 bg-background/95 p-4">
                Describe the information to capture (e.g. product cards, job postings, pricing sections).
              </li>
              <li className="rounded-2xl border border-border/60 bg-background/95 p-4">
                Run the demo to preview up to {DEMO_ITEM_LIMIT} items before requesting a production agent.
              </li>
            </ol>
            <Alert className="rounded-2xl border-primary/40 bg-primary/5 text-xs">
              <AlertTitle className="text-sm font-semibold">Demo limits</AlertTitle>
              <AlertDescription>
                The preview omits advanced navigation, login flows, and queueing. Paid engagements unlock full automation, monitoring, and secure delivery.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/70 bg-background/95">
          <CardHeader className="space-y-4">
            <CardTitle className="text-2xl font-semibold">Run the extraction</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              The demo simulates the Hugging Face agent pipeline powering the portfolio.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="url" className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Website URL
              </Label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="query" className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                What should the agent extract?
              </Label>
              <Textarea
                id="query"
                placeholder="Example: capture each pricing tier with name, price, features"
                rows={4}
                value={extractionQuery}
                onChange={(event) => setExtractionQuery(event.target.value)}
              />
            </div>
            <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 text-xs text-primary">
              Looking for authenticated flows or ongoing monitors? Book a discovery call for the production build.
            </div>
            <Button
              size="lg"
              className="w-full rounded-full"
              onClick={runDemo}
              disabled={!url || !extractionQuery || isLoading}
            >
              {isLoading ? "Running demo..." : "Run web intelligence demo"}
            </Button>
            {result && (
              <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/40 p-4 text-left text-sm text-muted-foreground">
                <div className="flex items-center gap-2 text-primary">
                  <Globe className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.3em]">Demo output</span>
                </div>
                <pre className="whitespace-pre-wrap text-xs text-muted-foreground/90">{result}</pre>
              </div>
            )}
            {!result && !isLoading && (
              <div className="rounded-2xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                No extraction yet. Configure your URL and query to showcase the agent’s capabilities.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border border-primary/40 bg-primary/10">
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl text-left">
            <h3 className="text-2xl font-semibold text-primary">Scale web intelligence with agentic AI</h3>
            <p className="text-sm text-primary/80">
              I build autonomous scrapers that enrich data, push to warehouses, and trigger downstream agents. Hire me to turn this demo into a production-grade capability.
            </p>
          </div>
          <Button className="rounded-full px-6" asChild>
            <a href="/contact">
              Request full engagement <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebScraping;
