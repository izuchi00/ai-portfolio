"use client";

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Sidebar from "./Sidebar"; // Import the new Sidebar component
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet"; // Import Sheet components
import { cn } from "@/lib/utils"; // Import cn utility

const MainLayout = () => {
  const isMobile = useIsMobile();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Define sidebar sizes
  const collapsedSize = 3; // Corresponds to 56px width
  const expandedSize = 15; // Corresponds to 240px width

  const handleCollapseToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleMobileSidebarToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleSidebarResize = (size: number) => {
    // If the user resizes the panel, update the collapsed state
    if (size <= collapsedSize + 1 && !isSidebarCollapsed) { // Add a small buffer for user interaction
      setIsSidebarCollapsed(true);
    } else if (size > collapsedSize + 1 && isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
    }
  };

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar onMobileMenuClick={handleMobileSidebarToggle} />
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent side="left" className="p-0 w-[250px] sm:w-[300px]">
            <Sidebar isCollapsed={false} onCollapseToggle={handleMobileSidebarToggle} />
          </SheetContent>
        </Sheet>
        <main className="flex-grow container mx-auto p-4">
          <Outlet />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onMobileMenuClick={handleMobileSidebarToggle} /> {/* Keep Navbar for branding/theme */}
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-grow"
      >
        <ResizablePanel
          size={isSidebarCollapsed ? collapsedSize : expandedSize}
          minSize={collapsedSize}
          maxSize={20} // Allow manual resize up to 20%
          collapsible={true}
          collapsedSize={collapsedSize}
          onCollapse={() => setIsSidebarCollapsed(true)}
          onExpand={() => setIsSidebarCollapsed(false)}
          onResize={handleSidebarResize} // Handle manual resizing
          className={cn(
            "min-w-[56px] transition-all duration-300 ease-in-out",
            isSidebarCollapsed && "min-w-[56px]"
          )}
        >
          <Sidebar isCollapsed={isSidebarCollapsed} onCollapseToggle={handleCollapseToggle} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={100 - expandedSize}> {/* Adjust default size for main content */}
          <main className="flex-grow container mx-auto p-4">
            <Outlet />
          </main>
        </ResizablePanel>
      </ResizablePanelGroup>
      <Footer />
    </div>
  );
};

export default MainLayout;