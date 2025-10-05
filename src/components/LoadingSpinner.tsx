"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: number; // Size in pixels for width and height
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className, size = 20 }) => {
  return (
    <Loader2
      className={cn("animate-spin text-primary", className)}
      style={{ width: size, height: size }}
    />
  );
};

export default LoadingSpinner;