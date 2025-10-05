"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import FileUploadZone from "@/components/FileUploadZone";
import DataTablePreview from "@/components/DataTablePreview";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const DataUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, string>[]>([]);
  const [dataHeaders, setDataHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
        } catch (error: any) {
          toast.error(`Error parsing Excel file: ${error.message}`);
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

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Card className="w-full max-w-5xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Upload Your Data</CardTitle>
          <CardDescription className="text-center mt-2">
            Drag and drop your CSV or Excel file here to get started with AI-powered analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileUploadZone onFileSelect={handleFileSelect} acceptedFileTypes=".csv,.xlsx,.xls" />

          {isLoading && (
            <div className="flex items-center justify-center space-x-2 text-primary">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Parsing file...</span>
            </div>
          )}

          {selectedFile && !isLoading && (
            <div className="mt-4 space-y-4">
              <h3 className="text-xl font-semibold text-center">
                Preview of "{selectedFile.name}" ({parsedData.length} rows)
              </h3>
              <DataTablePreview data={parsedData} headers={dataHeaders} />
              {parsedData.length > 0 && (
                <div className="text-center">
                  <Button size="lg" className="mt-4">
                    Proceed to Analysis
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataUpload;