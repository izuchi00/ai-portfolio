"use client";

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";

const DesktopLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const collapsedSize = 3;
  const expandedSize = 15;

  const handleCollapseToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSidebarResize = (size: number) => {
    if (size <= collapsedSize + 1 && !isSidebarCollapsed) {
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
        maxSize={20}
        collapsible={true}
        collapsedSize={collapsedSize}
        onCollapse={() => setIsSidebarCollapsed(true)}
        onExpand={() => setIsSidebarCollapsed(false)}
        onResize={handleSidebarResize}
        className={cn(
          "min-w-[56px] transition-all duration-300 ease-in-out",
          isSidebarCollapsed && "min-w-[56px]"
        )}
      >
        <Sidebar isCollapsed={isSidebarCollapsed} onCollapseToggle={handleCollapseToggle} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={100 - expandedSize}>
        <div className="h-full overflow-y-auto container mx-auto p-4">
          <Outlet />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default DesktopLayout;