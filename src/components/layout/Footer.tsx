"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Mail, Github, Linkedin, Sparkles } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="container mx-auto grid gap-10 px-4 py-10 md:grid-cols-[2fr,1fr,1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm uppercase tracking-[0.4em]">westconex</span>
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            Building intelligent, agentic data experiences that recruiters and operators can trust.
          </h3>
          <p className="text-sm text-muted-foreground">
            Every demo is a curated glimpse. Partner with me for production-grade automations, governance, and human-centred change management.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Navigation</h4>
          <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/data-analysis" className="hover:text-primary">Data Intelligence Studio</Link>
            <Link to="/templates" className="hover:text-primary">Mission templates</Link>
            <Link to="/web-scraping" className="hover:text-primary">Web intelligence demo</Link>
            <Link to="/about" className="hover:text-primary">About me</Link>
          </nav>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Connect</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <a href="mailto:westconex@gmail.com" className="flex items-center gap-2 hover:text-primary">
              <Mail className="h-4 w-4" /> westconex@gmail.com
            </a>
            <a href="https://github.com/westconex" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary">
              <Github className="h-4 w-4" /> github.com/westconex
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary">
              <Linkedin className="h-4 w-4" /> LinkedIn profile
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 bg-background/80 py-4 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} westconex. Crafted with React, TypeScript, and agentic AI workflows.
      </div>
    </footer>
  );
};

export default Footer;
