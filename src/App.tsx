import React from "react"; // Explicitly importing React
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Temporarily commenting out all routes and MainLayout to isolate the parsing error
// import Index from "./pages/Index";
// import NotFound from "./pages/NotFound";
// import MainLayout from "./components/layout/MainLayout";
// import DataAnalysis from "./pages/DataAnalysis";
// import WebScraping from "./pages/WebScraping";
// import Contact from "./pages/Contact";
// import About from "./pages/About";
// import DataUpload from "./pages/DataUpload";
// import TextAnalysis from "./pages/TextAnalysis";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <div className="p-8 text-center text-2xl font-bold">
              Hello from a very basic App! If you see this, JSX parsing is working.
            </div>
          } />
          {/* All other routes are temporarily removed */}
          <Route path="*" element={
            <div className="p-8 text-center text-2xl font-bold text-red-500">
              404 - Page Not Found (Temporary)
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;