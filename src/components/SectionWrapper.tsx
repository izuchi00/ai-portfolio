"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center px-4 py-8", className)}>
      {children}
    </div>
  );
};

export default SectionWrapper;