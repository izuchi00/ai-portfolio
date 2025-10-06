import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
// Temporarily removing ThemeProvider to simplify and isolate the error
// import { ThemeProvider } from "./components/layout/ThemeProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* <ThemeProvider defaultTheme="system" attribute="class"> */}
      <App />
    {/* </ThemeProvider> */}
  </React.StrictMode>
);