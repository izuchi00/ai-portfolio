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
      {isMobile ? (
        <main className="flex-grow container mx-auto p-4">
          <Outlet />
        </main>
      ) : (
        <DesktopLayout />
      )}
      <Footer />
    </div>
  );
};

export default MainLayout;