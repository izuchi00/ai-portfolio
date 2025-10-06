"use client";

import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import DesktopLayout from "./DesktopLayout";
import { useIsMobile } from "@/hooks/use-mobile";

const MainLayout = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow flex"> {/* This flex container holds the sidebar (if desktop) and the main content */}
        {!isMobile && <DesktopLayout />}
        <main className="flex-grow container mx-auto p-4"> {/* This main tag now consistently wraps the content */}
          {isMobile ? <Outlet /> : null} {/* Outlet for mobile is here */}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;