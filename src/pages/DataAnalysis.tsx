"use client";

import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from "@/utils/toast";
import ChartBuilder from "@/components/ChartBuilder";
import ChartDisplay from "@/components/ChartDisplay";
import DataTablePreview from "@/components/DataTablePreview";
import AIChatInterface from "@/components/AIChatInterface";
import DataTransformation from "@/components/DataTransformation";
import LoadingSpinner from "@/components/LoadingSpinner";

const DataAnalysis = () => {
  const location = useLocation();
  const { parsedData: initialParsedData, dataHeaders: initialDataHeaders } = (location.state || {}) as {
    parsedData?: Record<string, string>[];
    dataHeaders?: string[];
  };

  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [isLoadingTransformation, setIsLoadingTransformation] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<Record<string, any>[]>(initialParsedData || []);
  const [dataHeaders, setDataHeaders] = useState<string[]>(initialDataHeaders || []);
  const [analysisReport, setAnalysisReport] = useState<string | null>(null); // New state for the full analysis report

  const [selectedChartType, setSelectedChartType] = useState<string>("");
  const [selectedXAxis, setSelectedXAxis] = useState<string>("");
  const [selectedYAxis, setSelectedYAxis] = useState<string>("");
  const [currentChart, setCurrentChart] = useState<{ type: string; xAxis: string; yAxis: string } | null>(null);

  useEffect(() => {
    if (initialParsedData && initialParsedData.length > 0) {
      showSuccess("Data loaded for analysis!");
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
        { id: 1, category: "Electronics", sales: 100, profit: 20, region: "East" },
        { id: 2, category: "Clothing", sales: 150, profit: 25, region: "West" },
        { id: 3, category: "Electronics", sales: 70, profit: 18, region: "North" },
        { id: 4, category: "Books", sales: 200, profit: 30, region: "South" },
        { id: 5, category: "Clothing", sales: 120, profit: 22, region: "East" },
        { id: 6, category: "Books", sales: 90, profit: 15, region: "West" },
        { id: 7, category: "Electronics", sales: 110, profit: 21, region: "North" },
        { id: 8, category: "Clothing", sales: 130, profit: 23, region: "South" },
      ];
      setParsedData(dummyData);
      setDataHeaders(["id", "category", "sales", "profit", "region"]);
      setSelectedChartType("BarChart");
      setSelectedXAxis("category");
      setSelectedYAxis("sales");
      setCurrentChart({ type: "BarChart", xAxis: "category", yAxis: "sales" });
    }
  }, [initialParsedData, initialDataHeaders]);

  const handlePerformAnalysis = async (analysisType: string) => {
    if (parsedData.length === 0) {
      showError("No data available for analysis. Please upload a file first.");
      return;
    }

    setIsLoadingAnalysis(true);
    setAnalysisReport(null);

    try {
      const response = await fetch('/api/data-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: parsedData, headers: dataHeaders, analysisType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error performing AI analysis:", errorData);
        showError("Failed to get AI analysis: " + (errorData.error || response.statusText));
      } else {
        const result = await response.json();
        setAnalysisReport(result.report);
        showSuccess(`AI ${analysisType} analysis complete!`);
      }
    } catch (error: any) {
      console.error("Unexpected error during AI analysis:", error);
      showError("An unexpected error occurred during analysis: " + error.message);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleBuildChart = (chartType: string, xAxis: string, yAxis: string) => {
    setCurrentChart({ type: chartType, xAxis, yAxis });
    showSuccess(`Generated ${chartType.replace("Chart", " chart")} for ${xAxis} vs ${yAxis}!`);
  };

  const handleTransformData = (column: string, transformation: string) => {
    setIsLoadingTransformation(true);
    setTimeout(() => {
      setParsedData(prevData => {
        const newData = prevData.map(row => ({ ...row })); // Deep copy to avoid direct state mutation
        
        switch (transformation) {
          case "fill_missing_mean": {
            const numericValues = newData
              .map(row => Number(row[column]))
              .filter(value => !isNaN(value));
            const mean = numericValues.length > 0
              ? numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length
              : 0;
            newData.forEach(row => {
              if (row[column] === null || row[column] === undefined || row[column] === "") {
                row[column] = mean.toFixed(2); // Fill with mean, keep 2 decimal places
              }
            });
            showSuccess(`Simulated: Filled missing values in '${column}' with mean (${mean.toFixed(2)}).`);
            break;
          }
          case "fill_missing_median": {
            const numericValues = newData
              .map(row => Number(row[column]))
              .filter(value => !isNaN(value))
              .sort((a, b) => a - b);
            let median = 0;
            if (numericValues.length > 0) {
              const mid = Math.floor(numericValues.length / 2);
              median = numericValues.length % 2 === 0
                ? (numericValues[mid - 1] + numericValues[mid]) / 2
                : numericValues[mid];
            }
            newData.forEach(row => {
              if (row[column] === null || row[column] === undefined || row[column] === "") {
                row[column] = median.toFixed(2); // Fill with median
              }
            });
            showSuccess(`Simulated: Filled missing values in '${column}' with median (${median.toFixed(2)}).`);
            break;
          }
          case "fill_missing_mode": {
            const valueCounts: { [key: string]: number } = {};
            newData.forEach(row => {
              const value = String(row[column]);
              if (value !== null && value !== undefined && value !== "") {
                valueCounts[value] = (valueCounts[value] || 0) + 1;
              }
            });
            let mode = "";
            let maxCount = 0;
            for (const value in valueCounts) {
              if (valueCounts[value] > maxCount) {
                maxCount = valueCounts[value];
                mode = value;
              }
            }
            newData.forEach(row => {
              if (row[column] === null || row[column] === undefined || row[column] === "") {
                row[column] = mode;
              }
            });
            showSuccess(`Simulated: Filled missing values in '${column}' with mode ('${mode}').`);
            break;
          }
          case "convert_to_number":
            newData.forEach(row => {
              const value = row[column];
              const numValue = Number(value);
              row[column] = !isNaN(numValue) ? numValue : null; // Convert to number, or null if not a valid number
            });
            showSuccess(`Simulated: Converted column '${column}' to numbers.`);
            break;
          case "convert_to_string":
            newData.forEach(row => {
              row[column] = String(row[column]);
            });
            showSuccess(`Simulated: Converted column '${column}' to strings.`);
            break;
          case "normalize_data": {
            const numericValues = newData
              .map(row => Number(row[column]))
              .filter(value => !isNaN(value));
            if (numericValues.length === 0) {
              showError(`Cannot normalize '${column}': No numeric values found.`);
              break;
            }
            const min = Math.min(...numericValues);
            const max = Math.max(...numericValues);
            const range = max - min;

            if (range === 0) {
              newData.forEach(row => {
                if (!isNaN(Number(row[column]))) row[column] = 0; // All values are the same, normalize to 0
              });
              showSuccess(`Simulated: Normalized column '${column}' (all values are the same).`);
            } else {
              newData.forEach(row => {
                const value = Number(row[column]);
                if (!isNaN(value)) {
                  row[column] = ((value - min) / range).toFixed(4); // Min-Max normalization
                }
              });
              showSuccess(`Simulated: Normalized column '${column}' using Min-Max scaling.`);
            }
            break;
          }
          default:
            showError("Unknown transformation selected.");
        }
        return newData;
      });
      setIsLoadingTransformation(false);
    }, 1500); // Simulate transformation time
  };

  // Generate a simple data summary for the AI chat
  const generateDataSummary = () => {
    if (parsedData.length === 0) return "No data available.";
    const numRows = parsedData.length;
    const numCols = dataHeaders.length;
    return `Your dataset contains ${numRows} rows and ${numCols} columns. Key columns include: ${dataHeaders.slice(0, 3).join(", ")}${numCols > 3 ? "..." : ""}.`;
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
                <DataTransformation
                  headers={dataHeaders}
                  onTransformData={handleTransformData}
                  isLoading={isLoadingTransformation}
                />
              </div>

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
                <h3 className="text-xl font-semibold">Complete AI Analysis Options:</h3>
                <p className="text-md text-muted-foreground font-medium">
                  Select an analysis type to generate a comprehensive AI report.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button
                    size="lg"
                    onClick={() => handlePerformAnalysis("basic")}
                    disabled={isLoadingAnalysis}
                  >
                    {isLoadingAnalysis ? <LoadingSpinner size={16} className="mr-2" /> : "Basic Analysis"}
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => handlePerformAnalysis("clustering")}
                    disabled={isLoadingAnalysis}
                  >
                    {isLoadingAnalysis ? <LoadingSpinner size={16} className="mr-2" /> : "Advanced Clustering"}
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => handlePerformAnalysis("association")}
                    disabled={isLoadingAnalysis}
                  >
                    {isLoadingAnalysis ? <LoadingSpinner size={16} className="mr-2" /> : "Association Rules"}
                  </Button>
                </div>
              </div>

              {isLoadingAnalysis && (
                <div className="flex items-center justify-center space-x-2 text-primary mt-8">
                  <LoadingSpinner size={20} />
                  <span>Generating AI analysis report...</span>
                </div>
              )}

              {analysisReport && (
                <div className="mt-8 p-4 border rounded-md bg-muted text-left whitespace-pre-wrap">
                  <h4 className="text-xl font-semibold mb-2">AI Analysis Report:</h4>
                  <p className="text-muted-foreground">{analysisReport}</p>
                </div>
              )}

              <div className="mt-8">
                <AIChatInterface dataHeaders={dataHeaders} dataSummary={generateDataSummary()} />
              </div>
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