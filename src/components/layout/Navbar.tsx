"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavbarProps {
  onMobileMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMobileMenuClick }) => {
  const isMobile = useIsMobile();

  return (
    <nav className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onMobileMenuClick} className="text-primary-foreground">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          )}
          <Link to="/" className="text-2xl font-bold">
            My AI Portfolio
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {/* On desktop, main navigation is in the sidebar, so only theme toggle here */}
          {!isMobile && <ThemeToggle />}
          {isMobile && <ThemeToggle />} {/* Keep theme toggle for mobile too */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;