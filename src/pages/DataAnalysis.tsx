"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const DataAnalysis = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setAnalysisResult(null); // Clear previous results
    }
  };

  const handleAnalyze = () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    // Simulate API call for data analysis
    setTimeout(() => {
      setIsLoading(false);
      setAnalysisResult(
        `Demo Analysis for "${selectedFile.name}":\n\n` +
        "Summary: This is a simulated summary of your dataset. Our AI identified key trends and patterns. " +
        "For a full, in-depth analysis, including advanced cleaning, custom visualizations, and detailed reports, " +
        "please contact us to discuss our services.\n\n" +
        "Key Metrics: (Demo) Average: 42, Max: 99, Min: 1, Count: 1000.\n" +
        "Generated Chart: (Demo) A simple bar chart showing distribution of a key column."
      );
      toast.success("Demo analysis complete!");
    }, 2000); // Simulate a 2-second analysis time
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Data Analysis with AI</CardTitle>
          <CardDescription className="text-center mt-2">
            Upload your dataset and let our AI agents process, clean, analyze, and visualize your data.
            Get insightful summaries and actionable intelligence.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Demo Features:</h3>
            <ul className="list-disc list-inside text-left mx-auto max-w-md space-y-2 text-muted-foreground">
              <li>Upload CSV/JSON (limited size for demo)</li>
              <li>Basic descriptive statistics (simulated)</li>
              <li>Generate one sample chart (simulated)</li>
              <li>Short summary of findings (simulated)</li>
            </ul>
            <p className="text-md text-destructive-foreground font-medium">
              For complete analysis, advanced cleaning, custom visualizations, and in-depth reports, please inquire about our services.
            </p>
          </div>
          <div className="space-y-4 mt-6">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="dataset-upload">Upload Dataset (CSV or JSON)</Label>
              <Input
                id="dataset-upload"
                type="file"
                accept=".csv,.json"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground mt-1">Selected file: {selectedFile.name}</p>
              )}
            </div>
            <Button size="lg" onClick={handleAnalyze} disabled={!selectedFile || isLoading}>
              {isLoading ? "Analyzing..." : "Analyze Dataset (Demo)"}
            </Button>
          </div>

          {analysisResult && (
            <div className="mt-8 p-4 border rounded-md bg-muted text-left whitespace-pre-wrap">
              <h4 className="text-xl font-semibold mb-2">Demo Analysis Result:</h4>
              <p className="text-muted-foreground">{analysisResult}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataAnalysis;