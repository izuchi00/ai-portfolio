"use client";

import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

type ChartDataValue = string | number | null | undefined;

interface ChartDataPoint {
  [key: string]: ChartDataValue;
}

interface ChartDisplayProps {
  chartType: string;
  data: ChartDataPoint[];
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
      case "ScatterChart":
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey={xAxisKey} name={xAxisKey} />
            <YAxis type="number" dataKey={yAxisKey} name={yAxisKey} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Legend />
            <Scatter data={data} name="Observations" fill="#6366F1" />
          </ScatterChart>
        );
      case "AreaChart":
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey={yAxisKey} stroke="#6366F1" fillOpacity={1} fill="url(#colorArea)" />
          </AreaChart>
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