"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Search } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { analysisTemplates, AnalysisTemplate } from "@/data/templates";

const categories = Array.from(new Set(analysisTemplates.map((t) => t.category)));

const Templates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();

  const filteredTemplates = analysisTemplates.filter((template) => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || template.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRunReport = (template: AnalysisTemplate) => {
    if (template.requiresFile) {
      // For templates requiring a file, navigate to DataAnalysis with the analysisType
      // The DataAnalysis page will then check if data is present or prompt for upload
      navigate("/data-analysis", { state: { analysisType: template.analysisType } });
    } else if (template.analysisType === "sentiment_analysis" || template.analysisType === "text_extraction" || template.analysisType === "language_translation") {
      // For text-based tools, navigate to TextAnalysis page
      navigate("/text-analysis", { state: { analysisType: template.analysisType } });
    } else if (template.analysisType === "traffic_acquisition") {
      toast.info("This feature requires connecting to an analytics platform (e.g., Google Analytics).");
    } else {
      toast.info(`Action for "${template.title}" not yet fully implemented.`);
    }
  };

  return (
    <SectionWrapper className="space-y-10 py-10">
      <div className="relative overflow-hidden rounded-3xl border bg-muted/40 p-8 text-center">
        <Badge variant="outline" className="mx-auto mb-4 w-fit uppercase tracking-wide text-primary">AI Missions Library</Badge>
        <h1 className="text-4xl font-semibold text-foreground">Choose an agentic workflow</h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-3xl mx-auto">
          Each mission blends generative and analytical intelligence to help teams struggling with data move from raw files to
          confident decisions. Preview the demo or engage me to deploy the full pipeline for your organisation.
        </p>
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <Input
          type="text"
          placeholder="Search missions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
          icon={<Search className="h-4 w-4 text-muted-foreground" />}
        />
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge
            variant={activeCategory === "All" ? "default" : "secondary"}
            className={cn(
              "cursor-pointer px-4 py-1.5 text-sm",
              activeCategory === "All" && "bg-primary text-primary-foreground",
            )}
            onClick={() => setActiveCategory("All")}
          >
            All missions
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category}
              variant={activeCategory === category ? "default" : "secondary"}
              className={cn(
                "cursor-pointer px-4 py-1.5 text-sm",
                activeCategory === category && "bg-primary text-primary-foreground",
              )}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      <Alert className="mx-auto w-full max-w-4xl border-primary/40 bg-primary/5">
        <AlertTitle className="text-sm font-semibold">Demo guardrails</AlertTitle>
        <AlertDescription className="text-sm text-muted-foreground">
          Missions preview limited datasets, a single chart, and three chat prompts. Partner with me to unlock end-to-end,
          production deployments tuned to your stack.
        </AlertDescription>
      </Alert>

      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 mx-auto">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => (
            <Card key={template.id} className="flex h-full flex-col justify-between rounded-3xl border shadow-sm">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="flex items-center gap-2 text-xs">
                    <template.icon className="h-4 w-4 text-primary" />
                    {template.category}
                  </Badge>
                  {template.requiresFile ? (
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wide">Dataset required</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wide">Realtime agent</Badge>
                  )}
                </div>
                <div>
                  <CardTitle className="text-2xl font-semibold text-foreground">{template.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {template.steps} step{template.steps !== 1 ? "s" : ""} of guided intelligence
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{template.description}</p>
                <div className="flex flex-col gap-2">
                  {template.requiresFile && (
                    <Button variant="outline" className="w-full" onClick={() => navigate("/data-analysis", { state: { analysisType: template.analysisType } })}>
                      Jump to demo workspace
                    </Button>
                  )}
                  <Button className="w-full" onClick={() => handleRunReport(template)}>
                    {template.actionText}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground text-lg">No missions found. Try a different filter.</p>
        )}
      </div>
    </SectionWrapper>
  );
};

export default Templates;