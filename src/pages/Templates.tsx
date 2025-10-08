"use client";

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  analysisStages,
  analysisTasks,
  intelligencePathways,
  missionIcons,
} from "@/data/analysisStages";
import { ArrowRight, Filter, Search, Sparkles } from "lucide-react";

const Templates: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");

  const filteredTasks = useMemo(() => {
    return analysisTasks.filter((task) => {
      const matchesStage = stageFilter === "all" || task.stage === stageFilter;
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStage && matchesSearch;
    });
  }, [searchTerm, stageFilter]);

  return (
    <div className="space-y-12">
      <Card className="rounded-3xl border border-border/70 bg-muted/30">
        <CardHeader className="space-y-4 text-left">
          <Badge variant="outline" className="w-fit rounded-full px-4 py-1 text-xs uppercase tracking-[0.5em] text-primary">
            Agentic mission library
          </Badge>
          <CardTitle className="text-3xl font-semibold md:text-4xl">
            Curated demos that let recruiters experience the impact fast
          </CardTitle>
          <CardDescription className="max-w-3xl text-base text-muted-foreground">
            Each template combines data staging, Python-powered analytics, and AI narration. Select a tier, stage a dataset,
            and run a limited showcase—then partner with me to unlock end-to-end automation.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-8 lg:grid-cols-[1fr,0.7fr]">
        <Card className="rounded-3xl border border-border/70 bg-background/95">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-2">
              <CardTitle className="text-2xl font-semibold">Mission catalogue</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Filter the demo deliverables and add them to your run inside the Data Intelligence Studio.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search missions (e.g. segmentation, anomaly)"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={stageFilter === "all" ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setStageFilter("all")}
                  >
                    All tiers
                  </Button>
                  {analysisStages.map((stage) => (
                    <Button
                      key={stage.id}
                      size="sm"
                      variant={stageFilter === stage.id ? "default" : "outline"}
                      className="rounded-full"
                      onClick={() => setStageFilter(stage.id)}
                    >
                      {stage.title}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => {
                const stage = analysisStages.find((item) => item.id === task.stage);
                return (
                  <Card key={task.id} className="h-full rounded-2xl border border-border/60 bg-muted/30">
                    <CardHeader className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                          {stage?.title}
                        </Badge>
                        <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.3em]">
                          {stage?.subtitle}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-semibold">{task.title}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {task.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                        Demo deliverables
                      </div>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {task.outcomes.map((outcome) => (
                          <li key={outcome}>{outcome}</li>
                        ))}
                      </ul>
                      <Button
                        size="sm"
                        className="mt-4 w-full rounded-full"
                        onClick={() => navigate("/data-analysis", { state: { stage: task.stage } })}
                      >
                        Add to studio run
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
                No missions match your filters. Try another tier or search term.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/70 bg-muted/30">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.3em]">Playbook highlights</span>
            </div>
            <CardTitle className="text-2xl font-semibold">Business intelligence pathways</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Pick a pathway to show prospects how the studio unblocks their exact bottleneck.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {intelligencePathways.map((pathway) => {
              const Icon = missionIcons[pathway.category] ?? Sparkles;
              return (
                <Card key={pathway.id} className="rounded-2xl border border-border/60 bg-background/95">
                  <CardHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{pathway.category}</p>
                        <CardTitle className="text-lg font-semibold">{pathway.title}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-sm text-muted-foreground">{pathway.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm text-primary">
                      {pathway.impact}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full rounded-full"
                      onClick={() => navigate("/data-analysis", { state: { stage: pathway.level } })}
                    >
                      Run this pathway <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border border-primary/40 bg-primary/10">
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl text-left">
            <h3 className="text-2xl font-semibold text-primary">Need a fully bespoke agentic workflow?</h3>
            <p className="text-sm text-primary/80">
              I design automated agents that stage data, run analytics, and deliver human-ready narratives. Book a discovery call to co-create your roadmap.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button className="rounded-full px-6" onClick={() => navigate("/contact")}>
              Book a discovery call
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-primary/40 px-6 text-primary"
              onClick={() => navigate("/about")}
            >
              Learn about my process
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Templates;
