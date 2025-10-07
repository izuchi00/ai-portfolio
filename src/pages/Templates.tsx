"use client";

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  BarChart2,
  Search,
  FlaskConical,
  LineChart,
  AlertTriangle,
  Smile,
  Type,
  Languages,
  Globe,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Template {
  id: string;
  title: string;
  description: string;
  steps: number;
  icon: React.ElementType;
  category: string;
  analysisType: string; // Corresponds to the backend analysis type
  requiresFile: boolean;
  actionText: string;
}

const templates: Template[] = [
  {
    id: "data-prep-cleaning",
    title: "Data Prep / Cleaning",
    description: "Clean and organize the dataset to be analysis-ready.",
    steps: 1,
    icon: UploadCloud,
    category: "Data Preparation",
    analysisType: "data_preparation",
    requiresFile: true,
    actionText: "Run Report",
  },
  {
    id: "exploratory-analysis",
    title: "Exploratory Analysis",
    description: "Conduct an exploratory analysis - basic descriptive stats and data visualizations.",
    steps: 3,
    icon: FlaskConical,
    category: "Exploratory Analysis",
    analysisType: "exploratory_analysis",
    requiresFile: true,
    actionText: "Run Report",
  },
  {
    id: "data-viz-analysis",
    title: "Data Visualization & Analysis",
    description: "Create and analyze data visualizations, highlighting trends and insights for each chart.",
    steps: 2,
    icon: BarChart2,
    category: "Data Visualization",
    analysisType: "data_visualization",
    requiresFile: true,
    actionText: "Run Report",
  },
  {
    id: "correlation-analysis",
    title: "Correlation Analysis",
    description: "Show the relationship between multiple variables in a dataset by calculating their correlation.",
    steps: 2,
    icon: LineChart,
    category: "Data Visualization",
    analysisType: "correlation_analysis",
    requiresFile: true,
    actionText: "Run Report",
  },
  {
    id: "anomaly-detection",
    title: "Anomaly Detection",
    description: "Identify data points that deviate from the norm.",
    steps: 2,
    icon: AlertTriangle,
    category: "Data Analysis",
    analysisType: "anomaly_detection",
    requiresFile: true,
    actionText: "Run Report",
  },
  {
    id: "sentiment-analysis",
    title: "Sentiment Analysis",
    description: "Analyze the emotional tone of text (customer reviews) - positive, negative or neutral.",
    steps: 1,
    icon: Smile,
    category: "Qualitative Analysis",
    analysisType: "sentiment_analysis",
    requiresFile: false, // This will be handled by TextAnalysis page
    actionText: "Go to Tool",
  },
  {
    id: "text-extraction",
    title: "Text Extraction",
    description: "Extract specific items from a block of text (ie: person's name, company name, address).",
    steps: 1,
    icon: Type,
    category: "Qualitative Analysis",
    analysisType: "text_extraction",
    requiresFile: false, // This will be handled by TextAnalysis page
    actionText: "Go to Tool",
  },
  {
    id: "language-translation",
    title: "Language Translation",
    description: "Translate text from any language to any language.",
    steps: 0,
    icon: Languages,
    category: "Qualitative Analysis",
    analysisType: "language_translation",
    requiresFile: false, // This will be handled by TextAnalysis page
    actionText: "Go to Tool",
  },
  {
    id: "traffic-acquisition",
    title: "Traffic Acquisition Report",
    description: "Find your website's top acquisition traffic sources.",
    steps: 1,
    icon: Globe,
    category: "Marketing",
    analysisType: "traffic_acquisition",
    requiresFile: false, // This would require external API integration
    actionText: "Connect Analytics",
  },
];

const categories = Array.from(new Set(templates.map((t) => t.category)));

const Templates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || template.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRunReport = (template: Template) => {
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