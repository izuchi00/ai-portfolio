"use client";

import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Home,
  UploadCloud,
  BarChart2,
  FileText,
  Globe,
  Info,
  Mail,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: "Home", path: "/", icon: Home },
  { name: "Upload Data", path: "/upload-data", icon: UploadCloud },
  { name: "Data Analysis", path: "/data-analysis", icon: BarChart2 },
  { name: "Text Analysis", path: "/text-analysis", icon: FileText },
  { name: "Web Scraping", path: "/web-scraping", icon: Globe },
  { name: "About", path: "/about", icon: Info },
  { name: "Contact", path: "/contact", icon: Mail },
];

interface SidebarProps {
  isCollapsed: boolean;
  onCollapseToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onCollapseToggle }) => {
  const location = useLocation();

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-sidebar text-sidebar-foreground border-r transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[56px]" : "w-[240px]"
      )}
    >
      <div className="flex items-center justify-between h-14 px-3 border-b border-sidebar-border">
        {!isCollapsed && (
          <Link to="/" className="text-xl font-bold text-sidebar-primary">
            AI Portfolio
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onCollapseToggle}
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
      <nav className="flex-1 grid gap-1 p-2">
        {navItems.map((item) => (
          <Tooltip key={item.name}>
            <TooltipTrigger asChild>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  location.pathname === item.path
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground",
                  isCollapsed ? "justify-center" : ""
                )}
              >
                <item.icon className="h-5 w-5" />
                {!isCollapsed && item.name}
                <span className="sr-only">{item.name}</span>
              </Link>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">{item.name}</TooltipContent>}
          </Tooltip>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;