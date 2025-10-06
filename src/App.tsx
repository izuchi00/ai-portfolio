import React from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/layout/MainLayout";
import DataAnalysis from "./pages/DataAnalysis";
import WebScraping from "./pages/WebScraping";
import Contact from "./pages/Contact";
import About from "./pages/About";
import DataUpload from "./pages/DataUpload";
import TextAnalysis from "./pages/TextAnalysis";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;