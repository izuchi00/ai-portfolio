"use client";

import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer"; // Import the new Footer component
import { MadeWithDyad } from "@/components/made-with-dyad";

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>
      <MadeWithDyad />
      <Footer /> {/* Add the Footer component here */}
    </div>
  );
};

export default MainLayout;