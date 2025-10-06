"use client";

import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
// DesktopLayout and useIsMobile are temporarily removed to simplify and isolate the error
// import DesktopLayout from "./DesktopLayout";
// import { useIsMobile } from "@/hooks/use-mobile";

const MainLayout = () => {
  // const isMobile = useIsMobile(); // Temporarily commented out

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;