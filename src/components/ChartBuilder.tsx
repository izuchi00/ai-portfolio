"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface ChartBuilderProps {
  headers: string[];
  onBuildChart: (chartType: string, xAxis: string, yAxis: string) => void;
  selectedChartType: string;
  setSelectedChartType: (type: string) => void;
  selectedXAxis: string;
  setSelectedXAxis: (axis: string) => void;
  selectedYAxis: string;
  setSelectedYAxis: (axis: string) => void;
  isDemoLocked?: boolean;
  lockMessage?: string;
}

const chartTypeOptions = [
  { value: "BarChart", label: "Bar", description: "Compare categorical groupings or cohorts." },
  { value: "LineChart", label: "Line", description: "Trend data over time or ranked sequences." },
  { value: "ScatterChart", label: "Scatter", description: "Show relationships between two numerical variables." },
  { value: "AreaChart", label: "Area", description: "Highlight cumulative progression with filled areas." },
  { value: "PieChart", label: "Pie", description: "Communicate proportional breakdowns." },
];

const ChartBuilder: React.FC<ChartBuilderProps> = ({
  headers,
  onBuildChart,
  selectedChartType,
  setSelectedChartType,
  selectedXAxis,
  setSelectedXAxis,
  selectedYAxis,
  setSelectedYAxis,
  isDemoLocked,
  lockMessage,
}) => {
  const handleBuildClick = () => {
    if (selectedChartType && selectedXAxis && selectedYAxis && !isDemoLocked) {
      onBuildChart(selectedChartType, selectedXAxis, selectedYAxis);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Build a Visual Insight</CardTitle>
        <CardDescription className="mt-2 text-center text-sm text-muted-foreground">
          Select a chart type, map your columns, then generate a ready-to-share insight.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="chart-type">Chart Type</Label>
            <Select value={selectedChartType} onValueChange={setSelectedChartType}>
              <SelectTrigger id="chart-type">
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                {chartTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col text-left">
                      <span className="font-medium">{option.label} chart</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="x-axis">X-Axis Column</Label>
            <Select value={selectedXAxis} onValueChange={setSelectedXAxis}>
              <SelectTrigger id="x-axis">
                <SelectValue placeholder="Select X-axis" />
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
            <Label htmlFor="y-axis">Y-Axis Column</Label>
            <Select value={selectedYAxis} onValueChange={setSelectedYAxis}>
              <SelectTrigger id="y-axis">
                <SelectValue placeholder="Select Y-axis" />
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
        </div>
        <Button
          onClick={handleBuildClick}
          className="w-full"
          disabled={!selectedChartType || !selectedXAxis || !selectedYAxis || isDemoLocked}
        >
          {isDemoLocked ? "Demo Limit Reached" : "Generate Chart"}
        </Button>
        {isDemoLocked && lockMessage && (
          <p className="text-xs text-muted-foreground text-center">{lockMessage}</p>
        )}
        {!isDemoLocked && (
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="flex items-center gap-1 rounded-full px-3 py-1">
              <Info className="h-3 w-3" /> Use the export buttons to save as PNG, SVG, or PDF.
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartBuilder;