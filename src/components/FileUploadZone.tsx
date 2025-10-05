"use client";

import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  acceptedFileTypes?: string;
  className?: string;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileSelect,
  acceptedFileTypes = ".csv,.xlsx,.xls",
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [onFileSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors",
        isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/50 bg-muted/20",
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <UploadCloud className={cn("h-12 w-12 mb-4", isDragging ? "text-primary" : "text-muted-foreground")} />
      <p className="text-lg font-medium text-center mb-2">
        {isDragging ? "Drop your file here" : "Drag & drop your file here"}
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        or
      </p>
      <div className="relative w-full max-w-xs">
        <Label htmlFor="file-upload" className="sr-only">Upload file</Label>
        <Input
          id="file-upload"
          type="file"
          accept={acceptedFileTypes}
          onChange={handleFileChange}
          className="cursor-pointer block w-full text-sm text-muted-foreground
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-primary file:text-primary-foreground
            hover:file:bg-primary/90"
        />
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Accepted: {acceptedFileTypes.split(',').map(type => type.toUpperCase().replace('.', '')).join(', ')}
      </p>
    </div>
  );
};

export default FileUploadZone;