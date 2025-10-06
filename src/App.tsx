import React, { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import LoadingSpinner from "./components/LoadingSpinner"; // Import LoadingSpinner

// Dynamically import page components
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DataAnalysis = lazy(() => import("./pages/DataAnalysis"));
const WebScraping = lazy(() => import("./pages/WebScraping"));
const Contact = lazy(() => import("./pages/Contact"));
const About = lazy(() => import("./pages/About"));
const DataUpload = lazy(() => import("./pages/DataUpload"));
const TextAnalysis = lazy(() => import("./pages/TextAnalysis"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={
          <div className="flex justify-center items-center min-h-screen">
            <LoadingSpinner size={40} />
            <span className="ml-3 text-lg text-muted-foreground">Loading application...</span>
          </div>
        }>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Index />} />
              <Route path="upload-data" element={<DataUpload />} />
              <Route path="data-analysis" element={<DataAnalysis />} />
              <Route path="text-analysis" element={<TextAnalysis />} />
              <Route path="web-scraping" element={<WebScraping />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;