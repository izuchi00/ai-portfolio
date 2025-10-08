
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
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
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Rocket,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";

type DataValue = string | number | null | undefined;

type DataRow = Record<string, DataValue>;

const DEMO_ROW_LIMIT = 200;
const CHART_DEMO_LIMIT = 1;
const CHAT_DEMO_LIMIT = 3;

const curatedDemoRaw: Record<string, unknown>[] = [
  {
    segment: "Retail Media",
    objective: "Revenue Quality",
    records: 1248,
    conversion_rate: 0.042,
    churn_risk: "Low",
    revenue_delta: 18.4,
    region: "North America",
  },
  {
    segment: "FinTech Enterprise",
    objective: "Fraud Monitoring",
    records: 986,
    conversion_rate: 0.035,
    churn_risk: "Medium",
    revenue_delta: 12.7,
    region: "Europe",
  },
  {
    segment: "Healthcare",
    objective: "Capacity Forecast",
    records: 1543,
    conversion_rate: 0.051,
    churn_risk: "Low",
    revenue_delta: 23.1,
    region: "North America",
  },
  {
    segment: "E-Commerce",
    objective: "Retention",
    records: 2134,
    conversion_rate: 0.048,
    churn_risk: "High",
    revenue_delta: -6.8,
    region: "Asia-Pacific",
  },
  {
    segment: "Logistics",
    objective: "Route Optimisation",
    records: 874,
    conversion_rate: 0.029,
    churn_risk: "Medium",
    revenue_delta: 9.4,
    region: "Latin America",
  },
  {
    segment: "SaaS Scale-up",
    objective: "Usage Intelligence",
    records: 1342,
    conversion_rate: 0.057,
    churn_risk: "Low",
    revenue_delta: 27.6,
    region: "Global",
  },
];

const curatedDemoHeaders = Object.keys(curatedDemoRaw[0] ?? {});

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
  const [chartBuilds, setChartBuilds] = useState<number>(0);

  const previewData = useMemo(() => parsedData.slice(0, DEMO_ROW_LIMIT), [parsedData]);
  const isPreviewLimited = parsedData.length > DEMO_ROW_LIMIT;
  const isChartLimitReached = chartBuilds >= CHART_DEMO_LIMIT;

  const resetVisualState = () => {
    setAnalysisReport(null);
    setCurrentChart(null);
    setSelectedChartType("");
    setSelectedXAxis("");
    setSelectedYAxis("");
    setChartBuilds(0);
  };

  useEffect(() => {
    if (initialAnalysisType) {
      setSelectedTemplateId(initialAnalysisType);
    }

    if (initialParsedData && initialParsedData.length > 0) {
      const normalized = normalizeRows(initialParsedData);
      const headers = initialDataHeaders && initialDataHeaders.length > 0
        ? initialDataHeaders
        : Object.keys(normalized[0] || {});
      setParsedData(normalized);
      setDataHeaders(headers);
      resetVisualState();
      showSuccess("Imported data ready for analysis.");
    } else {
      const normalizedDemo = normalizeRows(curatedDemoRaw);
      setParsedData(normalizedDemo);
      setDataHeaders(curatedDemoHeaders);
      setSelectedChartType("BarChart");
      setSelectedXAxis("segment");
      setSelectedYAxis("conversion_rate");
      setCurrentChart({ type: "BarChart", xAxis: "segment", yAxis: "conversion_rate" });
      setChartBuilds(0);
      showSuccess("Loaded the curated demo dataset. Upload your own file to replace it.");
    }
  }, [initialParsedData, initialDataHeaders, initialAnalysisType]);

  const dataDrivenTemplates = useMemo(
    () => analysisTemplates.filter((template) => template.requiresFile),
    [],
  );

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

  const loadDemoDataset = () => {
    const normalized = normalizeRows(curatedDemoRaw);
    setParsedData(normalized);
    setDataHeaders(curatedDemoHeaders);
    setSelectedFile(null);
    setSelectedChartType("BarChart");
    setSelectedXAxis("segment");
    setSelectedYAxis("conversion_rate");
    setCurrentChart({ type: "BarChart", xAxis: "segment", yAxis: "conversion_rate" });
    setChartBuilds(0);
    showSuccess("Demo dataset reloaded. Try the agents on your own data next!");
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
        body: JSON.stringify({
          data: currentData.slice(0, DEMO_ROW_LIMIT),
          headers: currentHeaders,
          analysisType,
        }),
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
    if (isChartLimitReached) {
      showError("Demo limit reached. Request the full intelligence engagement for unlimited visualizations.");
      return;
    }

    setCurrentChart({ type: chartType, xAxis, yAxis });
    setChartBuilds((prev) => prev + 1);
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
    if (previewData.length === 0) return "No data available.";
    const numRows = parsedData.length;
    const previewRows = previewData.length;
    const numCols = dataHeaders.length;
    return `Your dataset currently shows ${previewRows} of ${numRows} rows across ${numCols} columns. Highlighted fields: ${dataHeaders
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

    handlePerformAnalysis(selectedTemplate.analysisType, previewData, dataHeaders);
  };

  const analysisPreview = useMemo(() => {
    if (!analysisReport) return null;
    if (analysisReport.length <= 1000) return analysisReport;
    return `${analysisReport.slice(0, 1000)}…`;
  }, [analysisReport]);

  const steps = [
    {
      id: 1,
      title: "Select an AI mission",
      description: "Choose the agent-led workflow that best matches your business question.",
      complete: Boolean(selectedTemplateId),
    },
    {
      id: 2,
      title: "Upload or explore data",
      description: `Work with CSV or Excel files. Demo previews are capped at ${DEMO_ROW_LIMIT} rows for speed.`,
      complete: parsedData.length > 0,
    },
    {
      id: 3,
      title: "Review guided insights",
      description: "Preview visualisations, AI summaries, and conversational analysis.",
      complete: Boolean(analysisReport),
    },
  ];

  return (
    <SectionWrapper className="space-y-12 py-12">
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary via-primary/80 to-primary/60 text-primary-foreground">
          <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="relative space-y-6 p-8 sm:p-10">
            <Badge variant="secondary" className="bg-white/20 text-white">Demo Workspace</Badge>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold sm:text-4xl">
                Agentic Data Intelligence Studio
              </h1>
              <p className="max-w-2xl text-base sm:text-lg">
                As a computer science graduate obsessed with meaningful insights, I built this agentic workspace to clean, analyse,
                and narrate complex datasets for teams who crave clarity. Upload your data, pick a mission, and watch the AI agents
                choreograph the story.
              </p>
            </div>
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="font-semibold">Curated AI Playbooks</p>
                  <p className="text-sm opacity-80">Template-driven flows for cleaning, exploration, and executive briefs.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="font-semibold">Demo Safeguards</p>
                  <p className="text-sm opacity-80">Limited previews keep proprietary pipelines secure until engagement.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BarChart3 className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="font-semibold">Visual Proof</p>
                  <p className="text-sm opacity-80">Generate a chart and summary before investing in the full build.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Rocket className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="font-semibold">End-to-End Agents</p>
                  <p className="text-sm opacity-80">Cleaning, reasoning, storytelling, and Q&A in a single guided loop.</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-white text-primary hover:bg-white/90">
                <Link to="/contact">
                  Request Full Intelligence
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                <Link to="/templates">Explore Missions</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border bg-card/80 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">How the demo flows</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Follow the three steps to showcase the capabilities. Each stage mirrors the production engagement while staying
            privacy-conscious.
          </p>
          <Separator className="my-4" />
          <div className="space-y-5">
            {steps.map((step) => (
              <div key={step.id} className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2",
                    step.complete
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted text-muted-foreground",
                  )}
                >
                  {step.complete ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <div>
                  <p className="font-semibold">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <Alert className="mt-6 border-primary/40 bg-primary/5">
            <AlertTitle className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Demo Guardrails
            </AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
              The sandbox limits previews to {DEMO_ROW_LIMIT} rows, one chart, and {CHAT_DEMO_LIMIT} chat prompts. Engage my services
              to deploy unrestricted, production-grade pipelines tailored to your organisation.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-3xl border shadow-sm">
          <CardHeader className="space-y-1">
            <Badge variant="outline" className="w-fit uppercase tracking-wide">Step 1</Badge>
            <CardTitle className="text-2xl font-semibold">Choose Your AI Mission</CardTitle>
            <CardDescription>
              Select the agent playbook that best aligns with the outcome you want to demo. Each template orchestrates cleaning,
              exploration, and storytelling in minutes.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {dataDrivenTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleTemplateSelect(template)}
                className={cn(
                  "group flex h-full flex-col justify-between rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-primary/50",
                  selectedTemplateId === template.analysisType
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "hover:border-primary/60",
                )}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <template.icon className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">{template.category}</p>
                      <h3 className="text-lg font-semibold text-foreground">{template.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{template.steps} guided step{template.steps !== 1 ? "s" : ""}</span>
                  <span className="font-medium text-primary group-hover:translate-x-1 transition-transform">Try demo →</span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border shadow-sm">
          <CardHeader className="space-y-1">
            <Badge variant="outline" className="w-fit uppercase tracking-wide">Step 2</Badge>
            <CardTitle className="text-2xl font-semibold">Upload or Reuse Data</CardTitle>
            <CardDescription>
              Swap in your CSV or Excel dataset. The demo processes the first {DEMO_ROW_LIMIT} rows so you can validate the
              workflow before commissioning the full build.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileUploadZone onFileSelect={handleFileSelect} acceptedFileTypes=".csv,.xlsx,.xls" />
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>Tip: Ensure headers are on the first row for best results.</span>
              <Button size="sm" variant="outline" onClick={loadDemoDataset}>
                Reload curated demo
              </Button>
            </div>
            {isParsingFile && (
              <div className="flex items-center justify-center gap-2 text-primary">
                <LoadingSpinner size={18} />
                <span>Parsing file...</span>
              </div>
            )}
            {selectedFile && !isParsingFile && (
              <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
                Loaded <span className="font-medium text-foreground">{selectedFile.name}</span>
                {parsedData.length > 0 ? ` • ${parsedData.length} rows detected` : ""}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-3xl border shadow-sm">
          <CardHeader className="space-y-1">
            <Badge variant="outline" className="w-fit uppercase tracking-wide">Step 3</Badge>
            <CardTitle className="text-2xl font-semibold">Data Preparation & Preview</CardTitle>
            <CardDescription>
              Inspect the sample, apply quick clean-up transforms, and confirm the fields powering your AI mission.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {previewData.length > 0 ? (
              <>
                <div className="rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
                  Showing {previewData.length} rows{isPreviewLimited ? ` of ${parsedData.length}` : ""}. Demo previews truncate to
                  safeguard sensitive information.
                </div>
                <DataTablePreview data={previewData} headers={dataHeaders} />
                <DataTransformation
                  headers={dataHeaders}
                  onTransformData={handleTransformData}
                  isLoading={isLoadingTransformation}
                />
              </>
            ) : (
              <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
                Upload a dataset to unlock the preview and transformation tools.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-3xl border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold">Visual Exploration</CardTitle>
              <CardDescription>
                Generate one chart in the demo to showcase how the agents contextualise your metrics.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {previewData.length > 0 ? (
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
                    isDemoLocked={isChartLimitReached}
                    lockMessage="Unlimited dashboards are available in the full engagement."
                  />
                  {currentChart && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-base font-semibold">Generated Chart</h4>
                      <ChartDisplay
                        chartType={currentChart.type}
                        data={previewData}
                        xAxisKey={currentChart.xAxis}
                        yAxisKey={currentChart.yAxis}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
                  Charts will appear once you upload data.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold">AI Analysis Snapshot</CardTitle>
              <CardDescription>
                Run the selected mission to produce a demo narrative. Unlock the complete briefing with a partnership package.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  {selectedTemplate
                    ? `Ready to run the ${selectedTemplate.title} mission.`
                    : "Choose a mission to enable AI analysis."}
                </div>
                <Button
                  onClick={handleRunAnalysisClick}
                  disabled={
                    !selectedTemplate ||
                    previewData.length === 0 ||
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

              {analysisPreview && (
                <div className="space-y-4">
                  <div className="rounded-xl border bg-muted p-4 text-left text-sm text-muted-foreground whitespace-pre-wrap">
                    <h4 className="text-base font-semibold text-foreground mb-2">AI Findings (Demo)</h4>
                    {analysisPreview}
                    {analysisReport && analysisReport.length > analysisPreview.length && (
                      <p className="mt-3 text-xs font-medium text-muted-foreground">
                        Full insights, scenario modelling, and executive-ready decks are reserved for client engagements.
                      </p>
                    )}
                  </div>
                  <Alert variant="default" className="border-primary/50">
                    <AlertTitle className="text-sm font-semibold">Need deeper insights?</AlertTitle>
                    <AlertDescription className="text-xs text-muted-foreground">
                      Book a strategy call to unlock full-length reports, automated slide creation, and integrations with your data
                      stack.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>

          <AIChatInterface
            dataHeaders={dataHeaders}
            dataSummary={generateDataSummary()}
            maxQuestions={CHAT_DEMO_LIMIT}
            lockedMessage="Demo chat limit reached. Let's collaborate to deploy an on-demand insights agent for your team."
          />
        </div>
      </div>
    </SectionWrapper>
  );
};

export default DataAnalysis;
