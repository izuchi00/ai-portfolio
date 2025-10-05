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

      {/* About Me Section */}
      <section className="w-full py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-4xl font-bold text-primary text-center mb-12">About Me</h2>
          <Card className="p-8 max-w-4xl mx-auto text-left">
            <CardHeader>
              <CardTitle className="text-3xl font-semibold mb-4">Computer Science Graduate & AI Enthusiast</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg text-muted-foreground">
              <p>
                Hello! I'm a passionate Computer Science graduate with a strong foundation in algorithms, data structures, and software development. My journey into the world of Artificial Intelligence has equipped me with expertise in both generative and agentic AI paradigms.
              </p>
              <p>
                I thrive on transforming complex data challenges into innovative solutions. My goal is to leverage AI to automate tedious tasks, extract meaningful insights from vast datasets, and build intelligent systems that drive efficiency and growth for businesses.
              </p>
              <p>
                I am particularly interested in roles that involve:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Developing and deploying AI models for data analysis and prediction.</li>
                <li>Designing and implementing intelligent agents for automation and optimization.</li>
                <li>Building robust web scraping solutions for data acquisition.</li>
                <li>Creating intuitive data visualizations to communicate complex findings.</li>
              </ul>
              <p>
                Let's connect and explore how my skills can help your team overcome data hurdles and embrace the power of AI!
              </p>
              <div className="text-center mt-8">
                <Link to="/contact">
                  <Button size="lg" className="text-lg px-8 py-6">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;