"use client";

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from "@/utils/toast";
import ChartBuilder from "@/components/ChartBuilder";
import ChartDisplay from "@/components/ChartDisplay";
import DataTablePreview from "@/components/DataTablePreview";
import AIChatInterface from "@/components/AIChatInterface";
import DataTransformation from "@/components/DataTransformation";
import LoadingSpinner from "@/components/LoadingSpinner";
import FileUploadZone from "@/components/FileUploadZone";
import SectionWrapper from "@/components/SectionWrapper";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { analysisTemplates, AnalysisTemplate } from "@/data/templates";
import { cn } from "@/lib/utils";

 type DataValue = string | number | null | undefined;

type DataRow = Record<string, DataValue>;

const dataDrivenTemplates = analysisTemplates.filter((template) => template.requiresFile);

const normalizeRows = (rows: Record<string, unknown>[]): DataRow[] =>
  rows.map((row) => {
    const newRow: DataRow = {};
    Object.entries(row).forEach(([key, value]) => {
      if (typeof value === "number") {
        newRow[key] = value;
        return;
      }

      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed === "") {
          newRow[key] = "";
          return;
        }

        const numericValue = Number(trimmed);
        newRow[key] = Number.isNaN(numericValue) ? trimmed : numericValue;
        return;
      }

      newRow[key] = (value ?? null) as DataValue;
    });
    return newRow;
  });

const DataAnalysis = () => {
  const location = useLocation();
  const {
    parsedData: initialParsedData,
    dataHeaders: initialDataHeaders,
    analysisType: initialAnalysisType,
  } = (location.state || {}) as {
    parsedData?: Record<string, unknown>[];
    dataHeaders?: string[];
    analysisType?: string;
  };

  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [isLoadingTransformation, setIsLoadingTransformation] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<DataRow[]>([]);
  const [dataHeaders, setDataHeaders] = useState<string[]>([]);
  const [analysisReport, setAnalysisReport] = useState<string | null>(null);

  const [selectedChartType, setSelectedChartType] = useState<string>("");
  const [selectedXAxis, setSelectedXAxis] = useState<string>("");
  const [selectedYAxis, setSelectedYAxis] = useState<string>("");
  const [currentChart, setCurrentChart] = useState<{ type: string; xAxis: string; yAxis: string } | null>(null);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialAnalysisType ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsingFile, setIsParsingFile] = useState<boolean>(false);

  const resetVisualState = () => {
    setAnalysisReport(null);
    setCurrentChart(null);
    setSelectedChartType("");
    setSelectedXAxis("");
    setSelectedYAxis("");
  };

  useEffect(() => {
    const dataToUse = initialParsedData;
    const headersToUse = initialDataHeaders;

    if (initialAnalysisType) {
      setSelectedTemplateId(initialAnalysisType);
    }

    if (dataToUse && dataToUse.length > 0) {
      const normalized = normalizeRows(dataToUse);
      const headers = headersToUse && headersToUse.length > 0
        ? headersToUse
        : Object.keys(normalized[0] || {});
      setParsedData(normalized);
      setDataHeaders(headers);
      resetVisualState();
      showSuccess("Data loaded for analysis!");

      if (initialAnalysisType) {
        handlePerformAnalysis(initialAnalysisType, normalized, headers);
      }
    } else if (initialAnalysisType) {
      showError("Please upload data to perform this analysis.");
    } else {
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
      const normalizedDummyData = normalizeRows(dummyData as Record<string, unknown>[]);
      const dummyHeaders = ["id", "category", "sales", "profit", "region"];
      setParsedData(normalizedDummyData);
      setDataHeaders(dummyHeaders);
      setSelectedChartType("BarChart");
      setSelectedXAxis("category");
      setSelectedYAxis("sales");
      setCurrentChart({ type: "BarChart", xAxis: "category", yAxis: "sales" });
      showSuccess("Loaded demo data for analysis.");
    }
  }, [initialParsedData, initialDataHeaders, initialAnalysisType]);

  const handleTemplateSelect = (template: AnalysisTemplate) => {
    setSelectedTemplateId(template.analysisType);
    setAnalysisReport(null);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setParsedData([]);
    setDataHeaders([]);
    resetVisualState();
    parseFile(file);
  };

  const parseFile = (file: File) => {
    setIsParsingFile(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = event.target?.result;
      if (!data) {
        showError("Failed to read file.");
        setIsParsingFile(false);
        return;
      }

      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (fileExtension === "csv") {
        Papa.parse(data as string, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              console.error("CSV parsing errors:", results.errors);
              showError("Error parsing CSV file. Check console for details.");
            }
            const rows = (results.data as Record<string, unknown>[]) || [];
            const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
            setParsedData(normalizeRows(rows));
            setDataHeaders(headers);
            showSuccess("CSV file parsed successfully!");
            setIsParsingFile(false);
          },
          error: (error: Error) => {
            showError(`Error parsing CSV: ${error.message}`);
            setIsParsingFile(false);
          },
        });
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        try {
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (json.length === 0) {
            showError("Excel file is empty or could not be parsed.");
            setIsParsingFile(false);
            return;
          }

          const headers = json[0] as string[];
          const rows = json.slice(1) as unknown[][];

          const parsedRows = rows.map((row) => {
            const rowObject: Record<string, unknown> = {};
            headers.forEach((header, index) => {
              rowObject[header] = row[index] ?? "";
            });
            return rowObject;
          });

          setParsedData(normalizeRows(parsedRows));
          setDataHeaders(headers);
          showSuccess("Excel file parsed successfully!");
          setIsParsingFile(false);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Unexpected error while parsing Excel file.";
          showError(`Error parsing Excel file: ${message}`);
          setIsParsingFile(false);
        }
      } else {
        showError("Unsupported file type. Please upload a CSV or Excel file.");
        setIsParsingFile(false);
      }
    };

    reader.onerror = () => {
      showError("Failed to read file.");
      setIsParsingFile(false);
    };

    if (file.type === "text/csv" || file.name.endsWith(".csv")) {
      reader.readAsText(file);
    } else if (file.type.includes("excel") || file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      reader.readAsBinaryString(file);
    } else {
      showError("Unsupported file type. Please upload a CSV or Excel file.");
      setIsParsingFile(false);
    }
  };

  const handlePerformAnalysis = async (analysisType: string, currentData: DataRow[], currentHeaders: string[]) => {
    if (currentData.length === 0) {
      showError("No data available for analysis. Please upload a file first.");
      return;
    }

    setIsLoadingAnalysis(true);
    setAnalysisReport(null);

    try {
      const response = await fetch("/api/data-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: currentData, headers: currentHeaders, analysisType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error performing AI analysis:", errorData);
        showError("Failed to get AI analysis: " + (errorData.error || response.statusText));
      } else {
        const result = await response.json();
        setAnalysisReport(result.report);
        showSuccess(`AI ${analysisType.replace(/_/g, " ")} analysis complete!`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";
      console.error("Unexpected error during analysis:", error);
      showError("An unexpected error occurred during analysis: " + message);
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
      setParsedData((prevData) => {
        const newData = prevData.map<DataRow>((row) => ({ ...row }));

        switch (transformation) {
          case "fill_missing_mean": {
            const numericValues = newData
              .map((row) => Number(row[column]))
              .filter((value) => !Number.isNaN(value));
            const mean = numericValues.length > 0
              ? numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length
              : 0;
            newData.forEach((row) => {
              if (row[column] === null || row[column] === undefined || row[column] === "") {
                row[column] = mean.toFixed(2);
              }
            });
            showSuccess(`Simulated: Filled missing values in '${column}' with mean (${mean.toFixed(2)}).`);
            break;
          }
          case "fill_missing_median": {
            const numericValues = newData
              .map((row) => Number(row[column]))
              .filter((value) => !Number.isNaN(value))
              .sort((a, b) => a - b);
            let median = 0;
            if (numericValues.length > 0) {
              const mid = Math.floor(numericValues.length / 2);
              median = numericValues.length % 2 === 0
                ? (numericValues[mid - 1] + numericValues[mid]) / 2
                : numericValues[mid];
            }
            newData.forEach((row) => {
              if (row[column] === null || row[column] === undefined || row[column] === "") {
                row[column] = median.toFixed(2);
              }
            });
            showSuccess(`Simulated: Filled missing values in '${column}' with median (${median.toFixed(2)}).`);
            break;
          }
          case "fill_missing_mode": {
            const valueCounts: { [key: string]: number } = {};
            newData.forEach((row) => {
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
            newData.forEach((row) => {
              if (row[column] === null || row[column] === undefined || row[column] === "") {
                row[column] = mode;
              }
            });
            showSuccess(`Simulated: Filled missing values in '${column}' with mode ('${mode}').`);
            break;
          }
          case "convert_to_number":
            newData.forEach((row) => {
              const value = row[column];
              const numValue = Number(value);
              row[column] = !Number.isNaN(numValue) ? numValue : null;
            });
            showSuccess(`Simulated: Converted column '${column}' to numbers.`);
            break;
          case "convert_to_string":
            newData.forEach((row) => {
              row[column] = String(row[column]);
            });
            showSuccess(`Simulated: Converted column '${column}' to strings.`);
            break;
          case "normalize_data": {
            const numericValues = newData
              .map((row) => Number(row[column]))
              .filter((value) => !Number.isNaN(value));
            if (numericValues.length === 0) {
              showError(`Cannot normalize '${column}': No numeric values found.`);
              break;
            }
            const min = Math.min(...numericValues);
            const max = Math.max(...numericValues);
            const range = max - min;

            if (range === 0) {
              newData.forEach((row) => {
                if (!Number.isNaN(Number(row[column]))) row[column] = 0;
              });
              showSuccess(`Simulated: Normalized column '${column}' (all values are the same).`);
            } else {
              newData.forEach((row) => {
                const value = Number(row[column]);
                if (!Number.isNaN(value)) {
                  row[column] = ((value - min) / range).toFixed(4);
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
    }, 1500);
  };

  const generateDataSummary = () => {
    if (parsedData.length === 0) return "No data available.";
    const numRows = parsedData.length;
    const numCols = dataHeaders.length;
    return `Your dataset contains ${numRows} rows and ${numCols} columns. Key columns include: ${dataHeaders
      .slice(0, 3)
      .join(", ")}${numCols > 3 ? "..." : ""}.`;
  };

  const selectedTemplate = dataDrivenTemplates.find(
    (template) => template.analysisType === selectedTemplateId,
  );

  const handleRunAnalysisClick = () => {
    if (!selectedTemplate) {
      showError("Select an analysis template to continue.");
      return;
    }

    handlePerformAnalysis(selectedTemplate.analysisType, parsedData, dataHeaders);
  };

  return (
    <SectionWrapper className="space-y-10 py-10">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Pick a Template</CardTitle>
            <CardDescription>
              Choose an AI workflow to guide your analysis. Templates that require a dataset can be run directly below.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {dataDrivenTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleTemplateSelect(template)}
                className={cn(
                  "rounded-lg border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-primary/50",
                  selectedTemplateId === template.analysisType
                    ? "border-primary bg-primary/10"
                    : "hover:border-primary/60",
                )}
              >
                <div className="flex items-center gap-3">
                  <template.icon className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                      {template.category}
                    </p>
                    <h3 className="text-lg font-semibold text-foreground">{template.title}</h3>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{template.description}</p>
                <p className="mt-3 text-xs font-medium text-muted-foreground">
                  {template.steps} step{template.steps !== 1 ? "s" : ""} of guided insight
                </p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Upload Your Dataset</CardTitle>
            <CardDescription>
              Drop a CSV or Excel file, preview the data, and run it through the selected template.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileUploadZone onFileSelect={handleFileSelect} acceptedFileTypes=".csv,.xlsx,.xls" />
            {isParsingFile && (
              <div className="flex items-center justify-center gap-2 text-primary">
                <LoadingSpinner size={18} />
                <span>Parsing file...</span>
              </div>
            )}
            {selectedFile && !isParsingFile && (
              <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                Loaded <span className="font-medium text-foreground">{selectedFile.name}</span>
                {parsedData.length > 0 ? ` • ${parsedData.length} rows detected` : ""}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Data Preview & Preparation</CardTitle>
            <CardDescription>
              Inspect your dataset and simulate quick cleaning steps before you run AI-generated insights.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {parsedData.length > 0 ? (
              <>
                <DataTablePreview data={parsedData} headers={dataHeaders} />
                <DataTransformation
                  headers={dataHeaders}
                  onTransformData={handleTransformData}
                  isLoading={isLoadingTransformation}
                />
              </>
            ) : (
              <div className="rounded-md border border-dashed p-6 text-center text-muted-foreground">
                Upload a dataset to unlock the preview and transformation tools.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Visual Exploration</CardTitle>
            <CardDescription>
              Build charts to understand key relationships in your data before requesting the AI summary.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {parsedData.length > 0 ? (
              <>
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
                  <div className="mt-4">
                    <h4 className="text-base font-semibold mb-2">Generated Chart</h4>
                    <ChartDisplay
                      chartType={currentChart.type}
                      data={parsedData}
                      xAxisKey={currentChart.xAxis}
                      yAxisKey={currentChart.yAxis}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-md border border-dashed p-6 text-center text-muted-foreground">
                Charts will appear once you upload data.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">AI Analysis Report</CardTitle>
            <CardDescription>
              Run the selected template to generate a natural-language summary, risk flags, and opportunities.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedTemplate
                  ? `Ready to run the ${selectedTemplate.title} template.`
                  : "Choose a template to enable AI analysis."}
              </div>
              <Button
                onClick={handleRunAnalysisClick}
                disabled={
                  !selectedTemplate ||
                  parsedData.length === 0 ||
                  isLoadingAnalysis ||
                  isParsingFile
                }
              >
                {isLoadingAnalysis ? "Generating..." : selectedTemplate ? `Run ${selectedTemplate.title}` : "Run Analysis"}
              </Button>
            </div>

            {isLoadingAnalysis && (
              <div className="flex items-center justify-center gap-2 text-primary">
                <LoadingSpinner size={18} />
                <span>Generating AI analysis report...</span>
              </div>
            )}

            {analysisReport && (
              <div className="rounded-md border bg-muted p-4 text-left text-sm text-muted-foreground whitespace-pre-wrap">
                <h4 className="text-base font-semibold text-foreground mb-2">AI Findings</h4>
                {analysisReport}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Chat with Your Data</CardTitle>
            <CardDescription>
              Ask follow-up questions or request tailored summaries based on the current dataset.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {parsedData.length > 0 ? (
              <AIChatInterface dataHeaders={dataHeaders} dataSummary={generateDataSummary()} />
            ) : (
              <div className="rounded-md border border-dashed p-6 text-center text-muted-foreground">
                Once a dataset is loaded, you can chat with the AI about specific insights.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SectionWrapper>
  );
};

export default DataAnalysis;
