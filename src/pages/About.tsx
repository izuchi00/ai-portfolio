"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Github, Linkedin } from "lucide-react";

const About = () => {
  const skills = [
    "Generative AI",
    "Agentic AI",
    "Data Analysis",
    "Web Scraping",
    "Machine Learning",
    "React",
    "TypeScript",
    "Tailwind CSS",
    "Python",
    "SQL",
  ];

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src="/placeholder.svg" alt="Your Name" /> {/* Replace with your actual avatar image */}
            <AvatarFallback className="text-4xl font-bold">YN</AvatarFallback>
          </Avatar>
          <CardTitle className="text-4xl font-bold mb-2">Your Name</CardTitle>
          <CardDescription className="text-xl text-muted-foreground">
            Computer Science Graduate & AI Enthusiast
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-4 text-lg text-muted-foreground text-left">
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
          </div>

          <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-4 text-center">My Skills</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="px-4 py-2 text-md">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center space-y-4">
            <h3 className="text-2xl font-semibold mb-4">Let's Connect!</h3>
            <div className="flex justify-center space-x-4">
              <a href="https://linkedin.com/in/yourprofile" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="flex items-center gap-2">
                  <Linkedin className="h-5 w-5" /> LinkedIn
                </Button>
              </a>
              <a href="https://github.com/yourprofile" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="flex items-center gap-2">
                  <Github className="h-5 w-5" /> GitHub
                </Button>
              </a>
            </div>
            <Link to="/contact">
              <Button size="lg" className="text-lg px-8 py-6 mt-6">
                Contact Me
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;