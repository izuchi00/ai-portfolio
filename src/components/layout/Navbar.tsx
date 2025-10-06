"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import Sidebar from "./Sidebar";

const Navbar: React.FC = () => {
  const isMobile = useIsMobile();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleMobileSidebarToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <nav className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={handleMobileSidebarToggle} className="text-primary-foreground">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          )}
          <Link to="/" className="text-2xl font-bold">
            AI Portfolio
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
        </div>
      </div>

      {isMobile && (
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent side="left" className="p-0 w-[250px] sm:w-[300px]">
            {/* For mobile, the sidebar should always be uncollapsed, and its toggle button should close the sheet */}
            <Sidebar isCollapsed={false} onCollapseToggle={() => setIsMobileSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
      )}
    </nav>
  );
};

export default Navbar;