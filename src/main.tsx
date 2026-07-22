import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { ToastProvider } from "@/components/ui/toast";
import { AppDataProvider } from "@/store/AppDataContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AppDataProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AppDataProvider>
    </BrowserRouter>
  </StrictMode>
);
