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
  const { parsedData: initialParsedData, dataHeaders: initialDataHeaders, analysisType: initialAnalysisType } = (location.state || {}) as {
    parsedData?: Record<string, string>[];
    dataHeaders?: string[];
    analysisType?: string; // New: analysisType from Templates page
  };

  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [isLoadingTransformation, setIsLoadingTransformation] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<Record<string, any>[]>([]);
  const [dataHeaders, setDataHeaders] = useState<string[]>([]);
  const [analysisReport, setAnalysisReport] = useState<string | { summary_stats?: object; report_text?: string; plot_base64?: string; cluster_profile?: object; correlation_matrix?: object; anomaly_detection_summary?: object; association_rules?: object; } | null>(null);

  const [selectedChartType, setSelectedChartType] = useState<string>("");
  const [selectedXAxis, setSelectedXAxis] = useState<string>("");
  const [selectedYAxis, setSelectedYAxis] = useState<string>("");
  const [currentChart, setCurrentChart] = useState<{ type: string; xAxis: string; yAxis: string } | null>(null);

  // Effect to load data and potentially trigger analysis
  useEffect(() => {
    let dataToUse = initialParsedData;
    let headersToUse = initialDataHeaders;

    if (dataToUse && dataToUse.length > 0) {
      // Convert string values to numbers for charting if possible
      const numericParsedData = dataToUse.map(row => {
        const newRow: Record<string, any> = {};
        for (const key in row) {
          const value = row[key];
          newRow[key] = !isNaN(Number(value)) && value !== "" ? Number(value) : value;
        }
        return newRow;
      });
      setParsedData(numericParsedData);
      setDataHeaders(headersToUse || []);
      showSuccess("Data loaded for analysis!");

      // Automatically trigger analysis if an analysisType is provided from Templates page
      if (initialAnalysisType) {
        handlePerformAnalysis(initialAnalysisType, numericParsedData, headersToUse || []);
      }
    } else if (initialAnalysisType) {
      // If an analysis type was requested but no data was provided, prompt user to upload
      showError("Please upload data to perform this analysis.");
      // Optionally, navigate to upload page or show a specific message in UI
      // For now, we'll just show the "No data uploaded yet" message below.
    } else {
      // If no data and no specific analysis type, load dummy data for demo
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
      const dummyHeaders = ["id", "category", "sales", "profit", "region"];
      const numericDummyData = dummyData.map(row => {
        const newRow: Record<string, any> = {};
        for (const key in row) {
          const value = row[key];
          newRow[key] = !isNaN(Number(value)) && value !== "" ? Number(value) : value;
        }
        return newRow;
      });
      setParsedData(numericDummyData);
      setDataHeaders(dummyHeaders);
      setSelectedChartType("BarChart");
      setSelectedXAxis("category");
      setSelectedYAxis("sales");
      setCurrentChart({ type: "BarChart", xAxis: "category", yAxis: "sales" });
      showSuccess("Loaded demo data for analysis.");
    }
  }, [initialParsedData, initialDataHeaders, initialAnalysisType]);


  const handlePerformAnalysis = async (analysisType: string, currentData: Record<string, any>[], currentHeaders: string[]) => {
    if (currentData.length === 0) {
      showError("No data available for analysis. Please upload a file first.");
      return;
    }

    setIsLoadingAnalysis(true);
    setAnalysisReport(null); // Clear previous report

    const pythonAnalysisTypes = [
      "data_preparation", "exploratory_analysis", "data_visualization",
      "correlation_analysis", "anomaly_detection", "clustering", "association"
    ];

    try {
      if (pythonAnalysisTypes.includes(analysisType)) {
        // Call Python backend for actual data analysis
        const response = await fetch('/api/python-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: currentData, headers: currentHeaders, analysisType }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error performing Python analysis:", errorData);
          showError("Failed to get Python analysis: " + (errorData.error || response.statusText));
        } else {
          const result = await response.json();
          setAnalysisReport(result); // Python backend returns an object
          showSuccess(`Python-powered ${analysisType.replace(/_/g, ' ')} analysis complete!`);
        }
      } else {
        // Call LLM backend for descriptive/interpretive analysis
        const response = await fetch('/api/data-analysis', { // This is the LLM endpoint
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: currentData, headers: currentHeaders, analysisType }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error performing AI analysis:", errorData);
          showError("Failed to get AI analysis: " + (errorData.error || response.statusText));
        } else {
          const result = await response.json();
          setAnalysisReport(result.report); // LLM backend returns a string in 'report' field
          showSuccess(`AI ${analysisType.replace(/_/g, ' ')} analysis complete!`);
        }
      }
    } catch (error: any) {
      console.error("Unexpected error during analysis:", error);
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

              {isLoadingAnalysis && (
                <div className="flex items-center justify-center space-x-2 text-primary mt-8">
                  <LoadingSpinner size={20} />
                  <span>Generating AI analysis report...</span>
                </div>
              )}

              {analysisReport && (
                <div className="mt-8 p-4 border rounded-md bg-muted text-left whitespace-pre-wrap">
                  <h4 className="text-xl font-semibold mb-2">AI Analysis Report:</h4>
                  {typeof analysisReport === 'string' ? (
                    <p className="text-muted-foreground">{analysisReport}</p>
                  ) : (
                    <div>
                      {analysisReport.report_text && (
                        <p className="text-muted-foreground mb-4">{analysisReport.report_text}</p>
                      )}
                      {analysisReport.summary_stats && (
                        <>
                          <h5 className="text-lg font-medium mb-1">Descriptive Statistics:</h5>
                          <pre className="bg-background p-2 rounded-md text-sm overflow-x-auto">
                            {JSON.stringify(analysisReport.summary_stats, null, 2)}
                          </pre>
                        </>
                      )}
                      {analysisReport.correlation_matrix && (
                        <>
                          <h5 className="text-lg font-medium mb-1 mt-4">Correlation Matrix:</h5>
                          <pre className="bg-background p-2 rounded-md text-sm overflow-x-auto">
                            {JSON.stringify(analysisReport.correlation_matrix, null, 2)}
                          </pre>
                        </>
                      )}
                      {analysisReport.cluster_profile && (
                        <>
                          <h5 className="text-lg font-medium mb-1 mt-4">Cluster Profile:</h5>
                          <pre className="bg-background p-2 rounded-md text-sm overflow-x-auto">
                            {JSON.stringify(analysisReport.cluster_profile, null, 2)}
                          </pre>
                        </>
                      )}
                      {analysisReport.anomaly_detection_summary && (
                        <>
                          <h5 className="text-lg font-medium mb-1 mt-4">Anomaly Detection Summary:</h5>
                          <pre className="bg-background p-2 rounded-md text-sm overflow-x-auto">
                            {JSON.stringify(analysisReport.anomaly_detection_summary, null, 2)}
                          </pre>
                        </>
                      )}
                      {analysisReport.plot_base64 && (
                        <>
                          <h5 className="text-lg font-medium mb-1 mt-4">Generated Plot:</h5>
                          <img src={`data:image/png;base64,${analysisReport.plot_base64}`} alt="Analysis Plot" className="max-w-full h-auto mx-auto" />
                        </>
                      )}
                    </div>
                  )}
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