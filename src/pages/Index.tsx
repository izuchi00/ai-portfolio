"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-[calc(100vh-150px)] flex flex-col items-center justify-center text-center px-4 py-8">
      <h1 className="text-5xl md:text-6xl font-extrabold text-primary mb-6 leading-tight">
        Innovate with AI: Your Data, Our Intelligence
      </h1>
      <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl">
        Showcasing cutting-edge generative and agentic AI solutions for data processing, advanced analytics, and intelligent web scraping.
        Transform raw data into actionable insights and unlock new possibilities.
      </p>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
        <Link to="/data-analysis">
          <Button size="lg" className="text-lg px-8 py-6">
            Explore Data Analysis
          </Button>
        </Link>
        <Link to="/web-scraping">
          <Button size="lg" variant="outline" className="text-lg px-8 py-6">
            Try Web Scraping
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;