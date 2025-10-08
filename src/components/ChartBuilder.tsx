"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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
  const chartTypes = ["BarChart", "LineChart", "PieChart"]; // Add more as needed

  const handleBuildClick = () => {
    if (selectedChartType && selectedXAxis && selectedYAxis && !isDemoLocked) {
      onBuildChart(selectedChartType, selectedXAxis, selectedYAxis);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Build Your Chart</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="chart-type">Chart Type</Label>
            <Select value={selectedChartType} onValueChange={setSelectedChartType}>
              <SelectTrigger id="chart-type">
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                {chartTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace("Chart", " Chart")}
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
      </CardContent>
    </Card>
  );
};

export default ChartBuilder;