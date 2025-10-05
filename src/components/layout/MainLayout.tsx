"use client";

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { MadeWithDyad } from "@/components/made-with-dyad";
import Sidebar from "./Sidebar"; // Import the new Sidebar component
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet"; // Import Sheet components

const MainLayout = () => {
  const isMobile = useIsMobile();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleCollapseToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleMobileSidebarToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
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
        <MadeWithDyad />
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
          defaultSize={isSidebarCollapsed ? 3 : 15}
          minSize={isSidebarCollapsed ? 3 : 15}
          maxSize={isSidebarCollapsed ? 3 : 20}
          collapsible={true}
          collapsedSize={3}
          onCollapse={() => setIsSidebarCollapsed(true)}
          onExpand={() => setIsSidebarCollapsed(false)}
          className={cn(
            "min-w-[56px] transition-all duration-300 ease-in-out",
            isSidebarCollapsed && "min-w-[56px]"
          )}
        >
          <Sidebar isCollapsed={isSidebarCollapsed} onCollapseToggle={handleCollapseToggle} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={85}>
          <main className="flex-grow container mx-auto p-4">
            <Outlet />
          </main>
        </ResizablePanel>
      </ResizablePanelGroup>
      <MadeWithDyad />
      <Footer />
    </div>
  );
};

export default MainLayout;