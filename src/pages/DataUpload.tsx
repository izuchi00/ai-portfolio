"use client";

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import FileUploadZone from "@/components/FileUploadZone";
import DataTablePreview from "@/components/DataTablePreview";
import LoadingSpinner from "@/components/LoadingSpinner";
import { analysisStages } from "@/data/analysisStages";
import { ArrowRight, Sparkles, UploadCloud } from "lucide-react";

const PREVIEW_LIMIT = 200;

const parseFile = async (file: File): Promise<{ rows: Record<string, unknown>[]; headers: string[] }> => {
  const extension = file.name.split(".").pop()?.toLowerCase();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result;
      if (!result) {
        reject(new Error("Could not read file."));
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
        reject(new Error("Unsupported file type. Please upload CSV or Excel."));
      }
    };

    reader.onerror = () => reject(new Error("Could not read file."));

    if (extension === "csv") {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  });
};

const DataUpload: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  const previewRows = useMemo(() => rows.slice(0, PREVIEW_LIMIT), [rows]);
  const previewLimited = rows.length > PREVIEW_LIMIT;

  const handleFileSelect = async (file: File) => {
    try {
      setIsParsing(true);
      const parsed = await parseFile(file);
      if (parsed.rows.length === 0) {
        toast.error("No rows detected. Please upload a populated file.");
        return;
      }
      setRows(parsed.rows);
      setHeaders(parsed.headers);
      toast.success("Dataset staged. Continue to the studio.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to parse file.";
      toast.error(message);
    } finally {
      setIsParsing(false);
    }
  };

  const proceedToStudio = () => {
    if (rows.length === 0) {
      toast.error("Upload a dataset before continuing.");
      return;
    }

    navigate("/data-analysis", {
      state: {
        dataset: rows,
        headers,
      },
    });
  };

  return (
    <div className="space-y-10">
      <Card className="rounded-3xl border border-border/70 bg-muted/30">
        <CardHeader className="space-y-4">
          <Badge variant="outline" className="w-fit rounded-full px-4 py-1 text-xs uppercase tracking-[0.5em] text-primary">
            Dataset staging suite
          </Badge>
          <CardTitle className="text-3xl font-semibold text-foreground md:text-4xl">
            Prepare your dataset for the Data Intelligence Studio
          </CardTitle>
          <CardDescription className="max-w-3xl text-base text-muted-foreground">
            Upload data, validate the schema, and walk into the demo with confidence. Each staged dataset flows directly into
            the analysis tiers powered by pandas, numpy, seaborn, scikit-learn, plotly, and matplotlib.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-8 lg:grid-cols-[1fr,0.6fr]">
        <Card className="rounded-3xl border border-border/70 bg-background/95">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl font-semibold">Upload & preview</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Drag in CSV or Excel files. We limit previews to {PREVIEW_LIMIT} rows to keep the demo nimble.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FileUploadZone onFileSelect={handleFileSelect} />
            {isParsing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoadingSpinner size={16} /> Parsing dataset...
              </div>
            )}
            <Alert className="rounded-2xl border-primary/40 bg-primary/5">
              <AlertTitle className="text-sm font-semibold">Demo reminder</AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground">
                This staging area is capped to a single dataset per visit. Engage me for automated pipelines, data contracts, and
                agent monitoring.
              </AlertDescription>
            </Alert>
            <div className="rounded-2xl border bg-muted/40 p-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <UploadCloud className="h-4 w-4 text-primary" />
                {rows.length} rows • {headers.length} columns detected
              </div>
              {rows.length > 0 && (
                <p className="mt-2">
                  {previewLimited
                    ? `Showing the first ${PREVIEW_LIMIT} rows. Full previews unlock during the paid engagement.`
                    : "Showing the entire dataset."}
                </p>
              )}
            </div>
            {rows.length > 0 ? (
              <DataTablePreview data={previewRows} headers={headers} />
            ) : (
              <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
                No file yet. Upload to preview columns, data types, and sample rows.
              </div>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Ready for the walkthrough? Continue to the Data Intelligence Studio.
              </p>
              <Button onClick={proceedToStudio} className="rounded-full px-6" disabled={rows.length === 0}>
                Continue to analysis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/70 bg-muted/30">
          <CardHeader className="space-y-3">
            <CardTitle className="text-xl font-semibold">What happens next?</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Choose a tier and the studio will orchestrate the Python stack for a polished, recruiter-ready demo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.3em]">Intelligence tiers</span>
            </div>
            <ul className="space-y-4 text-sm text-muted-foreground">
              {analysisStages.map((stage) => (
                <li key={stage.id} className="rounded-2xl border border-border/60 bg-background/95 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{stage.subtitle}</p>
                  <p className="text-base font-semibold text-foreground">{stage.title}</p>
                  <p className="mt-2 text-xs leading-relaxed">{stage.description}</p>
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="w-full rounded-full">
              <a href="/data-analysis">Jump into the studio</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataUpload;
