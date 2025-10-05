"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DataAnalysis = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Data Analysis with AI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-lg text-muted-foreground">
            Upload your dataset and let our AI agents process, clean, analyze, and visualize your data.
            Get insightful summaries and actionable intelligence.
          </p>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Demo Features:</h3>
            <ul className="list-disc list-inside text-left mx-auto max-w-md space-y-2">
              <li>Upload CSV/JSON (limited size)</li>
              <li>Basic descriptive statistics</li>
              <li>Generate one sample chart</li>
              <li>Short summary of findings</li>
            </ul>
            <p className="text-md text-destructive-foreground font-medium">
              For complete analysis, advanced cleaning, custom visualizations, and in-depth reports, please inquire about our services.
            </p>
          </div>
          <Button size="lg" className="mt-6">Upload Dataset (Demo)</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataAnalysis;