"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner"; // Import LoadingSpinner

interface DataTransformationProps {
  headers: string[];
  onTransformData: (column: string, transformation: string) => void;
  isLoading: boolean;
}

const DataTransformation: React.FC<DataTransformationProps> = ({
  headers,
  onTransformData,
  isLoading,
}) => {
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [selectedTransformation, setSelectedTransformation] = useState<string>("");

  const transformations = [
    { value: "fill_missing_mean", label: "Fill Missing with Mean (Numeric)" },
    { value: "fill_missing_median", label: "Fill Missing with Median (Numeric)" },
    { value: "fill_missing_mode", label: "Fill Missing with Mode (Categorical/Numeric)" },
    { value: "convert_to_number", label: "Convert to Number" },
    { value: "convert_to_string", label: "Convert to String" },
    { value: "normalize_data", label: "Normalize Data (Min-Max)" },
  ];

  const handleApplyTransformation = () => {
    if (!selectedColumn || !selectedTransformation) {
      toast.error("Please select both a column and a transformation.");
      return;
    }
    onTransformData(selectedColumn, selectedTransformation);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">AI Data Transformation (Demo)</CardTitle>
        <CardDescription className="text-center mt-2">
          Apply simulated AI-powered transformations to your data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="select-column">Select Column</Label>
            <Select value={selectedColumn} onValueChange={setSelectedColumn}>
              <SelectTrigger id="select-column">
                <SelectValue placeholder="Choose a column" />
              </SelectTrigger>
              <SelectContent>
                {headers.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="select-transformation">Select Transformation</Label>
            <Select value={selectedTransformation} onValueChange={setSelectedTransformation}>
              <SelectTrigger id="select-transformation">
                <SelectValue placeholder="Choose a transformation" />
              </SelectTrigger>
              <SelectContent>
                {transformations.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          onClick={handleApplyTransformation}
          className="w-full"
          disabled={!selectedColumn || !selectedTransformation || isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size={16} className="mr-2" />
              Applying...
            </>
          ) : (
            "Apply Transformation (Demo)"
          )}
        </Button>
        <p className="text-sm text-destructive-foreground font-medium text-center">
          Note: These transformations are simulated for demonstration purposes. Real data manipulation requires a backend.
        </p>
      </CardContent>
    </Card>
  );
};

export default DataTransformation;