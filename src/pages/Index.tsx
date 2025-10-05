"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, Bot, BarChart } from "lucide-react"; // Icons for the new section

const Index = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-8">
      {/* Hero Section */}
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

      {/* Our AI Approach Section */}
      <section className="w-full py-12 md:py-20 bg-muted/40">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-4xl font-bold text-primary text-center mb-12">Our AI Approach</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="flex flex-col items-center p-6 text-center">
              <Brain className="h-12 w-12 text-primary mb-4" />
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Generative AI</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Leverage advanced generative models to create synthetic data, automate content generation, and enhance data augmentation for robust analysis.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="flex flex-col items-center p-6 text-center">
              <Bot className="h-12 w-12 text-primary mb-4" />
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Agentic AI</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Deploy intelligent agents that autonomously perform complex tasks like data cleaning, feature engineering, and multi-step web scraping.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="flex flex-col items-center p-6 text-center">
              <BarChart className="h-12 w-12 text-primary mb-4" />
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Data-Driven Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Transform raw data into actionable intelligence with AI-powered analytics, predictive modeling, and intuitive data visualizations.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;