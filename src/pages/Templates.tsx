"use client";

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
    <SectionWrapper className="space-y-8 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">AI Analysis Templates</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Select any template, swap in your dataset, and run the analysis.
        </p>
      </div>

      <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row gap-4">
        <Input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
          icon={<Search className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="w-full max-w-4xl mx-auto flex flex-wrap gap-2 justify-center">
        <Badge
          variant={activeCategory === "All" ? "default" : "secondary"}
          className={cn("cursor-pointer px-4 py-2 text-sm", activeCategory === "All" && "bg-primary text-primary-foreground")}
          onClick={() => setActiveCategory("All")}
        >
          All
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category}
            variant={activeCategory === category ? "default" : "secondary"}
            className={cn("cursor-pointer px-4 py-2 text-sm", activeCategory === category && "bg-primary text-primary-foreground")}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => (
            <Card key={template.id} className="flex flex-col h-full hover:shadow-lg transition-shadow">
              <CardHeader className="flex-row items-center space-x-4 pb-2">
                <template.icon className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-xl font-semibold">{template.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">{template.steps} step{template.steps !== 1 ? "s" : ""}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between pt-2">
                <p className="text-muted-foreground text-sm mb-4">{template.description}</p>
                <div className="flex flex-col gap-2 mt-auto">
                  {template.requiresFile && (
                    <Link to="/upload-data">
                      <Button variant="outline" className="w-full">Select a file</Button>
                    </Link>
                  )}
                  <Button className="w-full" onClick={() => handleRunReport(template)}>
                    {template.actionText}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground text-lg">No templates found matching your criteria.</p>
        )}
      </div>
    </SectionWrapper>
  );
};

export default Templates;