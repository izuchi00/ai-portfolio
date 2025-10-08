"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import FileUploadZone from "@/components/FileUploadZone";
import DataTablePreview from "@/components/DataTablePreview";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "@/components/LoadingSpinner";
import SectionWrapper from "@/components/SectionWrapper";

const DataUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, string>[]>([]);
  const [dataHeaders, setDataHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setParsedData([]);
    setDataHeaders([]);
    parseFile(file);
  };

  const parseFile = (file: File) => {
    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) {
        toast.error("Failed to read file.");
        setIsLoading(false);
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
              toast.error("Error parsing CSV file. Check console for details.");
            }
            setParsedData(results.data as Record<string, string>[]);
            if (results.data.length > 0) {
              setDataHeaders(Object.keys(results.data[0] as Record<string, string>));
            }
            toast.success("CSV file parsed successfully!");
            setIsLoading(false);
          },
          error: (error: Error) => {
            toast.error(`Error parsing CSV: ${error.message}`);
            setIsLoading(false);
          }
        });
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        try {
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (json.length === 0) {
            toast.error("Excel file is empty or could not be parsed.");
            setIsLoading(false);
            return;
          }

          const headers = json[0] as string[];
          const rows = json.slice(1) as string[][];

          const parsedRows = rows.map(row => {
            const rowObject: Record<string, string> = {};
            headers.forEach((header, index) => {
              rowObject[header] = row[index] !== undefined ? String(row[index]) : "";
            });
            return rowObject;
          });

          setParsedData(parsedRows);
          setDataHeaders(headers);
          toast.success("Excel file parsed successfully!");
          setIsLoading(false);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Unexpected error while parsing Excel file.";
          toast.error(`Error parsing Excel file: ${message}`);
          setIsLoading(false);
        }
      } else {
        toast.error("Unsupported file type. Please upload a CSV or Excel file.");
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      toast.error("Failed to read file.");
      setIsLoading(false);
    };

    if (file.type === "text/csv" || file.name.endsWith(".csv")) {
      reader.readAsText(file);
    } else if (file.type.includes("excel") || file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      reader.readAsBinaryString(file);
    } else {
      toast.error("Unsupported file type. Please upload a CSV or Excel file.");
      setIsLoading(false);
    }
  };

  const handleProceedToAnalysis = () => {
    if (parsedData.length > 0) {
      navigate("/data-analysis", { state: { parsedData, dataHeaders } });
    } else {
      toast.error("Please upload and parse a file before proceeding to analysis.");
    }
  };

  return (
    <SectionWrapper className="py-10">
      <Card className="mx-auto w-full max-w-5xl rounded-3xl border shadow-sm">
        <CardHeader className="space-y-4 text-center">
          <Badge variant="outline" className="mx-auto w-fit uppercase tracking-wide text-primary">Dataset staging</Badge>
          <CardTitle className="text-3xl font-semibold">Stage your dataset</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Upload a CSV or Excel file to preview structure, validate headers, and hand it off to the Data Intelligence Studio for
            mission-driven analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileUploadZone onFileSelect={handleFileSelect} acceptedFileTypes=".csv,.xlsx,.xls" />

          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-primary">
              <LoadingSpinner size={20} />
              <span>Parsing file...</span>
            </div>
          )}

          {selectedFile && !isLoading && (
            <div className="space-y-4">
              <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">{selectedFile.name}</span> • {parsedData.length} rows detected •
                  {" "}
                  {dataHeaders.length} columns ready for mapping.
                </p>
              </div>
              <DataTablePreview data={parsedData} headers={dataHeaders} />
              {parsedData.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Looks good? Continue to the Data Analysis workspace to assign a mission and generate insights.
                  </p>
                  <Button size="lg" onClick={handleProceedToAnalysis}>
                    Continue to analysis studio
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </SectionWrapper>
  );
};

export default DataUpload;