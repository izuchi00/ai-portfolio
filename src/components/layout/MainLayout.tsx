"use client";

import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useIsMobile } from "@/hooks/use-mobile"; // Still needed for potential future use or other components

const MainLayout = () => {
  // The useIsMobile hook is kept here for now, but its logic is not directly used in the return for simplification.
  // It can be re-integrated or removed if not needed after the fix.
  const isMobile = useIsMobile(); 

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