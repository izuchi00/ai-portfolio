"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Data Analysis", path: "/data-analysis" },
  { name: "Web Scraping", path: "/web-scraping" },
  { name: "About", path: "/about" }, // Add the new About link
  { name: "Contact", path: "/contact" },
];

const Navbar = () => {
  const isMobile = useIsMobile();

  return (
    <nav className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          My AI Portfolio
        </Link>

        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px] bg-background text-foreground p-4">
              <h2 className="text-xl font-semibold mb-4">Navigation</h2>
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => (
                  <Link key={item.name} to={item.path} className="text-lg hover:text-primary transition-colors">
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4">
                  <ThemeToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex items-center space-x-6">
            {navItems.map((item) => (
              <Link key={item.name} to={item.path} className="text-lg hover:underline transition-colors">
                {item.name}
              </Link>
            ))}
            <ThemeToggle />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;