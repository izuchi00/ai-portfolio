"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUploadZone from "@/components/FileUploadZone";
import DataTablePreview from "@/components/DataTablePreview";
import ChartBuilder from "@/components/ChartBuilder";
import ChartDisplay from "@/components/ChartDisplay";
import AIChatInterface from "@/components/AIChatInterface";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  analysisStages,
  analysisTasks,
  AnalysisStageId,
} from "@/data/analysisStages";
import { runPortfolioAnalysis, PortfolioAnalysisResponse } from "@/lib/hf-client";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Download,
  FileSpreadsheet,
  Layers,
  Link2,
  Share2,
  Sparkles,
} from "lucide-react";

const DEMO_ANALYSIS_LIMIT = 1;
const DEMO_PREVIEW_ROWS = 500;

const curatedSampleRows: Record<string, unknown>[] = [
  {
    segment: "Recruitment",
    records: 982,
    conversion_rate: 0.34,
    churn_risk: 0.07,
    avg_deal_cycle_days: 42,
    pipeline_value: 1.2,
    satisfaction: 78,
  },
  {
    segment: "Customer Success",
    records: 764,
    conversion_rate: 0.28,
    churn_risk: 0.12,
    avg_deal_cycle_days: 55,
    pipeline_value: 0.95,
    satisfaction: 83,
  },
  {
    segment: "Enterprise",
    records: 521,
    conversion_rate: 0.41,
    churn_risk: 0.09,
    avg_deal_cycle_days: 68,
    pipeline_value: 2.8,
    satisfaction: 72,
  },
  {
    segment: "Startups",
    records: 1254,
    conversion_rate: 0.26,
    churn_risk: 0.15,
    avg_deal_cycle_days: 37,
    pipeline_value: 0.64,
    satisfaction: 81,
  },
];

interface ParsedDataset {
  rows: Record<string, unknown>[];
  headers: string[];
}

const parseDataset = async (file: File): Promise<ParsedDataset> => {
  const extension = file.name.split(".").pop()?.toLowerCase();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result;
      if (!result) {
        reject(new Error("Unable to read file."));
        return;
      }

      if (extension === "csv") {
        Papa.parse(result as string, {
          header: true,
          skipEmptyLines: true,
          complete: (parsed) => {
            const rows = parsed.data as Record<string, unknown>[];
            const headers = rows.length > 0 ? Object.keys(rows[0] ?? {}) : [];
            resolve({ rows, headers });
          },
          error: (err) => reject(err),
        });
      } else if (extension === "xlsx" || extension === "xls") {
        try {
          const workbook = XLSX.read(result, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });
          const headers = json.length > 0 ? Object.keys(json[0] ?? {}) : [];
          resolve({ rows: json, headers });
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error("Unsupported file type. Upload CSV or Excel."));
      }
    };

    reader.onerror = () => reject(new Error("Unable to read file."));

    if (extension === "csv") {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  });
};

const normaliseDataset = (rows: Record<string, unknown>[], headers: string[]): Record<string, unknown>[] => {
  return rows.map((row) => {
    const next: Record<string, unknown> = {};
    headers.forEach((header) => {
      const value = row[header];
      if (typeof value === "number") {
        next[header] = value;
      } else if (typeof value === "string") {
        const numeric = Number(value);
        if (!Number.isNaN(numeric) && value.trim() !== "") {
          next[header] = numeric;
        } else {
          next[header] = value;
        }
      } else if (value === null || value === undefined) {
        next[header] = "";
      } else {
        next[header] = value;
      }
    });
    return next;
  });
};

const cloneSvgForExport = (svg: SVGSVGElement): SVGSVGElement => {
  const cloned = svg.cloneNode(true) as SVGSVGElement;
  cloned.setAttribute("version", "1.1");
  if (!cloned.getAttribute("xmlns")) {
    cloned.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }
  if (!cloned.getAttribute("xmlns:xlink")) {
    cloned.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  }
  return cloned;
};

const serialiseSvg = (svg: SVGSVGElement): string => {
  const serializer = new XMLSerializer();
  return serializer.serializeToString(cloneSvgForExport(svg));
};

const svgMarkupToDataUrl = (markup: string): string => {
  const encoded = encodeURIComponent(markup).replace(/%([0-9A-F]{2})/g, (_, hex: string) =>
    String.fromCharCode(Number.parseInt(hex, 16)),
  );
  return `data:image/svg+xml;base64,${window.btoa(encoded)}`;
};

const defaultTasksForStage = (stage: AnalysisStageId) =>
  analysisTasks
    .filter((task) => task.stage === stage)
    .slice(0, 2)
    .map((task) => task.id);

const buildDataSummary = (rows: Record<string, unknown>[], headers: string[]): string => {
  if (rows.length === 0 || headers.length === 0) {
    return "No dataset loaded.";
  }

  const rowCount = rows.length;
  const numericHeaders = headers.filter((header) => {
    return rows.some((row) => {
      const value = row[header];
      if (typeof value === "number") return true;
      if (typeof value === "string") {
        const numeric = Number(value);
        return !Number.isNaN(numeric) && value.trim() !== "";
      }
      return false;
    });
  });

  const sampleHeaders = headers.slice(0, Math.min(headers.length, 5));
  return `Dataset contains ${rowCount} rows and ${headers.length} columns. Numeric fields include ${
    numericHeaders.length > 0 ? numericHeaders.join(", ") : "none"
  }. Sample columns: ${sampleHeaders.join(", ")}.`;
};

const DataAnalysis: React.FC = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const locationState = location.state as
    | {
        stage?: AnalysisStageId;
        dataset?: Record<string, unknown>[];
        headers?: string[];
      }
    | undefined;

  const initialStage = locationState?.stage ?? "basic";
  const stagedRows =
    locationState?.dataset && locationState.dataset.length > 0
      ? locationState.dataset
      : curatedSampleRows;
  const stagedHeaders =
    locationState?.headers && locationState.headers.length > 0
      ? locationState.headers
      : Object.keys(stagedRows[0] ?? {});

  const [selectedStage, setSelectedStage] = useState<AnalysisStageId>(initialStage);
  const [rows, setRows] = useState<Record<string, unknown>[]>(stagedRows);
  const [headers, setHeaders] = useState<string[]>(stagedHeaders);
  const [selectedTasks, setSelectedTasks] = useState<string[]>(defaultTasksForStage(initialStage));
  const [analysisRuns, setAnalysisRuns] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<PortfolioAnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [selectedChartType, setSelectedChartType] = useState<string>("BarChart");
  const [selectedXAxis, setSelectedXAxis] = useState<string>(stagedHeaders[0] ?? "");
  const [selectedYAxis, setSelectedYAxis] = useState<string>(stagedHeaders[1] ?? "");
  const [chartConfig, setChartConfig] = useState<{ type: string; x: string; y: string } | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [exporting, setExporting] = useState<{ png: boolean; svg: boolean; pdf: boolean }>(
    {
      png: false,
      svg: false,
      pdf: false,
    },
  );

  const chartContainerRef = useRef<HTMLDivElement>(null);

  const stageDefinition = useMemo(
    () => analysisStages.find((stage) => stage.id === selectedStage),
    [selectedStage],
  );

  const preparedRows = useMemo(() => normaliseDataset(rows, headers).slice(0, DEMO_PREVIEW_ROWS), [rows, headers]);

  const dataSummary = useMemo(() => buildDataSummary(preparedRows, headers), [preparedRows, headers]);

  const resetShareState = useCallback(() => {
    setShareUrl(null);
    const params = new URLSearchParams(searchParams);
    if (params.has("chart")) {
      params.delete("chart");
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (locationState?.dataset && locationState.dataset.length > 0) {
      toast.success("Dataset imported from staging. You're ready to explore.");
    }
  }, [locationState?.dataset]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const chartParam = params.get("chart");
    if (!chartParam) {
      return;
    }

    try {
      const decoded = JSON.parse(atob(decodeURIComponent(chartParam)));
      if (decoded?.stage && ["basic", "intermediate", "expert"].includes(decoded.stage)) {
        setSelectedStage(decoded.stage as AnalysisStageId);
        setSelectedTasks(defaultTasksForStage(decoded.stage as AnalysisStageId));
      }

      if (decoded?.headers && Array.isArray(decoded.headers) && decoded.headers.length > 0) {
        setHeaders(decoded.headers as string[]);
      }

      if (decoded?.rows && Array.isArray(decoded.rows) && decoded.rows.length > 0) {
        setRows(decoded.rows as Record<string, unknown>[]);
      }

      if (decoded?.chartType && decoded?.xAxis && decoded?.yAxis) {
        setSelectedChartType(decoded.chartType as string);
        setSelectedXAxis(decoded.xAxis as string);
        setSelectedYAxis(decoded.yAxis as string);
        setChartConfig({ type: decoded.chartType as string, x: decoded.xAxis as string, y: decoded.yAxis as string });
      }

      toast.success("Loaded shared visualization configuration.");
    } catch (error) {
      console.error("Failed to decode shared chart", error);
      toast.error("Unable to load the shared chart configuration.");
    } finally {
      params.delete("chart");
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const tasksForStage = analysisTasks.filter((task) => task.stage === selectedStage);
    setSelectedTasks((prev) => {
      const defaults = defaultTasksForStage(selectedStage);
      if (prev.some((task) => tasksForStage.find((stageTask) => stageTask.id === task))) {
        return prev.filter((task) => tasksForStage.some((stageTask) => stageTask.id === task));
      }
      return defaults;
    });
  }, [selectedStage]);

  useEffect(() => {
    if (!headers.includes(selectedXAxis)) {
      setSelectedXAxis(headers[0] ?? "");
    }
    if (!headers.includes(selectedYAxis)) {
      setSelectedYAxis(headers[1] ?? headers[0] ?? "");
    }
  }, [headers, selectedXAxis, selectedYAxis]);

  const handleScrollToUpload = useCallback(() => {
    const element = document.getElementById("upload-section");
    element?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsParsing(true);
    try {
      const parsed = await parseDataset(file);
      if (parsed.rows.length === 0 || parsed.headers.length === 0) {
        toast.error("The uploaded file appears to be empty.");
        setIsParsing(false);
        return;
      }

      setRows(parsed.rows);
      setHeaders(parsed.headers);
      setSelectedXAxis(parsed.headers[0] ?? "");
      setSelectedYAxis(parsed.headers[1] ?? parsed.headers[0] ?? "");
      setAnalysisResult(null);
      setAnalysisRuns(0);
      resetShareState();
      toast.success(`Loaded ${parsed.rows.length} rows from ${file.name}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to parse file.";
      toast.error(message);
    } finally {
      setIsParsing(false);
    }
  }, [resetShareState]);

  const toggleTask = useCallback(
    (taskId: string) => {
      setSelectedTasks((prev) => {
        if (prev.includes(taskId)) {
          return prev.filter((id) => id !== taskId);
        }
        return [...prev, taskId];
      });
    },
    [],
  );

  const handleRunAnalysis = useCallback(async () => {
    if (preparedRows.length === 0) {
      toast.error("Upload a dataset or use the sample data before running the analysis.");
      return;
    }

    if (selectedTasks.length === 0) {
      toast.error("Select at least one analysis focus.");
      return;
    }

    if (analysisRuns >= DEMO_ANALYSIS_LIMIT) {
      toast.info("Demo analysis limit reached. Book the full engagement for unlimited runs.");
      return;
    }

    setIsRunning(true);
    setErrorMessage(null);

    try {
      const response = await runPortfolioAnalysis({
        data: preparedRows,
        stage: selectedStage,
        tasks: selectedTasks,
      });

      setAnalysisResult(response);
      setAnalysisRuns((prev) => prev + 1);
      toast.success("AI analysis complete. Explore the insights below.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";
      setErrorMessage(message);
      toast.error("Failed to run the analysis. Check the console for details.");
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  }, [analysisRuns, preparedRows, selectedStage, selectedTasks]);

  const handleBuildChart = useCallback(
    (chartType: string, xAxis: string, yAxis: string) => {
      setChartConfig({ type: chartType, x: xAxis, y: yAxis });
      setShareUrl(null);
      toast.success("Chart ready. Use the share and export controls to showcase it.");
    },
    [],
  );

  const handleGenerateShareUrl = useCallback(async () => {
    if (!chartConfig) {
      toast.info("Choose your chart type and axes, then generate the chart before sharing.");
      return;
    }

    if (typeof window === "undefined") {
      toast.error("Share links are only available in the browser.");
      return;
    }

    try {
      const payload = {
        chartType: chartConfig.type,
        xAxis: chartConfig.x,
        yAxis: chartConfig.y,
        stage: selectedStage,
        headers,
        rows: preparedRows.slice(0, 150),
      };

      const encoded = encodeURIComponent(btoa(JSON.stringify(payload)));
      const url = `${window.location.origin}/data-analysis?chart=${encoded}`;
      await navigator.clipboard.writeText(url);
      setShareUrl(url);
      toast.success("Shareable visualization link copied to clipboard.");
    } catch (error) {
      console.error("Failed to create share link", error);
      toast.error("Unable to generate the shareable link.");
    }
  }, [chartConfig, headers, preparedRows, selectedStage]);

  const handleExportPng = useCallback(() => {
    const svgElement = chartContainerRef.current?.querySelector("svg");
    if (!svgElement) {
      toast.info("Generate a chart before exporting.");
      return;
    }

    setExporting((prev) => ({ ...prev, png: true }));
    const svgMarkup = serialiseSvg(svgElement);
    const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const rect = svgElement.getBoundingClientRect();
      const canvas = document.createElement("canvas");
      canvas.width = rect.width || 800;
      canvas.height = rect.height || 450;
      const context = canvas.getContext("2d");
      if (!context) {
        toast.error("Unable to prepare the export canvas.");
        URL.revokeObjectURL(svgUrl);
        setExporting((prev) => ({ ...prev, png: false }));
        return;
      }
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(svgUrl);
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "westconex-visualization.png";
      link.href = pngUrl;
      link.click();
      toast.success("PNG exported successfully.");
      setExporting((prev) => ({ ...prev, png: false }));
    };
    image.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      toast.error("Unable to export PNG.");
      setExporting((prev) => ({ ...prev, png: false }));
    };
    image.src = svgUrl;
  }, []);

  const handleExportSvg = useCallback(() => {
    const svgElement = chartContainerRef.current?.querySelector("svg");
    if (!svgElement) {
      toast.info("Generate a chart before exporting.");
      return;
    }

    setExporting((prev) => ({ ...prev, svg: true }));
    try {
      const svgMarkup = serialiseSvg(svgElement);
      const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "westconex-visualization.svg";
      link.click();
      URL.revokeObjectURL(url);
      toast.success("SVG exported successfully.");
    } catch (error) {
      console.error("SVG export failed", error);
      toast.error("Unable to export SVG.");
    } finally {
      setExporting((prev) => ({ ...prev, svg: false }));
    }
  }, []);

  const handleExportPdf = useCallback(() => {
    if (!analysisResult) {
      toast.info("Run an AI analysis before exporting a report.");
      return;
    }

    setExporting((prev) => ({ ...prev, pdf: true }));
    try {
      const svgElement = chartContainerRef.current?.querySelector("svg");
      let chartDataUrl = "";
      if (svgElement) {
        const svgMarkup = serialiseSvg(svgElement);
        chartDataUrl = svgMarkupToDataUrl(svgMarkup);
      }

      const missionLabels = (analysisResult.tasks ?? [])
        .map((taskId) => analysisTasks.find((task) => task.id === taskId)?.title ?? taskId)
        .join(", ");

      const summaryItems = analysisResult.summary
        ? Object.entries(analysisResult.summary)
            .map(([key, value]) => `<li><strong>${key}:</strong> ${String(value)}</li>`)
            .join("")
        : "";

      const insightItems = (analysisResult.insights ?? [])
        .map((insight) => `<li>${insight}</li>`)
        .join("");

      const reportWindow = window.open("", "_blank", "width=900,height=700");
      if (!reportWindow) {
        throw new Error("Allow pop-ups to export the report as PDF.");
      }

      const stageTitle = stageDefinition?.title ?? selectedStage;
      const tasksSummary = missionLabels || "Tasks selected within demo";

      reportWindow.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Westconex Analysis Report</title>
  <style>
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; padding: 40px; color: #111827; }
    h1 { font-size: 28px; margin-bottom: 16px; }
    h2 { font-size: 18px; margin-top: 32px; margin-bottom: 12px; }
    ul { padding-left: 20px; }
    .meta { font-size: 14px; color: #4b5563; margin-bottom: 16px; }
    .summary, .insights { font-size: 14px; color: #374151; }
    .chart { margin-top: 24px; }
    img { max-width: 100%; height: auto; border: 1px solid #e5e7eb; border-radius: 12px; }
  </style>
</head>
<body>
  <h1>AI Data Intelligence Report</h1>
  <p class="meta">Stage: ${stageTitle}</p>
  <p class="meta">Missions: ${tasksSummary}</p>
  <p class="meta">Dataset summary: ${dataSummary}</p>
  ${summaryItems ? `<h2>Key metrics</h2><ul class="summary">${summaryItems}</ul>` : ""}
  ${insightItems ? `<h2>Insights</h2><ul class="insights">${insightItems}</ul>` : ""}
  ${chartDataUrl ? `<div class="chart"><h2>Demo visualization</h2><img src="${chartDataUrl}" alt="Chart" /></div>` : ""}
  <p class="meta" style="margin-top:32px;">Generated via the Westconex AI Data Studio demo. Use your browser's Save as PDF option to download.</p>
</body>
</html>`);
      reportWindow.document.close();
      reportWindow.focus();
      reportWindow.print();
      toast.success("Report ready. Use the print dialog to save as PDF.");
    } catch (error) {
      console.error("PDF export failed", error);
      const message = error instanceof Error ? error.message : "Unable to export the report.";
      toast.error(message);
    } finally {
      setExporting((prev) => ({ ...prev, pdf: false }));
    }
  }, [analysisResult, dataSummary, selectedStage, stageDefinition]);

  return (
    <div className="space-y-12 pb-20">
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-background via-background to-primary/10 p-10 md:p-14">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-6 text-left">
            <Badge variant="outline" className="w-fit rounded-full px-4 py-1 text-xs uppercase tracking-[0.5em]">
              AI Data Studio Demo
            </Badge>
            <h1 className="text-4xl font-semibold leading-tight text-foreground md:text-5xl">
              Upload, analyse, and narrate data stories with generative & agentic AI.
            </h1>
            <p className="text-lg text-muted-foreground">
              Stage your CSV or Excel file, let the Hugging Face-powered backend orchestrate pandas, numpy, seaborn, plotly, scikit-learn,
              and matplotlib, then export recruiter-ready insights. Demos are intentionally scoped—book the full engagement for unlimited intelligence.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" className="rounded-full px-7" onClick={handleScrollToUpload}>
                Start with your dataset
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-primary/40 px-7">
                <a href="/contact">Book comprehensive analysis</a>
              </Button>
            </div>
          </div>
          <div className="w-full max-w-md space-y-4 rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm">
            <div className="flex items-center gap-3 text-primary">
              <Sparkles className="h-6 w-6" />
              <p className="text-sm font-semibold uppercase tracking-[0.4em]">What this demo covers</p>
            </div>
            <ul className="grid gap-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <FileSpreadsheet className="mt-0.5 h-5 w-5 text-primary" />
                <span>Drag-and-drop data upload with instant data quality preview.</span>
              </li>
              <li className="flex items-start gap-3">
                <BarChart3 className="mt-0.5 h-5 w-5 text-primary" />
                <span>Interactive chart builder with shareable links and PNG/SVG/PDF exports.</span>
              </li>
              <li className="flex items-start gap-3">
                <Bot className="mt-0.5 h-5 w-5 text-primary" />
                <span>Natural language Q&A backed by your selected dataset and AI pipelines.</span>
              </li>
              <li className="flex items-start gap-3">
                <Layers className="mt-0.5 h-5 w-5 text-primary" />
                <span>Tiered intelligence missions from basic profiling to expert anomaly ops.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section id="upload-section" className="space-y-6">
        <div className="flex flex-col gap-2 text-left">
          <Badge variant="outline" className="w-fit rounded-full px-4 py-1 text-xs uppercase tracking-[0.5em]">
            Step 1 · Upload & Preview
          </Badge>
          <h2 className="text-3xl font-semibold">Bring your dataset to the studio</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Upload a CSV or Excel file to see a structured preview. The demo limits previews to {DEMO_PREVIEW_ROWS} rows to keep things fast, while the full engagement scales to millions of records with validation, governance, and lineage.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.1fr,1fr]">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl">Upload a CSV or Excel file</CardTitle>
              <CardDescription>
                Drag and drop your file or browse from your device. We'll detect headers, datatypes, and provide instant feedback.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUploadZone onFileSelect={handleFileSelect} />
              {isParsing && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <LoadingSpinner size={16} /> Parsing file...
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Need inspiration? Stay with the staged sample dataset showcasing GTM performance metrics.
              </p>
            </CardContent>
          </Card>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl">Preview (first 50 rows)</CardTitle>
              <CardDescription className="text-sm">
                {rows.length > 0
                  ? `Showing ${Math.min(rows.length, 50)} of ${rows.length} rows across ${headers.length} columns.`
                  : "Upload a dataset to see the preview."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTablePreview data={preparedRows} headers={headers} />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2 text-left">
          <Badge variant="outline" className="w-fit rounded-full px-4 py-1 text-xs uppercase tracking-[0.5em]">
            Step 2 · Choose Intelligence Tier
          </Badge>
          <h2 className="text-3xl font-semibold">Select the analysis depth for your story</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            From foundational data confidence to agent-driven anomaly detection, pick the mission tier that best reflects your business questions. Demo runs are capped at {DEMO_ANALYSIS_LIMIT} analysis per session.
          </p>
        </div>
        <Tabs value={selectedStage} onValueChange={(value) => setSelectedStage(value as AnalysisStageId)}>
          <TabsList className="grid w-full grid-cols-1 gap-2 bg-muted/50 p-2 md:grid-cols-3">
            {analysisStages.map((stage) => (
              <TabsTrigger
                key={stage.id}
                value={stage.id}
                className="rounded-xl px-4 py-3 text-left"
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{stage.subtitle}</span>
                  <span className="text-base font-semibold">{stage.title}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
          {analysisStages.map((stage) => {
            const tasksForStage = analysisTasks.filter((task) => task.stage === stage.id);
            return (
              <TabsContent key={stage.id} value={stage.id} className="mt-6 space-y-6">
                <Card className="border-border/70">
                  <CardHeader className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <CardTitle className="text-2xl font-semibold">{stage.title}</CardTitle>
                      <CardDescription>{stage.description}</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stage.pythonStack.map((pkg) => (
                      <Badge key={pkg} variant="secondary" className="rounded-full px-3 py-1 text-xs">
                        {pkg}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Focus Areas</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {stage.focusAreas.map((focus) => (
                        <li key={focus}>{focus}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Demo Guardrails</p>
                    <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 text-xs text-primary">
                      {stage.limitCopy}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                {tasksForStage.map((task) => (
                  <Card key={task.id} className={cn("transition-colors", selectedTasks.includes(task.id) && "border-primary bg-primary/5")}
                  >
                    <CardHeader className="flex flex-row items-start justify-between gap-3">
                      <div className="space-y-2">
                        <CardTitle className="text-lg font-semibold">{task.title}</CardTitle>
                        <CardDescription>{task.description}</CardDescription>
                      </div>
                      <Checkbox
                        checked={selectedTasks.includes(task.id)}
                        onCheckedChange={() => toggleTask(task.id)}
                        aria-label={`Toggle ${task.title}`}
                      />
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Outcomes</p>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {task.outcomes.map((outcome) => (
                          <li key={outcome}>{outcome}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            );
          })}
        </Tabs>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2 text-left">
          <Badge variant="outline" className="w-fit rounded-full px-4 py-1 text-xs uppercase tracking-[0.5em]">
            Step 3 · Run AI Analysis
          </Badge>
          <h2 className="text-3xl font-semibold">Generate guided insights</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            The Hugging Face Space orchestrates pandas, numpy, seaborn, plotly, scikit-learn, and matplotlib pipelines to profile your data, build visuals, and narrate insights. Demo runs are capped at one per session.
          </p>
        </div>
        <Card className="border-border/70">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2 text-left">
              <h3 className="text-xl font-semibold">Run the orchestrated analysis</h3>
              <p className="text-sm text-muted-foreground">
                We'll sample up to {DEMO_PREVIEW_ROWS} rows, execute your selected missions, and deliver insights, charts, and recommendations.
              </p>
              <p className="text-xs text-muted-foreground">
                {analysisRuns >= DEMO_ANALYSIS_LIMIT
                  ? "Demo limit reached. Export what you've built or book a full engagement."
                  : `${DEMO_ANALYSIS_LIMIT - analysisRuns} demo analysis remaining.`}
              </p>
            </div>
            <Button
              size="lg"
              className="rounded-full px-7"
              onClick={handleRunAnalysis}
              disabled={isRunning || analysisRuns >= DEMO_ANALYSIS_LIMIT}
            >
              {isRunning ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size={16} /> Running analysis...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" /> Run AI analysis
                </span>
              )}
            </Button>
          </CardContent>
        </Card>
        {errorMessage && (
          <Alert variant="destructive">
            <AlertTitle>Analysis failed</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {analysisResult && (
          <div className="grid gap-6 lg:grid-cols-[1.1fr,1fr]">
            <Card className="border-border/70">
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl font-semibold">AI summary</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Stage: {analysisResult.stage} · Missions:{" "}
                  {(analysisResult.tasks ?? [])
                    .map((taskId) => analysisTasks.find((task) => task.id === taskId)?.title ?? taskId)
                    .join(", ")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysisResult.summary && (
                  <div className="space-y-2 text-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Key metrics</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {Object.entries(analysisResult.summary).map(([key, value]) => (
                        <div key={key} className="rounded-xl border border-border/60 bg-muted/20 p-3">
                          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{key}</p>
                          <p className="mt-1 text-lg font-semibold">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysisResult.insights && analysisResult.insights.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Insights</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {analysisResult.insights.slice(0, 6).map((insight, index) => (
                        <li key={`${insight}-${index}`}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResult.limit_notice && (
                  <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 text-xs text-primary">
                    {analysisResult.limit_notice}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold">Next steps</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Suggested sequence to expand this demo into a full engagement.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysisResult.stage_steps && (
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    {analysisResult.stage_steps.map((step, index) => (
                      <li key={step} className="flex gap-2">
                        <span className="text-primary">{index + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                )}
                {analysisResult.tech_stack && (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Tech stack</p>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.tech_stack.map((tool) => (
                        <Badge key={tool} variant="secondary" className="rounded-full px-3 py-1 text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <Separator />
                <Button asChild variant="outline" className="w-full rounded-full">
                  <a href="/contact" className="flex items-center justify-center gap-2">
                    <Share2 className="h-4 w-4" /> Book the full intelligence build
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2 text-left">
          <Badge variant="outline" className="w-fit rounded-full px-4 py-1 text-xs uppercase tracking-[0.5em]">
            Step 4 · Visualise & Share
          </Badge>
          <h2 className="text-3xl font-semibold">Craft a chart and share the story</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Map any column to create bar, line, scatter, area, or pie charts. Share them with a unique link or export for pitch decks.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
          <ChartBuilder
            headers={headers}
            onBuildChart={handleBuildChart}
            selectedChartType={selectedChartType}
            setSelectedChartType={setSelectedChartType}
            selectedXAxis={selectedXAxis}
            setSelectedXAxis={setSelectedXAxis}
            selectedYAxis={selectedYAxis}
            setSelectedYAxis={setSelectedYAxis}
            isDemoLocked={preparedRows.length === 0}
            lockMessage="Upload a dataset to enable charting."
          />
          <div className="flex h-full flex-col gap-4">
            <div ref={chartContainerRef} className="w-full">
              <ChartDisplay
                chartType={chartConfig?.type ?? selectedChartType}
                data={preparedRows}
                xAxisKey={chartConfig?.x ?? selectedXAxis}
                yAxisKey={chartConfig?.y ?? selectedYAxis}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleGenerateShareUrl}
                disabled={!chartConfig}
              >
                <Link2 className="h-4 w-4" /> Copy share link
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleExportPng}
                disabled={exporting.png || !chartConfig}
              >
                {exporting.png ? <LoadingSpinner size={16} /> : <Download className="h-4 w-4" />} PNG
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleExportSvg}
                disabled={exporting.svg || !chartConfig}
              >
                {exporting.svg ? <LoadingSpinner size={16} /> : <Download className="h-4 w-4" />} SVG
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleExportPdf}
                disabled={exporting.pdf || !analysisResult}
              >
                {exporting.pdf ? <LoadingSpinner size={16} /> : <Download className="h-4 w-4" />} PDF report
              </Button>
            </div>
            {shareUrl && (
              <p className="text-xs text-muted-foreground">
                Shareable link ready:&nbsp;
                <a className="text-primary underline" href={shareUrl} target="_blank" rel="noreferrer">
                  {shareUrl}
                </a>
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2 text-left">
          <Badge variant="outline" className="w-fit rounded-full px-4 py-1 text-xs uppercase tracking-[0.5em]">
            Step 5 · Ask in natural language
          </Badge>
          <h2 className="text-3xl font-semibold">Interrogate the data with AI</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Ask the assistant about column definitions, trends, or strategies. Demo chats are limited—book the full engagement for unlimited, fully-contextualised conversations.
          </p>
        </div>
        <AIChatInterface
          dataHeaders={headers}
          dataSummary={dataSummary}
          maxQuestions={3}
          lockedMessage="Demo chat limit reached. Request the full AI copilot for unlimited Q&A."
        />
      </section>
    </div>
  );
};

export default DataAnalysis;
