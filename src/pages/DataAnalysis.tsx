"use client";

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import ChartBuilder from "@/components/ChartBuilder";
import ChartDisplay from "@/components/ChartDisplay";
import DataTablePreview from "@/components/DataTablePreview";

const DataAnalysis = () => {
  const location = useLocation();
  const { parsedData: initialParsedData, dataHeaders: initialDataHeaders } = (location.state || {}) as {
    parsedData?: Record<string, string>[];
    dataHeaders?: string[];
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Kept for demo purposes, but actual data comes from state
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<Record<string, any>[]>(initialParsedData || []);
  const [dataHeaders, setDataHeaders] = useState<string[]>(initialDataHeaders || []);

  const [selectedChartType, setSelectedChartType] = useState<string>("");
  const [selectedXAxis, setSelectedXAxis] = useState<string>("");
  const [selectedYAxis, setSelectedYAxis] = useState<string>("");
  const [currentChart, setCurrentChart] = useState<{ type: string; xAxis: string; yAxis: string } | null>(null);

  useEffect(() => {
    if (initialParsedData && initialParsedData.length > 0) {
      toast.success("Data loaded for analysis!");
      // Convert string values to numbers for charting if possible
      const numericParsedData = initialParsedData.map(row => {
        const newRow: Record<string, any> = {};
        for (const key in row) {
          const value = row[key];
          newRow[key] = !isNaN(Number(value)) && value !== "" ? Number(value) : value;
        }
        return newRow;
      });
      setParsedData(numericParsedData);
      setDataHeaders(initialDataHeaders || []);
    } else {
      // If no data is passed, provide a dummy dataset for demo purposes
      const dummyData = [
        { category: "A", value1: 10, value2: 20 },
        { category: "B", value1: 15, value2: 25 },
        { category: "C", value1: 7, value2: 18 },
        { category: "D", value1: 20, value2: 30 },
      ];
      setParsedData(dummyData);
      setDataHeaders(["category", "value1", "value2"]);
      setSelectedChartType("BarChart");
      setSelectedXAxis("category");
      setSelectedYAxis("value1");
      setCurrentChart({ type: "BarChart", xAxis: "category", yAxis: "value1" });
    }
  }, [initialParsedData, initialDataHeaders]);

  const handleAnalyze = () => {
    if (parsedData.length === 0) {
      toast.error("No data available for analysis.");
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    // Simulate API call for data analysis
    setTimeout(() => {
      setIsLoading(false);
      setAnalysisResult(
        `Demo AI Analysis for your dataset (${parsedData.length} rows):\n\n` +
        "Summary: Our AI identified key trends and patterns. For a full, in-depth analysis, " +
        "including advanced cleaning, custom visualizations, and detailed reports, " +
        "please contact us to discuss our services.\n\n" +
        "Key Metrics: (Demo) Average of Y-Axis: 42, Max: 99, Min: 1, Count: 1000.\n" +
        "Recommendations: (Demo) Consider focusing on 'category B' for higher 'value2'."
      );
      toast.success("Demo analysis complete!");
    }, 2000); // Simulate a 2-second analysis time
  };

  const handleBuildChart = (chartType: string, xAxis: string, yAxis: string) => {
    setCurrentChart({ type: chartType, xAxis, yAxis });
    toast.success(`Generated ${chartType.replace("Chart", " chart")} for ${xAxis} vs ${yAxis}!`);
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Card className="w-full max-w-5xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">AI-Powered Data Analysis</CardTitle>
          <CardDescription className="text-center mt-2">
            Upload your dataset and let our AI agents process, clean, analyze, and visualize your data.
            Get insightful summaries and actionable intelligence.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 text-center">
          {parsedData.length > 0 ? (
            <>
              <h3 className="text-xl font-semibold">Your Data Preview:</h3>
              <DataTablePreview data={parsedData} headers={dataHeaders} />

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Interactive Chart Builder:</h3>
                <ChartBuilder
                  headers={dataHeaders}
                  onBuildChart={handleBuildChart}
                  selectedChartType={selectedChartType}
                  setSelectedChartType={setSelectedChartType}
                  selectedXAxis={selectedXAxis}
                  setSelectedXAxis={setSelectedXAxis}
                  selectedYAxis={selectedYAxis}
                  setSelectedYAxis={setSelectedYAxis}
                />
                {currentChart && (
                  <div className="mt-6">
                    <h4 className="text-lg font-medium mb-2">Generated Chart:</h4>
                    <ChartDisplay
                      chartType={currentChart.type}
                      data={parsedData}
                      xAxisKey={currentChart.xAxis}
                      yAxisKey={currentChart.yAxis}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4 mt-8">
                <h3 className="text-xl font-semibold">AI Analysis:</h3>
                <p className="text-md text-destructive-foreground font-medium">
                  For complete analysis, advanced cleaning, custom visualizations, and in-depth reports, please inquire about our services.
                </p>
                <Button size="lg" onClick={handleAnalyze} disabled={isLoading}>
                  {isLoading ? "Analyzing..." : "Run AI Analysis (Demo)"}
                </Button>
              </div>

              {analysisResult && (
                <div className="mt-8 p-4 border rounded-md bg-muted text-left whitespace-pre-wrap">
                  <h4 className="text-xl font-semibold mb-2">Demo AI Analysis Result:</h4>
                  <p className="text-muted-foreground">{analysisResult}</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-lg text-muted-foreground">
                No data uploaded yet. Please go to the <Link to="/upload-data" className="text-primary underline">Upload Data</Link> page to begin.
              </p>
              <Button size="lg" onClick={() => window.location.href = "/upload-data"}>
                Upload Data
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataAnalysis;