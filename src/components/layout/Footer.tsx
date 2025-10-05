"use client";

import React from "react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground p-4 mt-8 shadow-inner">
      <div className="container mx-auto text-center text-sm">
        <p>&copy; {new Date().getFullYear()} My AI Portfolio. All rights reserved.</p>
        <p className="mt-1">
          Built with <a href="https://www.dyad.sh/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary-foreground/80">Dyad</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;