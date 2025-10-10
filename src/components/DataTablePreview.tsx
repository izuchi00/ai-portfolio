"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DataTablePreviewProps {
  data: Record<string, unknown>[];
  headers: string[];
}

const formatCellValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "number") {
    const isInteger = Number.isInteger(value);
    return isInteger ? value.toString() : value.toFixed(3);
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.error("Unable to stringify table cell value", error);
      return String(value);
    }
  }

  return String(value);
};

const DataTablePreview: React.FC<DataTablePreviewProps> = ({ data, headers }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-muted-foreground">No data to display.</p>;
  }

  return (
    <ScrollArea className="h-[400px] w-full rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header} className="whitespace-nowrap">{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.slice(0, 50).map((row, rowIndex) => ( // Limit to first 50 rows for preview
            <TableRow key={rowIndex}>
              {headers.map((header) => (
                <TableCell key={`${rowIndex}-${header}`} className="whitespace-nowrap">
                  {formatCellValue(row[header])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {data.length > 50 && (
        <div className="p-2 text-center text-sm text-muted-foreground border-t">
          Showing first 50 rows of {data.length} total rows.
        </div>
      )}
    </ScrollArea>
  );
};

export default DataTablePreview;