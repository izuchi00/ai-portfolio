"use client";

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";

const DesktopLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Define sidebar sizes
  const collapsedSize = 3; // Corresponds to 56px width
  const expandedSize = 15; // Corresponds to 240px width

  const handleCollapseToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSidebarResize = (size: number) => {
    // If the user resizes the panel, update the collapsed state
    if (size <= collapsedSize + 1 && !isSidebarCollapsed) { // Add a small buffer for user interaction
      setIsSidebarCollapsed(true);
    } else if (size > collapsedSize + 1 && isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
    }
  };

  return (
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
      <ResizablePanel defaultSize={100 - expandedSize}>
        {/* Apply container styling here for desktop content */}
        <div className="h-full overflow-y-auto container mx-auto p-4">
          <Outlet />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default DesktopLayout;