"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import FileUploadZone from "@/components/FileUploadZone";
import DataTablePreview from "@/components/DataTablePreview";
import LoadingSpinner from "@/components/LoadingSpinner";
import { analysisStages, analysisTasks, AnalysisStageId } from "@/data/analysisStages";
import { runPortfolioAnalysis, PortfolioAnalysisResponse } from "@/lib/hf-client";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2, UploadCloud, Zap } from "lucide-react";

const DEMO_ANALYSIS_LIMIT = 1;
const DEMO_PREVIEW_LIMIT = 200;

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

const parseDataset = async (file: File): Promise<{ rows: Record<string, unknown>[]; headers: string[] }> => {
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
            const headers = rows.length > 0 ? Object.keys(rows[0]!) : [];
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
          const headers = json.length > 0 ? Object.keys(json[0]!) : [];
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

const DataAnalysis: React.FC = () => {
  const location = useLocation();
  const locationState = location.state as
    | { stage?: AnalysisStageId; dataset?: Record<string, unknown>[]; headers?: string[] }
    | undefined;
  const initialStage = locationState?.stage ?? "basic";
  const initialRows =
    locationState?.dataset && locationState.dataset.length > 0
      ? locationState.dataset
      : curatedSampleRows;
  const initialHeaders =
    locationState?.headers && locationState.headers.length > 0
      ? locationState.headers
      : Object.keys(initialRows[0] ?? {});

  const [selectedStage, setSelectedStage] = useState<AnalysisStageId>(initialStage);
  const [selectedTasks, setSelectedTasks] = useState<string[]>(
    analysisTasks.filter((task) => task.stage === initialStage).slice(0, 2).map((task) => task.id),
  );
  const [rows, setRows] = useState<Record<string, unknown>[]>(initialRows);
  const [headers, setHeaders] = useState<string[]>(initialHeaders);
  const [isParsing, setIsParsing] = useState(false);
  const [analysisRuns, setAnalysisRuns] = useState(0);
  const [result, setResult] = useState<PortfolioAnalysisResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedStage(initialStage);
    const defaults = analysisTasks.filter((task) => task.stage === initialStage).slice(0, 2).map((task) => task.id);
    setSelectedTasks(defaults);
  }, [initialStage]);

  useEffect(() => {
    if (locationState?.dataset && locationState.dataset.length > 0) {
      setRows(locationState.dataset);
      setHeaders(locationState.headers && locationState.headers.length > 0
        ? locationState.headers
        : Object.keys(locationState.dataset[0] ?? {}));
      toast.success("Dataset imported from staging. Ready when you are.");
    }
  }, [locationState?.dataset, locationState?.headers]);

  const previewRows = useMemo(() => rows.slice(0, DEMO_PREVIEW_LIMIT), [rows]);
  const previewLimited = rows.length > DEMO_PREVIEW_LIMIT;

  const availableTasks = useMemo(
    () => analysisTasks.filter((task) => task.stage === selectedStage),
    [selectedStage],
  );

  const handleStageSelect = (stage: AnalysisStageId) => {
    setSelectedStage(stage);
    const defaults = analysisTasks.filter((task) => task.stage === stage).slice(0, 2).map((task) => task.id);
    setSelectedTasks(defaults);
    setResult(null);
  };

  const toggleTask = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId],
    );
  };

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      setIsParsing(true);
      const parsed = await parseDataset(file);
      if (parsed.rows.length === 0) {
        toast.error("No data detected in the uploaded file.");
        return;
      }
      setRows(parsed.rows);
      setHeaders(parsed.headers);
      setResult(null);
      toast.success("Dataset parsed successfully. Ready for analysis.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to parse file.";
      toast.error(message);
    } finally {
      setIsParsing(false);
    }
  }, []);

  const runAnalysis = async () => {
    if (rows.length === 0) {
      toast.error("Upload a dataset or use the curated demo first.");
      return;
    }

    if (analysisRuns >= DEMO_ANALYSIS_LIMIT) {
      toast.info("Demo limit reached. Book a call to unlock unlimited runs.");
      return;
    }

    setIsRunning(true);
    setErrorMessage(null);

    try {
      const response = await runPortfolioAnalysis({
        data: rows,
        stage: selectedStage,
        tasks: selectedTasks,
      });
      setResult(response);
      setAnalysisRuns((count) => count + 1);
      toast.success("Demo analysis generated.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected analysis error.";
      setErrorMessage(message);
      toast.error("Unable to run the analysis demo.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-12">
      <Card className="rounded-3xl border border-border/70 bg-muted/30">
        <CardHeader className="space-y-4">
          <Badge variant="outline" className="w-fit rounded-full px-4 py-1 text-xs uppercase tracking-[0.5em] text-primary">
            Guided Data Intelligence Demo
          </Badge>
          <CardTitle className="text-3xl font-semibold text-foreground md:text-4xl">
            Upload, analyse, and narrate with production-grade Python tooling
          </CardTitle>
          <CardDescription className="max-w-3xl text-base text-muted-foreground">
            Step through the studio just like a prospective client. Every run leverages pandas, numpy, seaborn, plotly,
            scikit-learn, and matplotlib from the Hugging Face Space powering this portfolio. Hire me to unlock unlimited
            datasets, deeper modelling, and automation.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-10 xl:grid-cols-[1.2fr,0.8fr]">
        <section className="space-y-8">
          <Card className="rounded-3xl border border-border/70 bg-background/95">
            <CardHeader className="space-y-3">
              <div className="flex flex-col gap-2 text-left">
                <CardTitle className="text-2xl font-semibold">1. Select intelligence tier</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Choose how deep the demo should go. Each tier is tuned for specific demo narratives.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {analysisStages.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => handleStageSelect(stage.id)}
                  className={cn(
                    "group flex h-full flex-col rounded-2xl border p-4 text-left transition-all",
                    selectedStage === stage.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/30 hover:border-primary/60 hover:bg-primary/5",
                  )}
                  type="button"
                >
                  <div className="flex items-center gap-3">
                    <stage.icon className="h-5 w-5 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{stage.subtitle}</span>
                      <span className="text-base font-semibold text-foreground">{stage.title}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                    {stage.description}
                  </p>
                  <div className="mt-auto pt-4 text-[11px] uppercase tracking-[0.3em] text-primary">
                    {stage.limitCopy}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-border/70 bg-background/95">
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl font-semibold">2. Curate the mission</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Toggle the deliverables this client demo expects. The Space will simulate each workflow.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {availableTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={cn(
                    "flex h-full flex-col rounded-2xl border p-4 text-left transition-colors",
                    selectedTasks.includes(task.id)
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/30 hover:border-primary/60 hover:bg-primary/5",
                  )}
                  type="button"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-semibold text-foreground">{task.title}</h4>
                    {selectedTasks.includes(task.id) && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{task.description}</p>
                  <div className="mt-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                    Deliverables
                  </div>
                  <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                    {task.outcomes.map((outcome) => (
                      <li key={outcome}>{outcome}</li>
                    ))}
                  </ul>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-border/70 bg-background/95">
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl font-semibold">3. Upload or keep the curated dataset</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Upload CSV or Excel files. The demo limits previews to {DEMO_PREVIEW_LIMIT} rows.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FileUploadZone onFileSelect={handleFileSelect} />
              {isParsing && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LoadingSpinner size={18} />
                  Parsing dataset...
                </div>
              )}
              <Alert className="rounded-2xl border-primary/40 bg-primary/5">
                <AlertTitle className="text-sm font-semibold">Demo guardrails</AlertTitle>
                <AlertDescription className="text-xs text-muted-foreground">
                  The showcase is capped at {DEMO_ANALYSIS_LIMIT} automated run per visit. Full engagements include data pipelines,
                  automation, and dedicated agents on-call.
                </AlertDescription>
              </Alert>
              <div className="rounded-2xl border bg-muted/40 p-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <UploadCloud className="h-4 w-4 text-primary" />
                  {rows.length} rows • {headers.length} columns ready for analysis
                </div>
                <p className="mt-2 leading-relaxed">
                  {previewLimited
                    ? `Preview trimmed to ${DEMO_PREVIEW_LIMIT} rows. Hire me to explore the full dataset.`
                    : "Preview displays the full dataset."}
                </p>
              </div>
              <DataTablePreview data={previewRows} headers={headers} />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Ready? Launch the agentic analysis. Additional runs require a partnership engagement.
                </p>
                <Button
                  onClick={runAnalysis}
                  disabled={isRunning}
                  className="rounded-full px-6"
                >
                  {isRunning ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner size={16} /> Generating demo...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Run analysis demo <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-6">
          <Card className="rounded-3xl border border-primary/40 bg-primary/5">
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl font-semibold text-primary">
                4. Review the AI-led findings
              </CardTitle>
              <CardDescription className="text-sm text-primary/80">
                Results showcase the stack in action. Request the full engagement for unlimited narratives and agent workflows.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isRunning && (
                <div className="flex items-center gap-2 text-primary">
                  <LoadingSpinner size={18} />
                  <span className="text-sm font-medium">Assembling insight decks...</span>
                </div>
              )}

              {errorMessage && (
                <Alert variant="destructive" className="rounded-2xl">
                  <AlertTitle className="text-sm font-semibold">Analysis error</AlertTitle>
                  <AlertDescription className="text-sm">{errorMessage}</AlertDescription>
                </Alert>
              )}

              {result ? (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-primary/40 bg-background/95 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Stage</p>
                    <p className="text-lg font-semibold text-foreground">{result.stage.toUpperCase()}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {analysisStages.find((stage) => stage.id === selectedStage)?.limitCopy}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Highlights</p>
                    <ul className="grid gap-2 text-sm text-foreground">
                      {result.insights.map((insight) => (
                        <li key={insight} className="rounded-2xl border border-border/70 bg-background/95 p-3">
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Workflow Steps</p>
                    <ul className="grid gap-2 text-sm text-muted-foreground">
                      {result.stage_steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                  </div>
                  {result.charts.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Visual artefacts</p>
                      <div className="grid gap-4">
                        {result.charts.map((chart) => (
                          <figure
                            key={chart.title}
                            className="overflow-hidden rounded-2xl border border-border/70 bg-background/95"
                          >
                            <img src={chart.image} alt={chart.title} className="w-full" />
                            <figcaption className="px-4 py-3 text-xs text-muted-foreground">
                              <span className="font-semibold text-foreground">{chart.title}</span> — {chart.description}
                            </figcaption>
                          </figure>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.kmeans && Object.keys(result.kmeans).length > 0 && (
                    <div className="space-y-3 rounded-2xl border border-border/70 bg-background/95 p-4 text-sm text-muted-foreground">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Segmentation summary</p>
                      <pre className="whitespace-pre-wrap text-xs">
                        {JSON.stringify(result.kmeans, null, 2)}
                      </pre>
                    </div>
                  )}
                  {result.anomalies && Object.keys(result.anomalies).length > 0 && (
                    <div className="space-y-3 rounded-2xl border border-border/70 bg-background/95 p-4 text-sm text-muted-foreground">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Anomaly preview</p>
                      <pre className="whitespace-pre-wrap text-xs">
                        {JSON.stringify(result.anomalies, null, 2)}
                      </pre>
                    </div>
                  )}
                  <Separator />
                  <div className="rounded-2xl border border-primary/40 bg-primary/5 p-4 text-xs text-primary">
                    {result.limit_notice}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 rounded-2xl border border-dashed border-border/60 bg-background/95 p-6 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2 text-foreground">
                    <Zap className="h-4 w-4 text-primary" />
                    Run the analysis to see insights, visuals, and automation next steps.
                  </p>
                  <p>
                    The Hugging Face backend executes Python notebooks live with pandas, numpy, seaborn, plotly, scikit-learn,
                    and matplotlib. This preview keeps things short and sweet—just enough for recruiters to understand the power.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default DataAnalysis;
