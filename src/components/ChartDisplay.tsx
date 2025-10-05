"use client";

import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

interface ChartDisplayProps {
  chartType: string;
  data: Record<string, any>[];
  xAxisKey: string;
  yAxisKey: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF", "#FF6F61"];

const ChartDisplay: React.FC<ChartDisplayProps> = ({ chartType, data, xAxisKey, yAxisKey }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center">
        <CardContent>
          <p className="text-muted-foreground">No data available to display chart.</p>
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case "BarChart":
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={yAxisKey} fill="#8884d8" />
          </BarChart>
        );
      case "LineChart":
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={yAxisKey} stroke="#82ca9d" activeDot={{ r: 8 }} />
          </LineChart>
        );
      case "PieChart":
        // For PieChart, yAxisKey will represent the value, xAxisKey will represent the category
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={yAxisKey}
              nameKey={xAxisKey}
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
      default:
        return <p className="text-muted-foreground">Select a chart type to visualize your data.</p>;
    }
  };

  return (
    <Card className="w-full h-[400px] p-4">
      <CardContent className="h-full w-full p-0">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ChartDisplay;