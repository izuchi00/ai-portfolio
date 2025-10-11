"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { analysisStages, intelligencePathways, missionIcons } from "@/data/analysisStages";
import { ArrowRight, ShieldCheck, Bot, Workflow, Gauge, Sparkles } from "lucide-react";

const deliverySteps = [
  {
    title: "Upload",
    caption: "Stage a CSV or spreadsheet and preview a curated sample in seconds.",
  },
  {
    title: "Select",
    caption: "Choose the intelligence level and missions that match your business question.",
  },
  {
    title: "Demo",
    caption: "Run the guided showcase powered by pandas, numpy, seaborn, scikit-learn, plotly, and matplotlib.",
  },
  {
    title: "Engage",
    caption: "Book the full engagement to unlock unlimited datasets, orchestrated agents, and automation roadmaps.",
  },
];

const Index: React.FC = () => {
  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-background via-background to-primary/10 p-10 md:p-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-6 text-left">
            <Badge variant="outline" className="w-fit rounded-full px-4 py-1 text-xs uppercase tracking-[0.5em]">
              Computer Science Portfolio
            </Badge>
            <h1 className="text-4xl font-semibold leading-tight text-foreground md:text-5xl">
              Rich, agentic data intelligence for teams drowning in messy spreadsheets.
            </h1>
            <p className="text-lg text-muted-foreground">
              I blend generative and autonomous AI to clean, analyse, and narrate data stories that recruiters and operators can trust. Test the demo, then hire me to launch production-grade intelligence tailored to your stack.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-full px-7">
                <Link to="/data-analysis">
                  Explore the Data Intelligence Studio
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-primary/40 px-7">
                <Link to="/web-scraping">Try the web intelligence demo</Link>
              </Button>
            </div>
          </div>
          <div className="flex w-full max-w-sm flex-col gap-4 rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm">
            <div className="flex items-center gap-3 text-primary">
              <Sparkles className="h-6 w-6" />
              <p className="text-sm font-semibold uppercase tracking-[0.35em]">Generative & Agentic AI</p>
            </div>
            <p className="text-sm text-muted-foreground">
              The studio orchestrates:
            </p>
            <ul className="grid gap-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                <span>Governed data onboarding with pandas + numpy foundations.</span>
              </li>
              <li className="flex items-start gap-2">
                <Workflow className="mt-0.5 h-4 w-4 text-primary" />
                <span>Agent-led analysis flows using seaborn, plotly, and matplotlib visuals.</span>
              </li>
              <li className="flex items-start gap-2">
                <Bot className="mt-0.5 h-4 w-4 text-primary" />
                <span>scikit-learn intelligence to cluster, predict, and surface anomalies.</span>
              </li>
              <li className="flex items-start gap-2">
                <Gauge className="mt-0.5 h-4 w-4 text-primary" />
                <span>LLM-powered reporting with call-to-action guardrails and hiring-ready narratives.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {deliverySteps.map((step, index) => (
          <Card key={step.title} className="h-full rounded-3xl border border-border/70 bg-muted/40">
            <CardHeader>
              <Badge variant="outline" className="w-fit rounded-full border-primary/40 text-xs uppercase tracking-[0.4em]">
                Step {index + 1}
              </Badge>
              <CardTitle className="text-xl font-semibold">{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-muted-foreground">
                {step.caption}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-10">
        <div className="flex flex-col gap-3 text-left">
          <Badge variant="outline" className="w-fit rounded-full px-4 py-1 text-xs uppercase tracking-[0.5em]">
            Data Intelligence Studio
          </Badge>
          <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
            Choose your intelligence tier
          </h2>
          <p className="max-w-2xl text-base text-muted-foreground">
            Every tier blends storytelling and automation. Demos are intentionally scoped—ready to scale when you are.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {analysisStages.map((stage) => (
            <Card key={stage.id} className="flex h-full flex-col justify-between rounded-3xl border border-border/70 bg-background/90">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-3">
                  <stage.icon className="h-6 w-6 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{stage.subtitle}</span>
                    <CardTitle className="text-2xl font-semibold">{stage.title}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-sm text-muted-foreground">
                  {stage.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Python stack</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {stage.pythonStack.map((pkg) => (
                      <Badge key={pkg} variant="secondary" className="rounded-full px-3 py-1 text-xs">
                        {pkg}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Focus areas</p>
                  <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
                    {stage.focusAreas.map((focus) => (
                      <li key={focus} className="leading-relaxed">{focus}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 text-xs text-primary">
                  {stage.limitCopy}
                </div>
                <Button asChild variant="outline" className="w-full rounded-full">
                  <Link to="/data-analysis" state={{ stage: stage.id }}>
                    Explore {stage.title}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-10">
        <div className="flex flex-col gap-3 text-left">
          <Badge variant="outline" className="w-fit rounded-full px-4 py-1 text-xs uppercase tracking-[0.5em]">
            Business Intelligence Playbooks
          </Badge>
          <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
            Curated pathways for recruiters, operators, and founders
          </h2>
          <p className="max-w-2xl text-base text-muted-foreground">
            These demo-ready pathways demonstrate how we move from data uploads to actionable recommendations in minutes.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {intelligencePathways.map((pathway) => {
            const Icon = missionIcons[pathway.category] ?? Sparkles;
            return (
              <Card key={pathway.id} className="h-full rounded-3xl border border-border/70 bg-muted/30">
                <CardHeader className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{pathway.category}</span>
                      <CardTitle className="text-xl font-semibold">{pathway.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-sm text-muted-foreground">
                    {pathway.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border border-dashed border-primary/40 bg-background/90 p-4 text-sm text-foreground">
                    {pathway.impact}
                  </div>
                  <Button asChild size="sm" variant="ghost" className="w-full justify-between rounded-full border border-border/70">
                    <Link to="/templates">
                      Preview mission template
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-primary/40 bg-primary/10 p-10 text-center">
        <div className="mx-auto max-w-3xl space-y-4">
          <h3 className="text-3xl font-semibold text-primary">Ready to deploy the full experience?</h3>
          <p className="text-base text-primary/80">
            Request the full engagement to unlock unlimited analysis runs, continuous web intelligence, dedicated agents, and bespoke executive reporting.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-full px-7">
              <Link to="/contact">Book a discovery call</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-primary/40 px-7 text-primary">
              <Link to="/about">Learn about my process</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
